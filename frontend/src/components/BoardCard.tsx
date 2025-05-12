import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Board } from '../types';
import ModalConfirm from './ModalConfirm';

interface BoardCardProps {
  board: Board;
  onEditBoard: (boardId: string, name: string) => Promise<void>;
  onDeleteBoard: (boardId: string) => Promise<void>;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onEditBoard, onDeleteBoard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(board.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handleEditSubmit = async () => {
    if (!editedName.trim()) {
      setEditedName(board.name);
      setIsEditing(false);
      return;
    }

    try {
      await onEditBoard(board._id, editedName);
      setIsEditing(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error al editar el tablero:', error);
      setEditedName(board.name);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedName(board.name);
      setIsEditing(false);
      setIsMenuOpen(false);
    }
  };

  const handleCancel = () => {
    setEditedName(board.name);
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    try {
      await onDeleteBoard(board._id);
    } catch (error) {
      console.error('Error al eliminar el tablero:', error);
    }
    setShowDeleteModal(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Si estamos editando o el menú está abierto, no navegar
    if (isEditing || isMenuOpen) {
      e.preventDefault();
      return;
    }
    navigate(`/board/${board._id}`);
  };

  return (
    <div className="relative group">
      <div 
        className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:bg-white/20 transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="aspect-video bg-gradient-to-r from-blue-500/50 to-purple-500/50 group-hover:from-blue-500/70 group-hover:to-purple-500/70 transition-all duration-200"></div>
        <div className="p-6">
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCancel}
              autoFocus
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-white text-lg font-semibold"
            />
          ) : (
            <>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-blue-900/80 to-purple-900/80 shadow-xl rounded-xl border border-white/20 z-10 p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleEditSubmit}
                            className="w-full text-left px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-blue-600/80 text-white transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancel}
                            className="w-full text-left px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-gray-600/80 text-white transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-blue-600/80 text-white transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm rounded-lg bg-red-600/80 hover:bg-red-700 text-white transition-colors font-semibold shadow-md"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{board.name}</h3>
                {board.description && (
                  <p className="text-white/80 text-sm mb-2 line-clamp-2">{board.description}</p>
                )}
                <p className="text-blue-200 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                  </svg>
                  <span>{board.columns?.length || 0} columnas</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <ModalConfirm
        open={showDeleteModal}
        title="Eliminar tablero"
        description="¿Estás seguro de que deseas eliminar este tablero? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BoardCard; 