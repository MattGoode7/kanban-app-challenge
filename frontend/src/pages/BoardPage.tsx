// src/pages/BoardPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import BoardComponent from '../components/Board';
import { boardsApi } from '../services/api';
import type { Board, Column, Card } from '../services/api';
import AddColumn from '../components/AddColumn';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected, isConnecting } = useSocket();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = async (name: string) => {
    if (!socket || !board) {
      console.error('No hay conexión o el tablero no está cargado');
      return;
    }

    socket.emit('createColumn', {
      boardId: board._id,
      name
    }, (response: { error?: string; column?: Column }) => {
      if (response.error) {
        console.error('Error al crear columna:', response.error);
      }
    });
  };

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

    socket.on('cardMoved', ({ card, sourceColumnId, destinationColumnId }) => {
      console.log('Card moved event received:', { card, sourceColumnId, destinationColumnId });
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(col => {
            if (col._id === sourceColumnId) {
              return {
                ...col,
                cards: col.cards.filter(c => c._id !== card._id)
              };
            }
            if (col._id === destinationColumnId) {
              return {
                ...col,
                cards: [...col.cards, card]
              };
            }
            return col;
          })
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
      socket.off('cardMoved');
    };
  }, [socket, boardId, isConnected]);

  if (loading || isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200/20 rounded w-1/4 mb-8"></div>
              <div className="flex gap-4 overflow-x-auto">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100/20 p-4 rounded-lg w-80 flex-shrink-0"
                  >
                    <div className="h-6 bg-gray-200/20 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      {[1, 2].map((j) => (
                        <div key={j} className="h-20 bg-gray-200/20 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="bg-red-400/20 border border-red-200/20 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="bg-yellow-400/20 border border-yellow-200/20 text-yellow-200 px-4 py-3 rounded-lg">
              El tablero solicitado no existe
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="mb-4 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Volver</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{board.name}</h1>
                <p className="text-blue-200">Gestiona tus tareas y proyectos</p>
              </div>
              {isAddingColumn ? (
                <AddColumn
                  onAdd={handleAddColumn}
                  onCancel={() => setIsAddingColumn(false)}
                />
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Agregar columna</span>
                </button>
              )}
            </div>
          </div>
          <BoardComponent board={board} onBoardUpdate={setBoard} />
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
