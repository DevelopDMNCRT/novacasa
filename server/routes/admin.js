const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

// GET /api/admin/users — solo admins (is_admin = true)
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, whatsapp, created_at, is_admin
       FROM users WHERE is_admin = TRUE AND deleted_at IS NULL ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users for admin:', err);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// GET /api/admin/participantes — solo participantes (is_admin = false)
router.get('/participantes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, whatsapp, activo, ciudad, estado, created_at
       FROM users WHERE is_admin = FALSE AND deleted_at IS NULL ORDER BY created_at DESC`
    );
    // Mapear a los nombres que usa el frontend de participantes
    res.json(result.rows.map(u => ({
      id: u.id,
      nombre: u.name,
      correo: u.email,
      numero: u.whatsapp,
      ciudad: u.ciudad,
      estado: u.estado,
      created_at: u.created_at
    })));
  } catch (err) {
    console.error('Error fetching participantes for admin:', err);
    res.status(500).json({ error: 'Error al obtener participantes.' });
  }
});

module.exports = router;
