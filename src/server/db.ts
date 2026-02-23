import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.JANE_DATABASE_URL;

if (!connectionString) {
  throw new Error('JANE_DATABASE_URL environment variable is required');
}

export const pool = new Pool({ connectionString });

// Set search_path to kanban schema for all connections
pool.on('connect', (client) => {
  client.query('SET search_path TO kanban, public');
});

// Compatibility wrapper matching PGlite's interface: db.query<T>(sql, params) and db.exec(sql)
export const db = {
  async query<T extends Record<string, any> = any>(sql: string, params?: any[]): Promise<{ rows: T[] }> {
    const result = await pool.query<T>(sql, params);
    return { rows: result.rows };
  },
  async exec(sql: string): Promise<void> {
    await pool.query(sql);
  },
};

export async function initializeDatabase() {
  await pool.query('CREATE SCHEMA IF NOT EXISTS kanban');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS lanes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      position INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      lane_id INTEGER NOT NULL REFERENCES lanes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#ffffff',
      position INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_cards_lane_id ON cards(lane_id);
    CREATE INDEX IF NOT EXISTS idx_lanes_position ON lanes(position);
    CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
  `);
}
