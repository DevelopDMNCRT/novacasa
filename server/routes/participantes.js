const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'novacasa_secret_key_2024';

/**
 * Normaliza un número de teléfono eliminando todo excepto dígitos,
 * y devuelve sólo los últimos 10 dígitos.
 * Devuelve null si el resultado no tiene exactamente 10 dígitos.
 */
function normalizePhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.slice(-10); // toma los 10 últimos dígitos
}

// POST /api/participantes/register — Registro de participante (is_admin = false)
router.post('/register', async (req, res) => {
  const { name, email, whatsapp, whatsapp_prefix, password, ciudad, estado } = req.body;

  if (!name || !email || !whatsapp || !whatsapp_prefix || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  // Validar prefijo
  const validPrefixes = { MX: '+52', US: '+1' };
  if (!validPrefixes[whatsapp_prefix]) {
    return res.status(400).json({ error: 'Prefijo de país inválido.' });
  }

  // Normalizar número a 10 dígitos
  const normalized = normalizePhone(whatsapp);
  if (!normalized) {
    return res.status(400).json({ error: 'El número debe tener exactamente 10 dígitos.' });
  }

  // Número final con prefijo internacional, ej: +521234567890
  const fullNumber = `${validPrefixes[whatsapp_prefix]}${normalized}`;

  try {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ese correo electrónico ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, whatsapp, password_hash, is_admin, activo, ciudad, estado, created_at)
       VALUES ($1, $2, $3, $4, FALSE, TRUE, $5, $6, NOW())
       RETURNING id, name, email, whatsapp, ciudad, estado`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        fullNumber,
        hash,
        ciudad ? ciudad.trim() : null,
        estado ? estado.trim() : null,
      ]
    );

    const u = result.rows[0];
    const token = jwt.sign(
      { id: u.id, name: u.name, email: u.email, whatsapp: u.whatsapp, is_admin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registro exitoso.',
      token,
      user: { id: u.id, name: u.name, email: u.email, whatsapp: u.whatsapp, ciudad: u.ciudad, estado: u.estado }
    });
  } catch (err) {
    console.error('Error al registrar participante:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/participantes/login — Login de participante (solo is_admin = false)
router.post('/login', async (req, res) => {
  const { whatsapp, password } = req.body;

  if (!whatsapp || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }

  try {
    // Busca por número completo (con prefijo) o por los últimos 10 dígitos
    const normalized = normalizePhone(whatsapp);
    const result = await db.query(
      `SELECT id, name, email, whatsapp, password_hash FROM users
       WHERE (whatsapp = $1 OR whatsapp LIKE $2) AND is_admin = FALSE AND deleted_at IS NULL`,
      [whatsapp.trim(), `%${normalized}`]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Número o contraseña incorrectos.' });
    }

    const u = result.rows[0];
    const match = await bcrypt.compare(password, u.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Número o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: u.id, name: u.name, email: u.email, whatsapp: u.whatsapp, is_admin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: u.id, name: u.name, email: u.email, whatsapp: u.whatsapp }
    });
  } catch (err) {
    console.error('Error en login de participante:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
