import { useState, useEffect } from 'react';
import type { Card, CreateCardInput, UpdateCardInput } from '../types';

const API_BASE = '/api';

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_BASE}/cards`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const addCard = async (laneId: number, name: string, color: string) => {
    try {
      const cardsInLane = cards.filter((c) => c.lane_id === laneId);
      const position = cardsInLane.length;

      const input: CreateCardInput = { lane_id: laneId, name, color, position };
      const response = await fetch(`${API_BASE}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const newCard = await response.json();
      setCards((prev) => [...prev, newCard]);
      return newCard;
    } catch (error) {
      console.error('Failed to add card:', error);
      throw error;
    }
  };

  const updateCard = async (id: number, updates: UpdateCardInput) => {
    try {
      const response = await fetch(`${API_BASE}/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedCard = await response.json();
      setCards((prev) => prev.map((card) => (card.id === id ? updatedCard : card)));
      return updatedCard;
    } catch (error) {
      console.error('Failed to update card:', error);
      throw error;
    }
  };

  const deleteCard = async (id: number) => {
    try {
      await fetch(`${API_BASE}/cards/${id}`, {
        method: 'DELETE',
      });
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  };

  const moveCard = async (cardId: number, targetLaneId: number, newPosition: number) => {
    try {
      const response = await fetch(`${API_BASE}/cards/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, targetLaneId, newPosition }),
      });
      const movedCard = await response.json();

      setCards((prev) => {
        const updated = prev.map((card) => (card.id === cardId ? movedCard : card));
        return updated;
      });

      return movedCard;
    } catch (error) {
      console.error('Failed to move card:', error);
      throw error;
    }
  };

  return { cards, addCard, updateCard, deleteCard, moveCard, refetch: fetchCards };
}
