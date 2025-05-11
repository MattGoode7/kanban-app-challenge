import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface User {
  _id: string;
  name: string;
}

export type Board = {
  _id: string;
  name: string;
  columns: string[];
};

export const api = {
  // Usuarios
  createUser: async (name: string): Promise<User> => {
    const response = await axios.post(`${API_URL}/users`, { name });
    return response.data;
  },

  // Boards
  getBoards: async (): Promise<Board[]> => {
    const response = await axios.get(`${API_URL}/boards`);
    return response.data;
  },

  createBoard: async (name: string): Promise<Board> => {
    const response = await axios.post(`${API_URL}/boards`, { name });
    return response.data;
  },
}; 