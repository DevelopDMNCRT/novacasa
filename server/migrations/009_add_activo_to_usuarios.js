const db = require('../db');

async function up() {
  // Verificar si la tabla usuarios existe (puede haber sido eliminada por migration 011)
  const check = await db.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'usuarios'
    )
  `);

  if (!check.rows[0].exists) {
    console.log('Migration 009: tabla "usuarios" no existe, saltando.');
    return;
  }

  // Agrega columna activo a la tabla usuarios si no existe
  await db.query(`
    ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE
  `);
  console.log('Migration 009: activo column added to usuarios.');
}

module.exports = { up };
