const db = require('../db');

async function up() {
  await db.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS ciudad VARCHAR(120),
      ADD COLUMN IF NOT EXISTS estado VARCHAR(80);
  `);
}

module.exports = { up };
