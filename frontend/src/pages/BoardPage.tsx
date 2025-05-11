// src/pages/BoardPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import BoardComponent from '../components/Board';
import { boardsApi } from '../services/api';
import type { Board, Column, Card } from '../services/api';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { socket, isConnected, isConnecting } = useSocket();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);

  // Efecto para cargar el tablero
  useEffect(() => {
    if (!boardId) return;

    const fetchBoard = async () => {
      try {
        const data = await boardsApi.getBoard(boardId);
        console.log('Board data:', data);
        setBoard(data);
      } catch (err: any) {
        console.error('Error fetching board:', err);
        setError(err.message || 'Error al cargar el tablero');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // Efecto para manejar la conexión del socket
  useEffect(() => {
    if (!socket || !boardId || !isConnected) {
      return;
    }

    // Solo unirse al tablero si no lo hemos hecho antes
    if (!hasJoinedRef.current) {
      console.log('Uniéndose al tablero:', boardId);
      socket.emit('join_board', boardId);
      hasJoinedRef.current = true;
    }

    // Manejar actualizaciones del tablero
    socket.on('board_updated', (updatedBoard: Board) => {
      console.log('Board updated event received:', updatedBoard);
      setBoard(updatedBoard);
    });

    // Manejar actualizaciones de columnas
    socket.on('columnCreated', (column: Column) => {
      console.log('Column created event received:', column);
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: [...prev.columns, column]
        };
      });
    });

    socket.on('columnUpdated', (updatedColumn: Column) => {
      console.log('Column updated event received:', updatedColumn);
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(col => 
            col._id === updatedColumn._id ? updatedColumn : col
          )
        };
      });
    });

    socket.on('columnDeleted', (columnId: string) => {
      console.log('Column deleted event received:', columnId);
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.filter(col => col._id !== columnId)
        };
      });
    });

    // Manejar actualizaciones de tarjetas
    socket.on('cardCreated', (card: Card) => {
      console.log('Card created event received:', card);
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(col => {
            if (col._id === card.columnId) {
              return {
                ...col,
                cards: [...(col.cards || []), card]
              };
            }
            return col;
          })
        };
      });
    });

    socket.on('cardUpdated', (updatedCard: Card) => {
      console.log('Card updated event received:', updatedCard);
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(col => ({
            ...col,
            cards: (col.cards || []).map(card => 
              card._id === updatedCard._id ? updatedCard : card
            )
          }))
        };
      });
    });

    socket.on('cardDeleted', (cardId: string) => {
      console.log('Card deleted event received:', cardId);
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(col => ({
            ...col,
            cards: (col.cards || []).filter(card => card._id !== cardId)
          }))
        };
      });
    });

    return () => {
      console.log('Limpiando listeners del socket');
      socket.off('board_updated');
      socket.off('columnCreated');
      socket.off('columnUpdated');
      socket.off('columnDeleted');
      socket.off('cardCreated');
      socket.off('cardUpdated');
      socket.off('cardDeleted');
      // No emitimos leave_board aquí para mantener la conexión
    };
  }, [socket, boardId, isConnected]);

  if (loading || isConnecting) {
    return (
      <div className="h-screen bg-gray-50">
        <header className="bg-white shadow p-4">
          <h1 className="text-2xl font-bold">Cargando tablero...</h1>
        </header>
        <main className="p-4">
          <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 p-4 rounded w-80 flex-shrink-0 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50">
        <header className="bg-white shadow p-4">
          <h1 className="text-2xl font-bold">Error</h1>
        </header>
        <main className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-screen bg-gray-50">
        <header className="bg-white shadow p-4">
          <h1 className="text-2xl font-bold">Tablero no encontrado</h1>
        </header>
        <main className="p-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            El tablero solicitado no existe
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">{board.name}</h1>
      </header>
      <main>
        <BoardComponent board={board} />
      </main>
    </div>
  );
};

export default BoardPage;
