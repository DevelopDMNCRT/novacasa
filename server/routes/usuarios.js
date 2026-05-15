const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'novacasa_secret_key_2024';

// POST /api/usuarios/login — Login de administrador (solo is_admin = true)
router.post('/login', async (req, res) => {
  const { telefono, contraseña } = req.body;

  if (!telefono || !contraseña) {
    return res.status(400).json({ error: 'Teléfono y contraseña son requeridos.' });
  }

  try {
    const result = await db.query(
      `SELECT id, name, email, whatsapp, password_hash FROM users
       WHERE whatsapp = $1 AND is_admin = TRUE AND deleted_at IS NULL`,
      [telefono.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Teléfono o contraseña incorrectos.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(contraseña, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Teléfono o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.name, correo: user.email, whatsapp: user.whatsapp, is_admin: true },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, nombre: user.name, correo: user.email, whatsapp: user.whatsapp, is_admin: true }
    });
  } catch (err) {
    console.error('Error en login de admin:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /api/usuarios — Solo administradores (is_admin = true)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, whatsapp, activo, created_at
       FROM users WHERE is_admin = TRUE AND deleted_at IS NULL ORDER BY created_at DESC`
    );
    res.json(result.rows.map(u => ({
      id: u.id,
      nombre: u.name,
      correo: u.email,
      telefono: u.whatsapp,
      activo: u.activo,
      created_at: u.created_at
    })));
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// POST /api/usuarios — Crear administrador (is_admin = true)
router.post('/', async (req, res) => {
  const { nombre, correo, telefono, contraseña } = req.body;

  if (!nombre || !correo || !telefono || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  if (contraseña.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [correo.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ese correo electrónico ya está registrado.' });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, whatsapp, password_hash, is_admin, activo, created_at)
       VALUES ($1, $2, $3, $4, TRUE, TRUE, NOW())
       RETURNING id, name, email, whatsapp, is_admin, activo, created_at`,
      [nombre.trim(), correo.toLowerCase().trim(), telefono.toString().trim(), hash]
    );

    const u = result.rows[0];
    res.status(201).json({
      message: 'Administrador creado exitosamente.',
      usuario: { id: u.id, nombre: u.name, correo: u.email, telefono: u.whatsapp, activo: u.activo, is_admin: u.is_admin }
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PUT /api/usuarios/:id — Actualizar administrador
router.put('/:id', async (req, res) => {
  const { nombre, correo, telefono, contraseña } = req.body;

  if (!nombre || !correo || !telefono) {
    return res.status(400).json({ error: 'Nombre, correo y teléfono son requeridos.' });
  }

  try {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
      [correo.toLowerCase().trim(), req.params.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ese correo electrónico ya está registrado por otro usuario.' });
    }

    let query = 'UPDATE users SET name = $1, email = $2, whatsapp = $3';
    let params = [nombre.trim(), correo.toLowerCase().trim(), telefono.toString().trim()];

    if (contraseña) {
      if (contraseña.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      }
      const hash = await bcrypt.hash(contraseña, 10);
      query += ', password_hash = $4';
      params.push(hash);
    }

    query += ` WHERE id = $${params.length + 1} AND deleted_at IS NULL RETURNING id, name, email, whatsapp, activo, is_admin`;
    params.push(req.params.id);

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const u = result.rows[0];
    res.json({
      message: 'Usuario actualizado exitosamente.',
      usuario: { id: u.id, nombre: u.name, correo: u.email, telefono: u.whatsapp, activo: u.activo }
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PATCH /api/usuarios/:id/toggle — Activar / desactivar
router.patch('/:id/toggle', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE users SET activo = NOT activo WHERE id = $1 AND deleted_at IS NULL RETURNING id, activo`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ activo: result.rows[0].activo });
  } catch (err) {
    console.error('Error al cambiar estado del usuario:', err);
    res.status(500).json({ error: 'Error al cambiar estado del usuario.' });
  }
});

// DELETE /api/usuarios/:id — Soft delete
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1',
      [req.params.id]
    );
    res.json({ message: 'Usuario eliminado.' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

module.exports = router;
