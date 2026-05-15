const db = require('../db');

async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_id INTEGER NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, match_id)
    )
  `);

  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'predictions_set_updated_at'
      ) THEN
        CREATE TRIGGER predictions_set_updated_at
        BEFORE UPDATE ON predictions
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      END IF;
    END;
    $$;
  `);
}

module.exports = { up };
