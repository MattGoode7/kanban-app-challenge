import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import type { Board } from '../types';
import BoardCard from '../components/BoardCard';
import { authApi } from '../services/api';

const Home: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const navigate = useNavigate();
  const { socket } = useSocket();
  const user = authApi.getCurrentUser();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  useEffect(() => {
    if (socket) {
      setLoading(true);
      // Solicitar la lista de tableros al conectarse
      socket.emit('getBoards', (response: { error?: string; boards?: Board[] }) => {
        if (response.error) {
          setError(response.error);
        } else if (response.boards) {
          setBoards(response.boards);
        }
        setLoading(false);
      });

      // Escuchar eventos de actualización de tableros
      socket.on('boardCreated', (board: Board) => {
        setBoards(prev => [...prev, board]);
      });

      socket.on('boardUpdated', (updatedBoard: Board) => {
        console.log('Board updated:', updatedBoard);
        setBoards(prev => prev.map(board => 
          board._id === updatedBoard._id ? updatedBoard : board
        ));
      });

      socket.on('boardDeleted', (data: { boardId: string }) => {
        console.log('Board deleted:', data);
        setBoards(prev => prev.filter(board => board._id !== data.boardId));
      });

      return () => {
        socket.off('boardCreated');
        socket.off('boardUpdated');
        socket.off('boardDeleted');
      };
    }
  }, [socket]);

  const handleEditBoard = async (boardId: string, name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('No hay conexión con el servidor'));
        return;
      }

      socket.emit('updateBoard', {
        boardId,
        updates: { name }
      }, (response: { error?: string; board?: Board }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  const handleDeleteBoard = async (boardId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('No hay conexión con el servidor'));
        return;
      }

      socket.emit('deleteBoard', {
        boardId
      }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      setError('El nombre del tablero es requerido');
      return;
    }

    if (!socket) {
      setError('No hay conexión con el servidor');
      return;
    }

    try {
      socket.emit('createBoard', {
        name: newBoardName,
        description: newBoardDescription
      }, (response: { error?: string; board?: Board }) => {
        if (response.error) {
          setError(response.error);
        } else if (response.board) {
          setBoards(prevBoards => [...prevBoards, response.board!]);
          setIsCreatingBoard(false);
          setNewBoardName('');
          setNewBoardDescription('');
          setError(null);
        }
      });
    } catch (error) {
      setError('Error al crear el tablero');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200/20 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-6">
                    <div className="h-48 bg-gray-200/20 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200/20 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
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
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Bienvenido a Kanban
              </h1>
              <p className="text-blue-200">Organiza tus proyectos de manera eficiente</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {user && (
                <span className="text-white/80 text-sm px-2 py-1 rounded-lg bg-white/10 mb-1">{user.name}</span>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Cerrar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-400/20 border border-red-200/20 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Mis Tableros
              </h2>
              <button
                onClick={() => setIsCreatingBoard(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Nuevo Tablero</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <BoardCard
                  key={board._id}
                  board={board}
                  onEditBoard={handleEditBoard}
                  onDeleteBoard={handleDeleteBoard}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {isCreatingBoard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Crear Nuevo Tablero</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="boardName" className="block text-sm font-medium text-white mb-2">
                  Nombre del Tablero
                </label>
                <input
                  type="text"
                  id="boardName"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Ingresa el nombre del tablero"
                />
              </div>
              <div>
                <label htmlFor="boardDescription" className="block text-sm font-medium text-white mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  id="boardDescription"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Ingresa una descripción para el tablero"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreatingBoard(false);
                    setNewBoardName('');
                    setNewBoardDescription('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateBoard}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Crear Tablero
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 