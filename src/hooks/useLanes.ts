import { useState, useEffect } from 'react';
import type { Lane, CreateLaneInput, UpdateLaneInput } from '../types';

const API_BASE = '/api';

export function useLanes(boardId: number | null) {
  const [lanes, setLanes] = useState<Lane[]>([]);

  const fetchLanes = async () => {
    if (boardId === null) {
      setLanes([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/boards/${boardId}/lanes`);
      const data = await response.json();
      setLanes(data);
    } catch (error) {
      console.error('Failed to fetch lanes:', error);
    }
  };

  useEffect(() => {
    fetchLanes();
  }, [boardId]);

  const addLane = async (name: string, color: string, position: number) => {
    if (boardId === null) throw new Error('No board selected');
    try {
      const input: CreateLaneInput = { name, color, position };
      const response = await fetch(`${API_BASE}/boards/${boardId}/lanes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const newLane = await response.json();
      setLanes((prev) => [...prev, newLane]);
      return newLane;
    } catch (error) {
      console.error('Failed to add lane:', error);
      throw error;
    }
  };

  const updateLane = async (id: number, updates: UpdateLaneInput) => {
    if (boardId === null) throw new Error('No board selected');
    try {
      const response = await fetch(`${API_BASE}/boards/${boardId}/lanes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedLane = await response.json();
      setLanes((prev) => prev.map((lane) => (lane.id === id ? updatedLane : lane)));
      return updatedLane;
    } catch (error) {
      console.error('Failed to update lane:', error);
      throw error;
    }
  };

  const deleteLane = async (id: number) => {
    if (boardId === null) throw new Error('No board selected');
    try {
      await fetch(`${API_BASE}/boards/${boardId}/lanes/${id}`, {
        method: 'DELETE',
      });
      setLanes((prev) => prev.filter((lane) => lane.id !== id));
    } catch (error) {
      console.error('Failed to delete lane:', error);
      throw error;
    }
  };

  return { lanes, addLane, updateLane, deleteLane, refetch: fetchLanes };
}
