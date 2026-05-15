const db = require('../db');

async function up() {
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS champion_id INTEGER;
  `);
}

module.exports = { up };
