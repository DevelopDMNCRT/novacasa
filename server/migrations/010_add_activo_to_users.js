const db = require('../db');

async function up() {
  // Agrega columna activo a la tabla users existente
  await db.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE
  `);
  console.log('Migration 010: activo column added to users.');
}

module.exports = { up };
