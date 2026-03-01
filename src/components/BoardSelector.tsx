import { useState } from 'react';
import { PlusIcon, Cross2Icon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import type { Board } from '../types';
import './BoardSelector.css';

interface BoardSelectorProps {
  boards: Board[];
  selectedBoardId: number | null;
  onSelectBoard: (id: number) => void;
  onAddBoard: (name: string) => Promise<void>;
  onDeleteBoard: (id: number) => Promise<void>;
  onRenameBoard: (id: number, name: string) => Promise<void>;
}

export function BoardSelector({
  boards,
  selectedBoardId,
  onSelectBoard,
  onAddBoard,
  onDeleteBoard,
  onRenameBoard,
}: BoardSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      await onAddBoard(newBoardName.trim());
      setNewBoardName('');
      setDialogOpen(false);
    }
  };

  const handleStartRename = (board: Board) => {
    setEditingBoardId(board.id);
    setEditName(board.name);
  };

  const handleFinishRename = async () => {
    if (editingBoardId !== null && editName.trim()) {
      await onRenameBoard(editingBoardId, editName.trim());
    }
    setEditingBoardId(null);
  };

  const handleDelete = async (id: number) => {
    const board = boards.find((b) => b.id === id);
    const confirmed = window.confirm(`Delete board "${board?.name}"? All lanes and cards will be deleted.`);
    if (confirmed) {
      await onDeleteBoard(id);
    }
  };

  return (
    <div className="board-selector">
      <div className="board-tabs">
        {boards.map((board) => (
          <div
            key={board.id}
            className={`board-tab ${board.id === selectedBoardId ? 'active' : ''}`}
          >
            {editingBoardId === board.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename();
                  if (e.key === 'Escape') setEditingBoardId(null);
                }}
                className="board-tab-input"
                autoFocus
              />
            ) : (
              <>
                <button
                  className="board-tab-name"
                  onClick={() => onSelectBoard(board.id)}
                >
                  {board.name}
                </button>
                {board.id === selectedBoardId && (
                  <div className="board-tab-actions">
                    <button
                      className="board-tab-action"
                      onClick={() => handleStartRename(board)}
                      title="Rename board"
                    >
                      <Pencil1Icon width={12} height={12} />
                    </button>
                    <button
                      className="board-tab-action"
                      onClick={() => handleDelete(board.id)}
                      title="Delete board"
                    >
                      <TrashIcon width={12} height={12} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger asChild>
            <button className="board-tab add-board-tab" title="Create new board">
              <PlusIcon width={14} height={14} />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="dialog-content">
              <Dialog.Title className="dialog-title">Create New Board</Dialog.Title>
              <form onSubmit={handleCreateBoard}>
                <div className="form-field">
                  <label htmlFor="board-name">Board Name</label>
                  <input
                    id="board-name"
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Enter board name..."
                    className="text-input"
                    autoFocus
                  />
                </div>
                <div className="dialog-actions">
                  <Dialog.Close asChild>
                    <button type="button" className="button secondary">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="button primary" disabled={!newBoardName.trim()}>
                    Create Board
                  </button>
                </div>
              </form>
              <Dialog.Close asChild>
                <button className="dialog-close" aria-label="Close">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
