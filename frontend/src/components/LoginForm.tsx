import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { api, type Board } from '../services/api';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    // Cargar boards al montar el componente
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const boardsData = await api.getBoards();
      setBoards(boardsData);
    } catch (err) {
      console.error('Error al cargar boards:', err);
      setError('Error al cargar los tableros');
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Por favor ingresa un nombre');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Crear usuario en el backend
      const user = await api.createUser(username);
      
      // Conectar al socket
      socket.emit('join', { username: user.name });
      
      // Guardar información del usuario
      localStorage.setItem('user', JSON.stringify(user));
      
      // Navegar al primer board o crear uno nuevo
      if (boards.length > 0) {
        navigate(`/board/${boards[0]._id}`, { state: { username: user.name } });
      } else {
        // Si no hay boards, crear uno por defecto
        const newBoard = await api.createBoard('Mi Primer Tablero');
        navigate(`/board/${newBoard._id}`, { state: { username: user.name } });
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tableros Disponibles</h2>
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {boards.map((board) => (
              <div
                key={board._id}
                className="p-4 bg-white rounded shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <h3 className="font-medium">{board.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay tableros disponibles</p>
        )}
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Iniciar Sesión</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Tu nombre"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border border-gray-300 rounded mb-4 w-full"
          disabled={loading}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Conectando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
