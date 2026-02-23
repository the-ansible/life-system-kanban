import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardMenu } from './CardMenu';
import type { Card, UpdateCardInput } from '../types';
import './KanbanCard.css';

interface KanbanCardProps {
  card: Card;
  isDragging?: boolean;
  onUpdate?: (id: number, updates: UpdateCardInput) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  showToast?: (message: string, type?: 'success' | 'error') => void;
}

export function KanbanCard({ card, isDragging, onUpdate, onDelete, showToast }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(card.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleNameSubmit = async () => {
    if (editedName.trim() && editedName !== card.name && onUpdate) {
      try {
        await onUpdate(card.id, { name: editedName.trim() });
        showToast?.('Card updated successfully');
      } catch (error) {
        showToast?.('Failed to update card', 'error');
      }
    }
    setIsEditing(false);
  };

  const handleColorChange = async (color: string) => {
    if (onUpdate) {
      try {
        await onUpdate(card.id, { color });
        showToast?.('Card color updated');
      } catch (error) {
        showToast?.('Failed to update card color', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      const confirmed = window.confirm(`Delete card "${card.name}"?`);
      if (!confirmed) return;

      try {
        await onDelete(card.id);
        showToast?.('Card deleted successfully');
      } catch (error) {
        showToast?.('Failed to delete card', 'error');
      }
    }
  };

  if (isDragging) {
    return (
      <div className="kanban-card dragging" style={{ backgroundColor: card.color }}>
        <div className="card-content">
          <p className="card-name">{card.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...attributes}
      {...listeners}
    >
      <div className="card-content" style={{ backgroundColor: card.color }}>
        {isEditing ? (
          <textarea
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleNameSubmit();
              }
              if (e.key === 'Escape') {
                setEditedName(card.name);
                setIsEditing(false);
              }
            }}
            className="card-name-input"
            autoFocus
            rows={3}
          />
        ) : (
          <p className="card-name" onDoubleClick={() => setIsEditing(true)}>
            {card.name}
          </p>
        )}

        {!isEditing && onUpdate && onDelete && (
          <CardMenu
            onEdit={() => setIsEditing(true)}
            onChangeColor={handleColorChange}
            onDelete={handleDelete}
            currentColor={card.color}
          />
        )}
      </div>
    </div>
  );
}
