import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLanes } from './useLanes';

global.fetch = vi.fn();

describe('useLanes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch lanes on mount when boardId is provided', async () => {
    const mockLanes = [
      { id: 1, board_id: 1, name: 'To Do', color: '#3b82f6', position: 0 },
      { id: 2, board_id: 1, name: 'In Progress', color: '#f59e0b', position: 1 },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockLanes,
    });

    const { result } = renderHook(() => useLanes(1));

    await waitFor(() => {
      expect(result.current.lanes).toEqual(mockLanes);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/boards/1/lanes');
  });

  it('should not fetch when boardId is null', async () => {
    const { result } = renderHook(() => useLanes(null));

    expect(result.current.lanes).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should add a new lane', async () => {
    const mockLane = { id: 1, board_id: 1, name: 'Done', color: '#22c55e', position: 0 };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: async () => [] })
      .mockResolvedValueOnce({ json: async () => mockLane });

    const { result } = renderHook(() => useLanes(1));

    await waitFor(() => {
      expect(result.current.lanes).toEqual([]);
    });

    await result.current.addLane('Done', '#22c55e', 0);

    await waitFor(() => {
      expect(result.current.lanes).toEqual([mockLane]);
    });
  });

  it('should update a lane', async () => {
    const initialLane = { id: 1, board_id: 1, name: 'To Do', color: '#3b82f6', position: 0 };
    const updatedLane = { id: 1, board_id: 1, name: 'Todo List', color: '#3b82f6', position: 0 };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: async () => [initialLane] })
      .mockResolvedValueOnce({ json: async () => updatedLane });

    const { result } = renderHook(() => useLanes(1));

    await waitFor(() => {
      expect(result.current.lanes).toEqual([initialLane]);
    });

    await result.current.updateLane(1, { name: 'Todo List' });

    await waitFor(() => {
      expect(result.current.lanes).toEqual([updatedLane]);
    });
  });

  it('should delete a lane', async () => {
    const mockLane = { id: 1, board_id: 1, name: 'To Do', color: '#3b82f6', position: 0 };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: async () => [mockLane] })
      .mockResolvedValueOnce({ json: async () => ({ success: true }) });

    const { result } = renderHook(() => useLanes(1));

    await waitFor(() => {
      expect(result.current.lanes).toEqual([mockLane]);
    });

    await result.current.deleteLane(1);

    await waitFor(() => {
      expect(result.current.lanes).toEqual([]);
    });
  });
});
