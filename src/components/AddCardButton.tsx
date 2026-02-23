import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import { ColorPicker } from './ColorPicker';
import './AddButton.css';

interface AddCardButtonProps {
  onAddCard: (name: string, color: string) => void;
}

export function AddCardButton({ onAddCard }: AddCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ffffff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddCard(name.trim(), color);
      setName('');
      setColor('#ffffff');
      setOpen(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="add-card-button">
          <PlusIcon width={16} height={16} />
          <span>Add Card</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">Create New Card</Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="card-name">Card Name</label>
              <textarea
                id="card-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter card description..."
                className="text-input"
                rows={4}
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Card Color</label>
              <ColorPicker currentColor={color} onColorSelect={setColor} />
            </div>

            <div className="dialog-actions">
              <Dialog.Close asChild>
                <button type="button" className="button secondary">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" className="button primary" disabled={!name.trim()}>
                Create Card
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
