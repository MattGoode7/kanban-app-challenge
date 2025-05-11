import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import BoardPage from './pages/BoardPage';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
