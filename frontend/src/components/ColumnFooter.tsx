import React from 'react';
import AddCard from './AddCard';

type ColumnFooterProps = {
  isAddingCard: boolean;
  setIsAddingCard: (adding: boolean) => void;
  handleAddCard: (title: string, description: string) => Promise<void>;
};

const ColumnFooter: React.FC<ColumnFooterProps> = ({ isAddingCard, setIsAddingCard, handleAddCard }) => {
  return (
    <div className="mt-3 flex-shrink-0">
      {isAddingCard ? (
        <AddCard
          onAdd={handleAddCard}
          onCancel={() => setIsAddingCard(false)}
        />
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="w-full p-2 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Agregar tarjeta</span>
        </button>
      )}
    </div>
  );
};

export default ColumnFooter; 