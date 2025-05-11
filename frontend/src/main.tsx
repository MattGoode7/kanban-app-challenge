import { SocketContext } from './context/SocketContext';
import { io } from 'socket.io-client';
import App from './App'; 

const socket = io('http://localhost:3000'); 

<SocketContext.Provider value={socket}>
  <App />
</SocketContext.Provider>
