import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardsApi } from '../services/api';
import type { Board } from '../services/api';

const Home: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await boardsApi.getBoards();
        setBoards(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los tableros');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Bienvenido a tu Kanban
        </h1>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Tus Tableros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => handleBoardClick(board._id)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
              >
                <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {board.name}
                  </h3>
                  <p className="text-gray-500 mt-2">
                    {board.columns.length} columnas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home; 