// src/components/Card.tsx
import React from 'react';

type CardProps = {
  title: string;
  description?: string;
};

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      {description && (
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      )}
    </div>
  );
};

export default Card;
