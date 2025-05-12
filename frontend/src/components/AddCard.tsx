import React, { useState } from 'react';

type AddCardProps = {
  onAdd: (title: string, description: string) => void;
  onCancel: () => void;
};

const AddCard: React.FC<AddCardProps> = ({ onAdd, onCancel }) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onAdd(newCardTitle.trim(), newCardDescription.trim());
      setNewCardTitle('');
      setNewCardDescription('');
    } catch (err) {
      setError('Error al crear la tarjeta. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCard();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4">
      <input
        type="text"
        value={newCardTitle}
        onChange={(e) => {
          setNewCardTitle(e.target.value);
          setError(null);
        }}
        onKeyPress={handleKeyPress}
        placeholder="Título de la tarjeta"
        className={`w-full px-3 py-2 mb-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${error ? 'border-red-500' : ''}`}
        disabled={isLoading}
      />
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      <textarea
        value={newCardDescription}
        onChange={(e) => setNewCardDescription(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Descripción (opcional)"
        className="w-full px-3 py-2 mb-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        rows={2}
        disabled={isLoading}
      />
      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={onCancel}
          className="px-4 py-1 text-sm text-white/80 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:text-white transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          onClick={handleAddCard}
          className={`px-4 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center ${isLoading ? 'cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Agregando...
            </>
          ) : (
            'Agregar'
          )}
        </button>
      </div>
    </div>
  );
};

export default AddCard; 