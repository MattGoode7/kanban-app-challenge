import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
});

// Agregar listeners para monitorear el estado de la conexión
socket.on('connect', () => {
  console.log('✅ Socket conectado:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket desconectado');
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

export const SocketContext = createContext<Socket>(socket);

export const useSocket = () => useContext(SocketContext);

type Props = {
  children: ReactNode;
};

export const SocketProvider = ({ children }: Props) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
