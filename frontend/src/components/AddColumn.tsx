import React, { useState } from 'react';

type AddColumnProps = {
  onAdd: (name: string) => Promise<void>;
  onCancel: () => void;
};

const AddColumn: React.FC<AddColumnProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(name.trim());
      setName('');
    } catch (error) {
      console.error('Error al crear columna:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl w-80 flex-shrink-0 border border-white/20 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la columna"
          className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Agregando...' : 'Agregar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddColumn; 