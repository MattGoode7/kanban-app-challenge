import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Card from './Card';
import type { Card as CardType } from '../services/api';

type DraggableCardProps = {
  card: CardType;
  index: number;
  columnId: string;
};

const DraggableCard: React.FC<DraggableCardProps> = ({ card, index, columnId }) => {
  // Creamos una key única combinando el ID de la columna, el ID de la tarjeta y el índice
  const uniqueKey = `${columnId}-${card._id}-${index}`;
  const draggableId = `${columnId}-${card._id}`;

  return (
    <Draggable 
      key={uniqueKey}
      draggableId={draggableId}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            cursor: 'grab',
          }}
          className={`mb-3 $${
            snapshot.isDragging 
              ? 'opacity-90 shadow-xl scale-[1.02]' 
              : 'hover:shadow-md transition-all duration-200'
          }`}
        >
          <Card
            title={card.title || ''}
            description={card.description || ''}
          />
        </div>
      )}
    </Draggable>
  );
};

export default DraggableCard; 