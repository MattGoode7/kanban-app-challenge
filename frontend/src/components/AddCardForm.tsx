import { useState } from 'react';

type Props = {
  onAdd: (title: string) => void;
};

const AddCardForm = ({ onAdd }: Props) => {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <div className="mt-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarjeta"
        className="p-1 border rounded w-full mb-1"
      />
      <button onClick={handleSubmit} className="text-sm text-blue-500">
        Agregar
      </button>
    </div>
  );
};

export default AddCardForm;
