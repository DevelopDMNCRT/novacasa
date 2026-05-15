const db = require('../db');

async function up() {
  // Verificar si la tabla participantes existe
  const check = await db.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'participantes'
    )
  `);

  if (!check.rows[0].exists) {
    console.log('Migration 013: tabla "participantes" no existe, saltando.');
    return;
  }

  // Migrar datos de participantes → users con is_admin = false
  await db.query(`
    INSERT INTO users (name, email, whatsapp, password_hash, is_admin, activo, created_at)
    SELECT
      nombre,
      correo,
      numero::VARCHAR(20),
      password_hash,
      FALSE,
      TRUE,
      created_at
    FROM participantes
    WHERE correo IS NOT NULL
    ON CONFLICT (email) DO NOTHING
  `);
  console.log('Migration 013: datos de participantes migrados a users.');

  // Eliminar tabla participantes
  await db.query(`DROP TABLE IF EXISTS participantes`);
  console.log('Migration 013: tabla "participantes" eliminada.');
}

module.exports = { up };
