import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanLane } from './components/KanbanLane';
import { KanbanCard } from './components/KanbanCard';
import { AddLaneButton } from './components/AddLaneButton';
import { BoardSelector } from './components/BoardSelector';
import { Toast, ToastProvider } from './components/Toast';
import type { Card } from './types';
import { useBoards } from './hooks/useBoards';
import { useLanes } from './hooks/useLanes';
import { useCards } from './hooks/useCards';
import './App.css';

export default function App() {
  const { boards, addBoard, updateBoard, deleteBoard } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const { lanes, addLane, updateLane, deleteLane } = useLanes(selectedBoardId);
  const { cards, addCard, updateCard, deleteCard, moveCard } = useCards(selectedBoardId);
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-select first board when boards load and none is selected
  if (boards.length > 0 && selectedBoardId === null) {
    setSelectedBoardId(boards[0].id);
  }

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

    if (overId.startsWith('lane-')) {
      const targetLaneId = Number(overId.replace('lane-', ''));
      const cardsInTargetLane = cards.filter((c) => c.lane_id === targetLaneId);
      const newPosition = cardsInTargetLane.length;

      if (card.lane_id !== targetLaneId || card.position !== newPosition) {
        moveCard(cardId, targetLaneId, newPosition);
      }
    } else {
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
          <BoardSelector
            boards={boards}
            selectedBoardId={selectedBoardId}
            onSelectBoard={setSelectedBoardId}
            onAddBoard={async (name) => {
              const board = await addBoard(name);
              setSelectedBoardId(board.id);
              showToast('Board created');
            }}
            onDeleteBoard={async (id) => {
              await deleteBoard(id);
              if (selectedBoardId === id) {
                const remaining = boards.filter((b) => b.id !== id);
                setSelectedBoardId(remaining.length > 0 ? remaining[0].id : null);
              }
              showToast('Board deleted');
            }}
            onRenameBoard={async (id, name) => {
              await updateBoard(id, { name });
              showToast('Board renamed');
            }}
          />
        </header>

        {selectedBoardId === null ? (
          <div className="empty-state">
            <p>No boards yet. Create one to get started.</p>
          </div>
        ) : (
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
        )}

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
