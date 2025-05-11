import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const socket = io('http://localhost:3000'); 

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
