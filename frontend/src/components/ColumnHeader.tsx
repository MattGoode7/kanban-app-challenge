import React, { useState } from 'react';

type ColumnHeaderProps = {
  name: string;
  cardsCount: number;
  isEditing: boolean;
  editedName: string;
  setEditedName: (name: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  onEditSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  name,
  cardsCount,
  isEditing,
  editedName,
  setEditedName,
  isMenuOpen,
  setIsMenuOpen,
  setIsEditing,
  onEditSubmit,
  onCancel,
  onDelete
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEditSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 flex-shrink-0">
      {isEditing ? (
        <div className="flex-1 mr-2">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onCancel}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-white"
            autoFocus
          />
        </div>
      ) : (
        <h3 className="text-lg font-semibold text-white truncate flex-1">{name}</h3>
      )}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-blue-200 bg-blue-500/20 px-2 py-1 rounded-full flex-shrink-0">
          {cardsCount}
        </span>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 z-10">
              <div className="py-1 flex flex-col gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={onEditSubmit}
                      className="w-full text-left px-4 py-2 text-sm text-white bg-transparent hover:bg-blue-600/30 rounded-lg transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={onCancel}
                      className="w-full text-left px-4 py-2 text-sm text-white/70 bg-transparent hover:bg-white/20 rounded-lg transition-colors"
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
                      className="w-full text-left px-4 py-2 text-sm text-white bg-transparent hover:bg-blue-600/30 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 bg-transparent hover:bg-red-600/30 rounded-lg transition-colors"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColumnHeader; 