const db = require('../db');

async function up() {
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
  `);
}

module.exports = { up };
