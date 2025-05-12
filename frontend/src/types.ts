export type Board = {
  _id: string;
  name: string;
  description?: string;
  columns?: any[];
  createdAt: string;
  updatedAt: string;
};

export interface Column {
  _id: string;
  name: string;
  boardId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
} 