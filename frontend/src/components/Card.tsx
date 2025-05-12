// src/components/Card.tsx
import React, { useState } from 'react';

type CardProps = {
  title: string;
  description: string;
  onEdit?: (title: string, description: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const Card: React.FC<CardProps> = ({ title, description, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onEdit) return;

    setIsSubmitting(true);
    try {
      await onEdit(editedTitle.trim(), editedDescription.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error al editar tarjeta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error al eliminar tarjeta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleEdit} className="bg-white/5 rounded-lg p-3 space-y-2">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Título"
          className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Descripción"
          className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 resize-none"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 group relative">
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
      
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded"
                title="Eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
