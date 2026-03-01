import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { db, initializeDatabase } from './db.js';
import type {
  Board,
  CreateBoardInput,
  UpdateBoardInput,
  CreateLaneInput,
  UpdateLaneInput,
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
  Lane,
  Card,
  LaneWithCards,
} from '../types/index.js';

const app = new Hono();

app.use('/*', cors());

// Initialize database on startup
await initializeDatabase();

// ── Board endpoints ────────────────────────────────────────────────

app.get('/api/boards', async (c) => {
  const result = await db.query<Board>('SELECT * FROM boards ORDER BY created_at');
  return c.json(result.rows);
});

app.post('/api/boards', async (c) => {
  const input: CreateBoardInput = await c.req.json();
  const result = await db.query<Board>(
    'INSERT INTO boards (name, description) VALUES ($1, $2) RETURNING *',
    [input.name, input.description || null]
  );
  return c.json(result.rows[0], 201);
});

app.get('/api/boards/:boardId', async (c) => {
  const boardId = c.req.param('boardId');
  const boardResult = await db.query<Board>('SELECT * FROM boards WHERE id = $1', [boardId]);

  if (boardResult.rows.length === 0) {
    return c.json({ error: 'Board not found' }, 404);
  }

  const board = boardResult.rows[0];

  // Fetch lanes and cards for this board
  const [lanesResult, cardsResult] = await Promise.all([
    db.query<Lane>('SELECT * FROM lanes WHERE board_id = $1 ORDER BY position', [boardId]),
    db.query<Card>(
      'SELECT c.* FROM cards c JOIN lanes l ON c.lane_id = l.id WHERE l.board_id = $1 ORDER BY c.lane_id, c.position',
      [boardId]
    ),
  ]);

  const lanesWithCards: LaneWithCards[] = lanesResult.rows.map((lane) => ({
    ...lane,
    cards: cardsResult.rows
      .filter((card) => card.lane_id === lane.id)
      .sort((a, b) => a.position - b.position),
  }));

  return c.json({ ...board, lanes: lanesWithCards });
});

app.patch('/api/boards/:boardId', async (c) => {
  const boardId = c.req.param('boardId');
  const input: UpdateBoardInput = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(boardId);
  const result = await db.query<Board>(
    `UPDATE boards SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Board not found' }, 404);
  }

  return c.json(result.rows[0]);
});

app.delete('/api/boards/:boardId', async (c) => {
  const boardId = c.req.param('boardId');
  const result = await db.query('DELETE FROM boards WHERE id = $1 RETURNING id', [boardId]);

  if (result.rows.length === 0) {
    return c.json({ error: 'Board not found' }, 404);
  }

  return c.json({ success: true });
});

// ── Lane endpoints (board-scoped) ──────────────────────────────────

app.get('/api/boards/:boardId/lanes', async (c) => {
  const boardId = c.req.param('boardId');
  const result = await db.query<Lane>(
    'SELECT * FROM lanes WHERE board_id = $1 ORDER BY position',
    [boardId]
  );
  return c.json(result.rows);
});

app.post('/api/boards/:boardId/lanes', async (c) => {
  const boardId = c.req.param('boardId');
  const input: CreateLaneInput = await c.req.json();
  const result = await db.query<Lane>(
    'INSERT INTO lanes (board_id, name, color, position) VALUES ($1, $2, $3, $4) RETURNING *',
    [boardId, input.name, input.color || '#3b82f6', input.position]
  );
  return c.json(result.rows[0], 201);
});

app.patch('/api/boards/:boardId/lanes/:laneId', async (c) => {
  const boardId = c.req.param('boardId');
  const laneId = c.req.param('laneId');
  const input: UpdateLaneInput = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.color !== undefined) {
    updates.push(`color = $${paramIndex++}`);
    values.push(input.color);
  }
  if (input.position !== undefined) {
    updates.push(`position = $${paramIndex++}`);
    values.push(input.position);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(laneId, boardId);
  const result = await db.query<Lane>(
    `UPDATE lanes SET ${updates.join(', ')} WHERE id = $${paramIndex} AND board_id = $${paramIndex + 1} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Lane not found' }, 404);
  }

  return c.json(result.rows[0]);
});

app.delete('/api/boards/:boardId/lanes/:laneId', async (c) => {
  const boardId = c.req.param('boardId');
  const laneId = c.req.param('laneId');
  const result = await db.query(
    'DELETE FROM lanes WHERE id = $1 AND board_id = $2 RETURNING id',
    [laneId, boardId]
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Lane not found' }, 404);
  }

  return c.json({ success: true });
});

// ── Card endpoints (board-scoped) ──────────────────────────────────

