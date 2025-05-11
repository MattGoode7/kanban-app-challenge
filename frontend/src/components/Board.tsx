// src/components/Board.tsx
import React from 'react';
import Column from './Column';
import type { Board } from '../services/api';

type BoardProps = {
  board: Board;
};

const BoardComponent: React.FC<BoardProps> = ({ board }) => {
  if (!board || !board.columns) {
    return null;
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-4 min-h-[calc(100vh-4rem)]">
      {board.columns.map((column) => (
        <Column
          key={column._id}
          name={column.name}
          cards={column.cards || []}
          columnId={column._id}
        />
      ))}
    </div>
  );
};

export default BoardComponent;
