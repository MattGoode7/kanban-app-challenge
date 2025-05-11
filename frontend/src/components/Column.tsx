// src/components/Column.tsx
import React, { useState } from 'react';
import Card from './Card';
import { useSocket } from '../context/SocketContext';
import type { Card as CardType } from '../services/api';

type ColumnProps = {
  name: string;
  cards: CardType[];
  columnId: string;
};

const Column: React.FC<ColumnProps> = ({ name, cards = [], columnId }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const { socket } = useSocket();

  console.log(`Rendering column ${name} with cards:`, cards);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      socket?.emit('createCard', {
        columnId,
        title: newCardTitle.trim(),
        description: newCardDescription.trim()
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setIsAddingCard(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg w-80 flex-shrink-0 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
          {cards.length}
        </span>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <Card
            key={card._id}
            title={card.title}
            description={card.description}
          />
        ))}

        {isAddingCard ? (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Título de la tarjeta"
              className="w-full p-2 mb-2 border rounded text-sm"
            />
            <textarea
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full p-2 mb-2 border rounded text-sm"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingCard(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCard}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Agregar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors duration-200"
          >
            + Agregar tarjeta
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;
