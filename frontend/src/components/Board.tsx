// src/components/Board.tsx
import React from 'react';
import Column from './Column';

const Board: React.FC = () => {
  const columns = [
    {
      title: 'To Do',
      cards: [
        { title: 'Tarea 1', description: 'Descripción de la tarea 1' },
        { title: 'Tarea 2' },
      ],
    },
    {
      title: 'In Progress',
      cards: [{ title: 'Tarea 3', description: 'Descripción de la tarea 3' }],
    },
    {
      title: 'Done',
      cards: [{ title: 'Tarea 4' }],
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {columns.map((column, index) => (
        <Column key={index} title={column.title} cards={column.cards} />
      ))}
    </div>
  );
};

export default Board;
