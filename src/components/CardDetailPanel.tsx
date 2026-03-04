import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Card, UpdateCardInput } from '../types';
import './CardDetailPanel.css';

interface CardDetailPanelProps {
  card: Card | null;
  onClose: () => void;
  onUpdate: (id: number, updates: UpdateCardInput) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function CardDetailPanel({ card, onClose, onUpdate, showToast }: CardDetailPanelProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (card) {
      setDescription(card.description || '');
      setIsEditingDescription(false);
    }
  }, [card?.id]);

  if (!card) return null;

  const handleSaveDescription = async () => {
    try {
      await onUpdate(card.id, { description: description || null });
      showToast('Description saved');
      setIsEditingDescription(false);
    } catch {
      showToast('Failed to save description', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDescription(card.description || '');
      setIsEditingDescription(false);
    }
  };

  return (
    <div className="card-detail-overlay" onClick={onClose}>
      <div className="card-detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="card-detail-header" style={{ backgroundColor: card.color }}>
          <h2 className="card-detail-title">{card.name}</h2>
          <button className="card-detail-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="card-detail-body">
          <div className="card-detail-section">
            <div className="card-detail-section-header">
              <h3>Description</h3>
              {!isEditingDescription && (
                <button
                  className="card-detail-edit-btn"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {description ? 'Edit' : 'Add description'}
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="card-detail-editor">
                <textarea
                  className="card-detail-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a description in Markdown..."
                  rows={12}
                  autoFocus
                />
                <div className="card-detail-editor-actions">
                  <button className="card-detail-save-btn" onClick={handleSaveDescription}>
                    Save
                  </button>
                  <button
                    className="card-detail-cancel-btn"
                    onClick={() => {
                      setDescription(card.description || '');
                      setIsEditingDescription(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : description ? (
              <div
                className="card-detail-markdown"
                onDoubleClick={() => setIsEditingDescription(true)}
                title="Double-click to edit"
              >
                <ReactMarkdown
                  urlTransform={(url) => url}
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >{description}</ReactMarkdown>
              </div>
            ) : (
              <p className="card-detail-empty">No description yet. Click "Add description" to write one.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
