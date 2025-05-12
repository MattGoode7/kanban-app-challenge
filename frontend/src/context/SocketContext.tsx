import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isConnecting: false,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = () => {
    if (socketRef.current?.connected) {
      console.log('Socket ya está conectado');
      return;
    }

    if (isConnecting) {
      console.log('Ya se está intentando conectar');
      return;
    }

    console.log('Intentando conectar al socket...');
    setIsConnecting(true);

    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Conectado al servidor WebSocket');
        setIsConnected(true);
        setIsConnecting(false);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Desconectado del servidor WebSocket');
        setIsConnected(false);
        setIsConnecting(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Error de conexión:', error);
        setIsConnected(false);
        setIsConnecting(false);
      });

      // Eventos del tablero
      socketRef.current.on('board_updated', (board) => {
        console.log('📋 Tablero actualizado:', board);
      });

      // Eventos de columnas
      socketRef.current.on('columnCreated', (column) => {
        console.log('📑 Columna creada:', column);
      });

      socketRef.current.on('columnUpdated', (column) => {
        console.log('📑 Columna actualizada:', column);
      });

      socketRef.current.on('columnDeleted', (columnId) => {
        console.log('📑 Columna eliminada:', columnId);
      });

      // Eventos de tarjetas
      socketRef.current.on('cardCreated', (card) => {
        console.log('📝 Tarjeta creada:', card);
      });

      socketRef.current.on('cardUpdated', (card) => {
        console.log('📝 Tarjeta actualizada:', card);
      });

      socketRef.current.on('cardDeleted', (cardId) => {
        console.log('📝 Tarjeta eliminada:', cardId);
      });

      // Eventos de Usuario
      socketRef.current.on('userJoined', (user) => {
        console.log('👤 Usuario conectado:', user);
      });

      socketRef.current.on('userLeft', (user) => {
        console.log('👤 Usuario desconectado:', user);
      });

    } catch (error) {
      console.error('Error al crear el socket:', error);
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      console.log('Desconectando socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    console.log('Montando SocketProvider...');
    connect();

    return () => {
      console.log('Desmontando SocketProvider...');
      // No desconectamos el socket al desmontar el provider
      // para mantener la conexión entre navegaciones
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
