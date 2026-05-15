const db = require('../db');

module.exports = async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autorizado.' });
  }
  try {
    const result = await db.query(
      'SELECT is_admin FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
  } catch (err) {
    console.error('Error in requireAdmin:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
