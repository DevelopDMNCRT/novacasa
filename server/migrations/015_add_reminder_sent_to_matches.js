const db = require('../db');

async function up() {
  await db.query(`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'reminder_sent'
      ) THEN 
        ALTER TABLE matches ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
      END IF;
    END $$;
  `);
}

module.exports = { up };
