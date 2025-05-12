// src/components/Board.tsx
import React, { useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import type { Board as BoardType, Column as ColumnType, Card } from '../services/api';
import { useSocket } from '../context/SocketContext';

type BoardProps = {
  board: BoardType;
  onBoardUpdate?: (updatedBoard: BoardType) => void;
};

const BoardComponent: React.FC<BoardProps> = ({ board, onBoardUpdate }) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleCardMoved = (data: { 
      cardId: string;
      sourceColumnId: string;
      destinationColumnId: string;
      card: Card;
    }) => {
      console.log('Card moved event received:', data);
      if (onBoardUpdate) {
        // Crear una copia profunda del tablero
        const updatedBoard = JSON.parse(JSON.stringify(board));
        
        // Encontrar y actualizar la tarjeta en las columnas
        updatedBoard.columns = updatedBoard.columns.map((column: ColumnType) => {
          // Si es la columna origen, remover la tarjeta
          if (column._id === data.sourceColumnId) {
            return {
              ...column,
              cards: column.cards.filter((card: Card) => card._id !== data.cardId)
            };
          }
          // Si es la columna destino, reemplazar o agregar la tarjeta
          if (column._id === data.destinationColumnId) {
            const existingCardIndex = column.cards.findIndex((card: Card) => card._id === data.cardId);
            if (existingCardIndex !== -1) {
              // Si la tarjeta ya existe, reemplazarla
              const newCards = [...column.cards];
              newCards[existingCardIndex] = data.card;
              return {
                ...column,
                cards: newCards
              };
            } else {
              // Si no existe, agregarla
              return {
                ...column,
                cards: [...column.cards, data.card]
              };
            }
          }
          // Para otras columnas, mantenerlas sin cambios
          return column;
        });

        onBoardUpdate(updatedBoard);
      }
    };

    const handleColumnCreated = (newColumn: ColumnType) => {
      if (onBoardUpdate) {
        const updatedBoard = JSON.parse(JSON.stringify(board));
        updatedBoard.columns = [...updatedBoard.columns, newColumn];
        onBoardUpdate(updatedBoard);
      }
    };

    const handleCardUpdated = (updatedCard: Card) => {
      if (onBoardUpdate) {
        const updatedBoard = JSON.parse(JSON.stringify(board));
        updatedBoard.columns = updatedBoard.columns.map((column: ColumnType) => {
          const cardIndex = column.cards.findIndex((card: Card) => card._id === updatedCard._id);
          if (cardIndex !== -1) {
            column.cards[cardIndex] = updatedCard;
          }
          return column;
        });
        onBoardUpdate(updatedBoard);
      }
    };

    const handleCardDeleted = (cardId: string) => {
      if (onBoardUpdate) {
        const updatedBoard = JSON.parse(JSON.stringify(board));
        updatedBoard.columns = updatedBoard.columns.map((column: ColumnType) => {
          column.cards = column.cards.filter((card: Card) => card._id !== cardId);
          return column;
        });
        onBoardUpdate(updatedBoard);
      }
    };

    socket.on('cardMoved', handleCardMoved);
    socket.on('columnCreated', handleColumnCreated);
    socket.on('cardUpdated', handleCardUpdated);
    socket.on('cardDeleted', handleCardDeleted);

    return () => {
      socket.off('cardMoved', handleCardMoved);
      socket.off('columnCreated', handleColumnCreated);
      socket.off('cardUpdated', handleCardUpdated);
      socket.off('cardDeleted', handleCardDeleted);
    };
  }, [socket, board, onBoardUpdate]);

  if (!board || !board.columns) {
    return null;
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Extraer el ID de la tarjeta del draggableId compuesto
    const cardId = draggableId.split('-')[1];

    if (!socket) {
      console.error('No hay conexión con el servidor');
      return;
    }

    socket.emit('moveCard', {
      cardId,
      sourceColumnId: source.droppableId,
      destinationColumnId: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index
    });
  };

  const handleEditCard = async (cardId: string, title: string, description: string) => {
    if (!socket) return;

    socket.emit('updateCard', {
      cardId,
      updates: { title, description }
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!socket) return;

    socket.emit('deleteCard', cardId);
  };

  const handleEditColumn = async (columnId: string, name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('No hay conexión con el servidor'));
        return;
      }

      socket.emit('updateColumn', {
        columnId,
        name
      }, (response: { error?: string; column?: ColumnType }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  const handleDeleteColumn = async (columnId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('No hay conexión con el servidor'));
        return;
      }

      socket.emit('deleteColumn', {
        columnId
      }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="relative w-full">
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-12rem)]">
          {board.columns.map((column) => (
            <Column
              key={column._id}
              name={column.name}
              cards={column.cards}
              columnId={column._id}
              onEditCard={(cardId, title, description) => handleEditCard(cardId, title, description)}
              onDeleteCard={handleDeleteCard}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-900/50 pointer-events-none"></div>
      </div>
    </DragDropContext>
  );
};

export default BoardComponent;
