const db = require('../db');

async function up() {
  await db.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20) UNIQUE NOT NULL DEFAULT ''
  `);

  // Remove the temporary default so future inserts must provide the value
  await db.query(`
    ALTER TABLE users
      ALTER COLUMN whatsapp DROP DEFAULT
  `);

  // Email ya no es el identificador principal, lo hacemos nullable
  await db.query(`
    ALTER TABLE users
      ALTER COLUMN email DROP NOT NULL
  `);
}

module.exports = { up };
