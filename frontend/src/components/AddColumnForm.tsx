import { useState } from 'react';

type Props = {
  onAdd: (title: string) => void;
};

const AddColumnForm = ({ onAdd }: Props) => {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <div className="min-w-64 p-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva columna"
        className="p-1 border rounded w-full mb-1"
      />
      <button onClick={handleSubmit} className="text-sm text-green-500">
        Agregar columna
      </button>
    </div>
  );
};

export default AddColumnForm;
