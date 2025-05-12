import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

type AddBoardProps = {
  onSuccess?: () => void;
};

const AddBoard: React.FC<AddBoardProps> = ({ onSuccess }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdding) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsAdding(false);
        setBoardName('');
        setBoardDescription('');
        setError(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAdding]);

  const handleAddBoard = async () => {
    if (!boardName.trim()) {
      setError('El nombre del tablero es requerido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      socket?.emit('createBoard', { name: boardName.trim(), description: boardDescription.trim() }, (response: { error?: string; board?: any }) => {
        if (response.error) {
          setError(response.error);
        } else {
          setBoardName('');
          setBoardDescription('');
          setIsAdding(false);
          onSuccess?.();
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError('Error al crear el tablero. Por favor, intente nuevamente.');
      setIsLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span>Nuevo Tablero</span>
      </button>
    );
  }

  return (
    <div ref={formRef} className="absolute right-0 top-0 mt-12 bg-white p-4 rounded-lg border border-gray-200 shadow-lg z-10">
      <input
        type="text"
        value={boardName}
        onChange={(e) => {
          setBoardName(e.target.value);
          setError(null);
        }}
        placeholder="Nombre del tablero"
        className={`w-full p-2 mb-2 border rounded text-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        disabled={isLoading}
        autoFocus
      />
      <textarea
        value={boardDescription}
        onChange={(e) => setBoardDescription(e.target.value)}
        placeholder="Descripción del tablero (opcional)"
        className="w-full p-2 mb-2 border rounded text-sm border-gray-300"
        rows={2}
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setIsAdding(false);
            setBoardName('');
            setBoardDescription('');
            setError(null);
          }}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          onClick={handleAddBoard}
          className={`px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center ${
            isLoading ? 'cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando...
            </>
          ) : (
            'Crear'
          )}
        </button>
      </div>
    </div>
  );
};

export default AddBoard; 