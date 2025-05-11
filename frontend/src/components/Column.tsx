// src/components/Column.tsx
import React from 'react';
import Card from './Card';

type ColumnProps = {
  title: string;
  cards: { title: string; description?: string }[];
};

const Column: React.FC<ColumnProps> = ({ title, cards }) => {
  return (
    <div className="bg-gray-100 p-4 rounded w-80 flex-shrink-0">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {cards.map((card, index) => (
        <Card key={index} title={card.title} description={card.description} />
      ))}
    </div>
  );
};

export default Column;
