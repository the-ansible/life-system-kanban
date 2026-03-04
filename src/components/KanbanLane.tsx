import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { AddCardButton } from './AddCardButton';
import { LaneMenu } from './LaneMenu';
import type { Lane, Card, UpdateCardInput, UpdateLaneInput } from '../types';
import './KanbanLane.css';

interface KanbanLaneProps {
  lane: Lane;
  cards: Card[];
  onAddCard: (laneId: number, name: string, color: string) => Promise<void>;
  onUpdateCard: (id: number, updates: UpdateCardInput) => Promise<void>;
  onDeleteCard: (id: number) => Promise<void>;
  onUpdateLane: (id: number, updates: UpdateLaneInput) => Promise<void>;
  onDeleteLane: (id: number) => Promise<void>;
  onOpenCardDetail?: (card: Card) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function KanbanLane({
  lane,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateLane,
  onDeleteLane,
  onOpenCardDetail,
  showToast,
}: KanbanLaneProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(lane.name);

  // Sortable for lane reordering — whole lane is draggable by its header
  const {
    attributes: laneAttributes,
    listeners: laneListeners,
    setNodeRef: setLaneSortableRef,
    transform: laneTransform,
    transition: laneTransition,
    isDragging: isLaneDragging,
  } = useSortable({ id: `lane-${lane.id}`, data: { type: 'lane' } });

  const laneStyle = {
    transform: CSS.Transform.toString(laneTransform),
    transition: laneTransition,
    opacity: isLaneDragging ? 0.5 : 1,
  };

  // Droppable for card drops into this lane
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `lane-${lane.id}`,
  });

  const handleNameSubmit = async () => {
    if (editedName.trim() && editedName !== lane.name) {
      try {
        await onUpdateLane(lane.id, { name: editedName.trim() });
        showToast('Lane renamed successfully');
      } catch (error) {
        showToast('Failed to rename lane', 'error');
      }
    }
    setIsEditingName(false);
  };

  const handleColorChange = async (color: string) => {
    try {
      await onUpdateLane(lane.id, { color });
      showToast('Lane color updated');
    } catch (error) {
      showToast('Failed to update lane color', 'error');
    }
  };

  const handleDelete = async () => {
    if (cards.length > 0) {
      const confirmed = window.confirm(
        `Delete lane "${lane.name}" and all ${cards.length} card(s)?`
      );
      if (!confirmed) return;
    }

    try {
      await onDeleteLane(lane.id);
      showToast('Lane deleted successfully');
    } catch (error) {
      showToast('Failed to delete lane', 'error');
    }
  };

  return (
    <div
      ref={setLaneSortableRef}
      style={{ ...laneStyle, borderTopColor: lane.color }}
      className={`kanban-lane ${isOver ? 'lane-over' : ''}`}
    >
      <div
        className="lane-header"
        style={{ backgroundColor: lane.color, cursor: isLaneDragging ? 'grabbing' : 'grab' }}
        {...laneAttributes}
        {...laneListeners}
      >
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') {
                setEditedName(lane.name);
                setIsEditingName(false);
              }
            }}
            className="lane-name-input"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h2 className="lane-title" onDoubleClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}>
            {lane.name}
          </h2>
        )}

        <div className="lane-header-actions" onClick={(e) => e.stopPropagation()}>
          <span className="card-count">{cards.length}</span>
          <LaneMenu
            onRename={() => setIsEditingName(true)}
            onChangeColor={handleColorChange}
            onDelete={handleDelete}
            currentColor={lane.color}
          />
        </div>
      </div>

      <div ref={setDropRef} className="lane-cards">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              onOpenDetail={onOpenCardDetail}
              showToast={showToast}
            />
          ))}
        </SortableContext>
      </div>

      <AddCardButton
        onAddCard={async (name, color) => {
          try {
            await onAddCard(lane.id, name, color);
            showToast('Card created successfully');
          } catch (error) {
            showToast('Failed to create card', 'error');
          }
        }}
      />
    </div>
  );
}
