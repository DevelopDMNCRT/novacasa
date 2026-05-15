const db = require('../db');

async function up() {
  // Fill any existing rows that have NULL email before adding the constraint
  await db.query(`
    UPDATE users
    SET email = 'pendiente_' || id || '@novacasa.com'
    WHERE email IS NULL OR email = ''
  `);

  await db.query(`ALTER TABLE users ALTER COLUMN email SET NOT NULL`);

  // Add unique constraint only if it doesn't already exist
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_email_key' AND conrelid = 'users'::regclass
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
      END IF;
    END;
    $$
  `);
}

module.exports = { up };
