// src/components/Card.tsx
import React from 'react';

type CardProps = {
  title: string;
  description?: string;
};

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="bg-white p-2 rounded shadow mb-2">
      <h4 className="font-bold">{title}</h4>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
};

export default Card;
