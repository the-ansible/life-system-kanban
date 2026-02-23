import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanLane } from './components/KanbanLane';
import { KanbanCard } from './components/KanbanCard';
import { AddLaneButton } from './components/AddLaneButton';
import { Toast, ToastProvider } from './components/Toast';
import type { Card } from './types';
import { useLanes } from './hooks/useLanes';
import { useCards } from './hooks/useCards';
import './App.css';

export default function App() {
  const { lanes, addLane, updateLane, deleteLane } = useLanes();
  const { cards, addCard, updateCard, deleteCard, moveCard } = useCards();
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === Number(active.id));
    if (card) {
      setActiveDragCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragCard(null);

    if (!over) return;

    const cardId = Number(active.id);
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const overId = String(over.id);

    // Check if dropped over a lane
    if (overId.startsWith('lane-')) {
      const targetLaneId = Number(overId.replace('lane-', ''));
      const cardsInTargetLane = cards.filter((c) => c.lane_id === targetLaneId);
      const newPosition = cardsInTargetLane.length;

      if (card.lane_id !== targetLaneId || card.position !== newPosition) {
        moveCard(cardId, targetLaneId, newPosition);
      }
    }
    // Check if dropped over another card
    else {
      const targetCard = cards.find((c) => c.id === Number(overId));
      if (targetCard && card.id !== targetCard.id) {
        moveCard(cardId, targetCard.lane_id, targetCard.position);
      }
    }
  };

  const getCardsForLane = (laneId: number): Card[] => {
    return cards
      .filter((card) => card.lane_id === laneId)
      .sort((a, b) => a.position - b.position);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  return (
    <ToastProvider>
      <div className="app">
        <header className="app-header">
          <h1>Life System Kanban</h1>
        </header>

        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <main className="kanban-board">
            <SortableContext
              items={lanes.map((lane) => `lane-${lane.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {lanes
                .sort((a, b) => a.position - b.position)
                .map((lane) => (
                  <KanbanLane
                    key={lane.id}
                    lane={lane}
                    cards={getCardsForLane(lane.id)}
                    onAddCard={addCard}
                    onUpdateCard={updateCard}
                    onDeleteCard={deleteCard}
                    onUpdateLane={updateLane}
                    onDeleteLane={deleteLane}
                    showToast={showToast}
                  />
                ))}
            </SortableContext>

            <AddLaneButton
              onAddLane={(name, color) => {
                addLane(name, color, lanes.length);
                showToast('Lane created successfully');
              }}
            />
          </main>

          <DragOverlay>
            {activeDragCard ? (
              <div className="card-overlay">
                <KanbanCard card={activeDragCard} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </ToastProvider>
  );
}
