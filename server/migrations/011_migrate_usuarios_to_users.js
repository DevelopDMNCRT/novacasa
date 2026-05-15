const db = require('../db');

async function up() {
  // Verificar si la tabla usuarios existe antes de migrar
  const tableCheck = await db.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'usuarios'
    )
  `);

  if (!tableCheck.rows[0].exists) {
    console.log('Migration 011: tabla "usuarios" no existe, nada que migrar.');
    return;
  }

  // Migrar datos de "usuarios" a "users"
  // - nombre  → name
  // - correo  → email
  // - telefono → whatsapp
  // - contraseña → password_hash (ya está hasheada con bcrypt)
  // - activo  → activo
  // - created_at / deleted_at → se mantienen
  // ON CONFLICT (email) DO NOTHING para evitar duplicados
  await db.query(`
    INSERT INTO users (name, email, whatsapp, password_hash, activo, created_at, deleted_at)
    SELECT
      nombre,
      correo,
      telefono::VARCHAR(20),
      "contraseña",
      COALESCE(activo, TRUE),
      created_at,
      deleted_at
    FROM usuarios
    WHERE correo IS NOT NULL
    ON CONFLICT (email) DO NOTHING
  `);

  console.log('Migration 011: datos migrados de "usuarios" a "users".');

  // Eliminar la tabla "usuarios" ya que sus datos están en "users"
  await db.query(`DROP TABLE IF EXISTS usuarios`);
  console.log('Migration 011: tabla "usuarios" eliminada.');
}

module.exports = { up };
