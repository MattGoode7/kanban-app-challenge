// src/pages/BoardPage.tsx
import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import Board from '../components/Board';

const BoardPage: React.FC = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const userName = localStorage.getItem('userName') || 'Usuario';
    socket.emit('user_connected', userName);

    socket.on('board_updated', (data) => {
      console.log('Board actualizado desde el servidor:', data);
      // TODO: actualizar estado local con nuevos datos
    });

    return () => {
      socket.off('board_updated');
    };
  }, [socket]);

  return (
    <div className="h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">Mi Tablero Kanban</h1>
      </header>
      <main>
        <Board />
      </main>
    </div>
  );
};

export default BoardPage;
