import React from 'react';
import DroppableArea from './DroppableArea';
import DraggableCard from './DraggableCard';
import type { Card as CardType } from '../services/api';

type ColumnCardsProps = {
  columnId: string;
  cards: CardType[];
};

const ColumnCards: React.FC<ColumnCardsProps> = ({ columnId, cards }) => {
  return (
    <DroppableArea droppableId={columnId}>
      {cards.map((card, index) => (
        <DraggableCard key={`${columnId}-${card._id}-${index}`} card={card} index={index} columnId={columnId} />
      ))}
    </DroppableArea>
  );
};

export default ColumnCards; 