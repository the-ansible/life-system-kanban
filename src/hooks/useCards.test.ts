import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCards } from './useCards';

global.fetch = vi.fn();

describe('useCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch cards on mount', async () => {
    const mockCards = [
      { id: 1, lane_id: 1, name: 'Task 1', color: '#ffffff', position: 0 },
      { id: 2, lane_id: 1, name: 'Task 2', color: '#ffffff', position: 1 },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockCards,
    });

    const { result } = renderHook(() => useCards());

    await waitFor(() => {
      expect(result.current.cards).toEqual(mockCards);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
  });

  it('should add a new card', async () => {
    const mockCard = { id: 1, lane_id: 1, name: 'New Task', color: '#ffffff', position: 0 };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: async () => [] })
      .mockResolvedValueOnce({ json: async () => mockCard });

    const { result } = renderHook(() => useCards());

    await waitFor(() => {
      expect(result.current.cards).toEqual([]);
    });

    await result.current.addCard(1, 'New Task', '#ffffff');

    await waitFor(() => {
      expect(result.current.cards).toEqual([mockCard]);
    });
  });

  it('should update a card', async () => {
    const initialCard = { id: 1, lane_id: 1, name: 'Task', color: '#ffffff', position: 0 };
    const updatedCard = { id: 1, lane_id: 1, name: 'Updated Task', color: '#ffffff', position: 0 };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: async () => [initialCard] })
      .mockResolvedValueOnce({ json: async () => updatedCard });

    const { result } = renderHook(() => useCards());

    await waitFor(() => {
      expect(result.current.cards).toEqual([initialCard]);
    });

    await result.current.updateCard(1, { name: 'Updated Task' });

    await waitFor(() => {
      expect(result.current.cards).toEqual([updatedCard]);
    });
  });

  it('should delete a card', async () => {
    const mockCard = { id: 1, lane_id: 1, name: 'Task', color: '#ffffff', position: 0 };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: async () => [mockCard] })
      .mockResolvedValueOnce({ json: async () => ({ success: true }) });

    const { result } = renderHook(() => useCards());

    await waitFor(() => {
      expect(result.current.cards).toEqual([mockCard]);
    });

    await result.current.deleteCard(1);

    await waitFor(() => {
      expect(result.current.cards).toEqual([]);
    });
  });

  it('should move a card to a different lane', async () => {
    const initialCard = { id: 1, lane_id: 1, name: 'Task', color: '#ffffff', position: 0 };
    const movedCard = { id: 1, lane_id: 2, name: 'Task', color: '#ffffff', position: 0 };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: async () => [initialCard] })
      .mockResolvedValueOnce({ json: async () => movedCard });

    const { result } = renderHook(() => useCards());

    await waitFor(() => {
      expect(result.current.cards).toEqual([initialCard]);
    });

    await result.current.moveCard(1, 2, 0);

    await waitFor(() => {
      expect(result.current.cards).toEqual([movedCard]);
    });
  });
});
