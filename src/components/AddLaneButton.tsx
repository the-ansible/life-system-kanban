import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import { ColorPicker } from './ColorPicker';
import './AddButton.css';

interface AddLaneButtonProps {
  onAddLane: (name: string, color: string) => void;
}

export function AddLaneButton({ onAddLane }: AddLaneButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddLane(name.trim(), color);
      setName('');
      setColor('#3b82f6');
      setOpen(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="add-lane-button">
          <PlusIcon width={20} height={20} />
          <span>Add Lane</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">Create New Lane</Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="lane-name">Lane Name</label>
              <input
                id="lane-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter lane name..."
                className="text-input"
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Lane Color</label>
              <ColorPicker currentColor={color} onColorSelect={setColor} />
            </div>

            <div className="dialog-actions">
              <Dialog.Close asChild>
                <button type="button" className="button secondary">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" className="button primary" disabled={!name.trim()}>
                Create Lane
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
  );
}
