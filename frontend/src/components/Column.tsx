// src/components/Column.tsx
import React, { useState } from 'react';
import ColumnHeader from './ColumnHeader';
import ColumnCards from './ColumnCards';
import ColumnFooter from './ColumnFooter';
import { useSocket } from '../context/SocketContext';
import type { Card as CardType } from '../services/api';

type ColumnProps = {
  name: string;
  cards: CardType[];
  columnId: string;
  onEditCard: (cardId: string, title: string, description: string) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  onEditColumn: (columnId: string, name: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
};

const Column: React.FC<ColumnProps> = ({ 
  name, 
  cards = [], 
  columnId,
  onEditColumn,
  onDeleteColumn
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { socket } = useSocket();

  const handleAddCard = (title: string, description: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('No hay conexión con el servidor'));
        return;
      }
      socket.emit('createCard', {
        columnId,
        title,
        description
      }, (response: { error?: string; card?: CardType }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  const handleEditSubmit = async () => {
    try {
      if (editedName.trim() === '') {
        setEditedName(name);
        setIsEditing(false);
        return;
      }
      await onEditColumn(columnId, editedName);
      setIsEditing(false);
      setIsMenuOpen(false);
    } catch (error) {
      setEditedName(name);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(name);
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta columna?')) {
      try {
        await onDeleteColumn(columnId);
      } catch (error) {
        // Manejo de error opcional
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl w-80 flex-shrink-0 border border-white/20 p-4 flex flex-col max-h-[calc(100vh-12rem)]">
      <ColumnHeader
        name={name}
        cardsCount={cards.length}
        isEditing={isEditing}
        editedName={editedName}
        setEditedName={setEditedName}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        setIsEditing={setIsEditing}
        onEditSubmit={handleEditSubmit}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        <ColumnCards columnId={columnId} cards={cards} />
      </div>
      <ColumnFooter
        isAddingCard={isAddingCard}
        setIsAddingCard={setIsAddingCard}
        handleAddCard={handleAddCard}
      />
    </div>
  );
};

export default Column;