app.get('/api/boards/:boardId/cards', async (c) => {
  const boardId = c.req.param('boardId');
  const laneId = c.req.query('lane_id');

  if (laneId) {
    const result = await db.query<Card>(
      'SELECT c.* FROM cards c JOIN lanes l ON c.lane_id = l.id WHERE l.board_id = $1 AND c.lane_id = $2 ORDER BY c.position',
      [boardId, laneId]
    );
    return c.json(result.rows);
  }

  const result = await db.query<Card>(
    'SELECT c.* FROM cards c JOIN lanes l ON c.lane_id = l.id WHERE l.board_id = $1 ORDER BY c.lane_id, c.position',
    [boardId]
  );
  return c.json(result.rows);
});

app.post('/api/boards/:boardId/cards', async (c) => {
  const boardId = c.req.param('boardId');
  const input: CreateCardInput = await c.req.json();

  // Verify the lane belongs to this board
  const laneCheck = await db.query<Lane>(
    'SELECT id FROM lanes WHERE id = $1 AND board_id = $2',
    [input.lane_id, boardId]
  );
  if (laneCheck.rows.length === 0) {
    return c.json({ error: 'Lane not found in this board' }, 404);
  }

  const result = await db.query<Card>(
    'INSERT INTO cards (lane_id, name, color, position, linked_board_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [input.lane_id, input.name, input.color || '#ffffff', input.position, input.linked_board_id || null]
  );
  return c.json(result.rows[0], 201);
});

app.patch('/api/boards/:boardId/cards/:cardId', async (c) => {
  const boardId = c.req.param('boardId');
  const cardId = c.req.param('cardId');
  const input: UpdateCardInput = await c.req.json();

  // Verify the card belongs to this board
  const cardCheck = await db.query(
    'SELECT c.id FROM cards c JOIN lanes l ON c.lane_id = l.id WHERE c.id = $1 AND l.board_id = $2',
    [cardId, boardId]
  );
  if (cardCheck.rows.length === 0) {
    return c.json({ error: 'Card not found in this board' }, 404);
  }

  // If moving to a new lane, verify the target lane belongs to this board
  if (input.lane_id !== undefined) {
    const laneCheck = await db.query<Lane>(
      'SELECT id FROM lanes WHERE id = $1 AND board_id = $2',
      [input.lane_id, boardId]
    );
    if (laneCheck.rows.length === 0) {
      return c.json({ error: 'Target lane not found in this board' }, 404);
    }
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.color !== undefined) {
    updates.push(`color = $${paramIndex++}`);
    values.push(input.color);
  }
  if (input.lane_id !== undefined) {
    updates.push(`lane_id = $${paramIndex++}`);
    values.push(input.lane_id);
  }
  if (input.position !== undefined) {
    updates.push(`position = $${paramIndex++}`);
    values.push(input.position);
  }
  if (input.linked_board_id !== undefined) {
    updates.push(`linked_board_id = $${paramIndex++}`);
    values.push(input.linked_board_id);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(cardId);
  const result = await db.query<Card>(
    `UPDATE cards SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Card not found' }, 404);
  }

  return c.json(result.rows[0]);
});

app.post('/api/boards/:boardId/cards/move', async (c) => {
  const boardId = c.req.param('boardId');
  const input: MoveCardInput = await c.req.json();

  // Verify the card belongs to this board
  const cardCheck = await db.query(
    'SELECT c.id FROM cards c JOIN lanes l ON c.lane_id = l.id WHERE c.id = $1 AND l.board_id = $2',
    [input.cardId, boardId]
  );
  if (cardCheck.rows.length === 0) {
    return c.json({ error: 'Card not found in this board' }, 404);
  }

  // Verify the target lane belongs to this board
  const laneCheck = await db.query<Lane>(
    'SELECT id FROM lanes WHERE id = $1 AND board_id = $2',
    [input.targetLaneId, boardId]
  );
  if (laneCheck.rows.length === 0) {
    return c.json({ error: 'Target lane not found in this board' }, 404);
  }

  const result = await db.query<Card>(
    'UPDATE cards SET lane_id = $1, position = $2 WHERE id = $3 RETURNING *',
    [input.targetLaneId, input.newPosition, input.cardId]
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Card not found' }, 404);
  }

  return c.json(result.rows[0]);
});

app.delete('/api/boards/:boardId/cards/:cardId', async (c) => {
  const boardId = c.req.param('boardId');
  const cardId = c.req.param('cardId');

  // Verify the card belongs to this board
  const cardCheck = await db.query(
    'SELECT c.id FROM cards c JOIN lanes l ON c.lane_id = l.id WHERE c.id = $1 AND l.board_id = $2',
    [cardId, boardId]
  );
  if (cardCheck.rows.length === 0) {
    return c.json({ error: 'Card not found in this board' }, 404);
  }

  const result = await db.query('DELETE FROM cards WHERE id = $1 RETURNING id', [cardId]);

  if (result.rows.length === 0) {
    return c.json({ error: 'Card not found' }, 404);
  }

  return c.json({ success: true });
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
