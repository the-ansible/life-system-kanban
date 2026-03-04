import { useState, useEffect } from 'react';
import type { Board, CreateBoardInput, UpdateBoardInput } from '../types';
import { apiUrl } from '../config';

const API_BASE = apiUrl('api');

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);

  const fetchBoards = async () => {
    try {
      const response = await fetch(`${API_BASE}/boards`);
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const addBoard = async (name: string, description?: string) => {
    try {
      const input: CreateBoardInput = { name, description };
      const response = await fetch(`${API_BASE}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const newBoard = await response.json();
      setBoards((prev) => [...prev, newBoard]);
      return newBoard;
    } catch (error) {
      console.error('Failed to add board:', error);
      throw error;
    }
  };

  const updateBoard = async (id: number, updates: UpdateBoardInput) => {
    try {
      const response = await fetch(`${API_BASE}/boards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedBoard = await response.json();
      setBoards((prev) => prev.map((board) => (board.id === id ? updatedBoard : board)));
      return updatedBoard;
    } catch (error) {
      console.error('Failed to update board:', error);
      throw error;
    }
  };

  const deleteBoard = async (id: number) => {
    try {
      await fetch(`${API_BASE}/boards/${id}`, {
        method: 'DELETE',
      });
      setBoards((prev) => prev.filter((board) => board.id !== id));
    } catch (error) {
      console.error('Failed to delete board:', error);
      throw error;
    }
  };

  return { boards, addBoard, updateBoard, deleteBoard, refetch: fetchBoards };
}
