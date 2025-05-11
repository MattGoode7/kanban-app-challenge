import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const socket = useSocket();

  const handleLogin = () => {
    if (!username.trim()) return;

    socket.emit('join', { username });
    navigate('/board', { state: { username } });
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        placeholder="Tu nombre"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-4 w-64"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Ingresar
      </button>
    </div>
  );
};

export default LoginForm;
