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
    CREATE TABLE IF NOT EXISTS boards (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Add board_id to lanes if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'kanban' AND table_name = 'lanes' AND column_name = 'board_id'
      ) THEN
        -- Create lanes table fresh if it doesn't exist
        CREATE TABLE IF NOT EXISTS lanes (
          id SERIAL PRIMARY KEY,
          board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          color TEXT NOT NULL DEFAULT '#3b82f6',
          position INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        -- If lanes already existed without board_id, add the column
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'kanban' AND table_name = 'lanes'
        ) THEN
          ALTER TABLE lanes ADD COLUMN IF NOT EXISTS board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE;
          -- Migrate orphaned lanes: create a Default board and assign them
          IF EXISTS (SELECT 1 FROM lanes WHERE board_id IS NULL) THEN
            INSERT INTO boards (name, description) VALUES ('Default', 'Auto-created board for existing lanes')
            ON CONFLICT DO NOTHING;
            UPDATE lanes SET board_id = (SELECT id FROM boards WHERE name = 'Default' LIMIT 1) WHERE board_id IS NULL;
          END IF;
          -- Now make board_id NOT NULL
          ALTER TABLE lanes ALTER COLUMN board_id SET NOT NULL;
        END IF;
      ELSE
        -- Tables already have board_id, just ensure they exist
        CREATE TABLE IF NOT EXISTS lanes (
          id SERIAL PRIMARY KEY,
          board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          color TEXT NOT NULL DEFAULT '#3b82f6',
          position INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      lane_id INTEGER NOT NULL REFERENCES lanes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#ffffff',
      position INTEGER NOT NULL,
      linked_board_id INTEGER REFERENCES boards(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Add linked_board_id to cards if it doesn't exist (migration)
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS linked_board_id INTEGER REFERENCES boards(id) ON DELETE SET NULL;

    -- Add description to cards if it doesn't exist (migration)
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS description TEXT;

    CREATE INDEX IF NOT EXISTS idx_lanes_board_id ON lanes(board_id);
    CREATE INDEX IF NOT EXISTS idx_cards_lane_id ON cards(lane_id);
    CREATE INDEX IF NOT EXISTS idx_lanes_position ON lanes(position);
    CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
    CREATE INDEX IF NOT EXISTS idx_cards_linked_board_id ON cards(linked_board_id);
  `);
}
