import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { db, initializeDatabase } from './db.js';
import type {
  CreateLaneInput,
  UpdateLaneInput,
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
  Lane,
  Card,
} from '../types/index.js';

const app = new Hono();

app.use('/*', cors());

// Initialize database on startup
await initializeDatabase();

// Lane endpoints
app.get('/api/lanes', async (c) => {
  const result = await db.query<Lane>('SELECT * FROM lanes ORDER BY position');
  return c.json(result.rows);
});

app.post('/api/lanes', async (c) => {
  const input: CreateLaneInput = await c.req.json();
  const result = await db.query<Lane>(
    'INSERT INTO lanes (name, color, position) VALUES ($1, $2, $3) RETURNING *',
    [input.name, input.color || '#3b82f6', input.position]
  );
  return c.json(result.rows[0], 201);
});

app.patch('/api/lanes/:id', async (c) => {
  const id = c.req.param('id');
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

  values.push(id);
  const result = await db.query<Lane>(
    `UPDATE lanes SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Lane not found' }, 404);
  }

  return c.json(result.rows[0]);
});

app.delete('/api/lanes/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.query('DELETE FROM lanes WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return c.json({ error: 'Lane not found' }, 404);
  }

  return c.json({ success: true });
});

// Card endpoints
app.get('/api/cards', async (c) => {
  const laneId = c.req.query('lane_id');

  if (laneId) {
    const result = await db.query<Card>(
      'SELECT * FROM cards WHERE lane_id = $1 ORDER BY position',
      [laneId]
    );
    return c.json(result.rows);
  }

  const result = await db.query<Card>('SELECT * FROM cards ORDER BY lane_id, position');
  return c.json(result.rows);
});

app.post('/api/cards', async (c) => {
  const input: CreateCardInput = await c.req.json();
  const result = await db.query<Card>(
    'INSERT INTO cards (lane_id, name, color, position) VALUES ($1, $2, $3, $4) RETURNING *',
    [input.lane_id, input.name, input.color || '#ffffff', input.position]
  );
  return c.json(result.rows[0], 201);
});

app.patch('/api/cards/:id', async (c) => {
  const id = c.req.param('id');
  const input: UpdateCardInput = await c.req.json();

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

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(id);
  const result = await db.query<Card>(
    `UPDATE cards SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Card not found' }, 404);
  }

  return c.json(result.rows[0]);
});

app.post('/api/cards/move', async (c) => {
  const input: MoveCardInput = await c.req.json();

  // Update the card's lane and position
  const result = await db.query<Card>(
    'UPDATE cards SET lane_id = $1, position = $2 WHERE id = $3 RETURNING *',
    [input.targetLaneId, input.newPosition, input.cardId]
  );

  if (result.rows.length === 0) {
    return c.json({ error: 'Card not found' }, 404);
  }

  return c.json(result.rows[0]);
});

app.delete('/api/cards/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.query('DELETE FROM cards WHERE id = $1 RETURNING id', [id]);

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
