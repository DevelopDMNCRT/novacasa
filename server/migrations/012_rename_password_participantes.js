const db = require('../db');

async function up() {
  // Primero verificar si la tabla participantes existe
  const tableCheck = await db.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'participantes'
    )
  `);

  if (!tableCheck.rows[0].exists) {
    console.log('Migration 012: tabla "participantes" no existe, saltando.');
    return;
  }

  // Verificar si la columna ya fue renombrada
  const colCheck = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'participantes' AND column_name = 'password_hash'
  `);

  if (colCheck.rows.length > 0) {
    console.log('Migration 012: columna "password_hash" ya existe en participantes, saltando.');
    return;
  }

  // Renombrar columna
  await db.query(`ALTER TABLE participantes RENAME COLUMN "contrase\u00f1a" TO password_hash`);
  console.log('Migration 012: columna renombrada a "password_hash" en participantes.');
}

module.exports = { up };
