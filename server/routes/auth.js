const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../email');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

const router = express.Router();

const WHATSAPP_REGEX = /^\+?[0-9]{10,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, whatsapp, password } = req.body;

  if (!name || !email || !whatsapp || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'El correo electrónico no es válido.' });
  }
  if (!WHATSAPP_REGEX.test(whatsapp.trim())) {
    return res.status(400).json({ error: 'El número de WhatsApp no es válido (10-15 dígitos).' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const existing = await db.query(
      'SELECT id, whatsapp, email FROM users WHERE (whatsapp = $1 OR email = $2) AND deleted_at IS NULL',
      [whatsapp.trim(), email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      const taken = existing.rows[0];
      if (taken.whatsapp === whatsapp.trim()) {
        return res.status(409).json({ error: 'Ese número de WhatsApp ya está registrado.' });
      }
      return res.status(409).json({ error: 'Ese correo electrónico ya está registrado.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, whatsapp, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, whatsapp, created_at`,
      [name.trim(), email.toLowerCase().trim(), whatsapp.trim(), password_hash]
    );

    const newUser = result.rows[0];
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, whatsapp: newUser.whatsapp },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, whatsapp: newUser.whatsapp },
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { whatsapp, password } = req.body;

  if (!whatsapp || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }

  try {
    const result = await db.query(
      'SELECT id, name, email, whatsapp, password_hash FROM users WHERE whatsapp = $1 AND deleted_at IS NULL',
      [whatsapp.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Número o contraseña incorrectos.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Número o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp },
    });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  const { name, password, ciudad, estado } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
  }
  if (password !== undefined && password !== '' && password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    let password_hash;
    if (password && password.trim() !== '') {
      password_hash = await bcrypt.hash(password, 10);
    }

    const query = `
      UPDATE users
      SET name = $1,
          ciudad = $2,
          estado = $3
          ${password_hash ? ', password_hash = $5' : ''}
      WHERE id = $4 AND deleted_at IS NULL
      RETURNING id, name, email, whatsapp, ciudad, estado
    `;

    const params = password_hash 
      ? [name.trim(), ciudad ? ciudad.trim() : null, estado ? estado.trim() : null, req.user.id, password_hash]
      : [name.trim(), ciudad ? ciudad.trim() : null, estado ? estado.trim() : null, req.user.id];

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const updated = result.rows[0];
    const token = jwt.sign(
      { 
        id: updated.id, 
        name: updated.name, 
        email: updated.email, 
        whatsapp: updated.whatsapp,
        ciudad: updated.ciudad,
        estado: updated.estado
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ message: 'Perfil actualizado.', user: updated, token });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }

  // Always respond the same to avoid email enumeration
  const SAFE_RESPONSE = { message: 'Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña.' };

  try {
    const result = await db.query(
      'SELECT id, name, email FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) return res.json(SAFE_RESPONSE);

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/restablecer-contrasena?token=${token}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json(SAFE_RESPONSE);
  } catch (err) {
    console.error('Error en forgot-password:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token) return res.status(400).json({ error: 'Token inválido.' });
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const result = await db.query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at
       FROM password_reset_tokens prt
       WHERE prt.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'El enlace no es válido o ya fue utilizado.' });
    }

    const row = result.rows[0];

    if (row.used_at) {
      return res.status(400).json({ error: 'Este enlace ya fue utilizado.' });
    }
    if (new Date() > new Date(row.expires_at)) {
      return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, row.user_id]);
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [row.id]);

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (err) {
    console.error('Error en reset-password:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
