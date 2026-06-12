const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

// GET /api/matches
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM matches ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Error al obtener los partidos.' });
  }
});

// POST /api/matches/:id/result (Admin Only)
router.post('/:id/result', requireAuth, requireAdmin, async (req, res) => {
  const { home_score_real, away_score_real } = req.body;
  const matchId = req.params.id;

  try {
    const result = await db.query(
      `UPDATE matches 
       SET home_score_real = $1, away_score_real = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [home_score_real, away_score_real, matchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado.' });
    }

    res.json({ message: 'Resultado actualizado correctamente.', match: result.rows[0] });
  } catch (err) {
    console.error('Error updating match result:', err);
    res.status(500).json({ error: 'Error al actualizar el resultado.' });
  }
});

// POST /api/matches/:id/sofascore-sync (Public for Client-Side Sync)
router.post('/:id/sofascore-sync', async (req, res) => {
  const { home_score_real, away_score_real } = req.body;
  const matchId = req.params.id;

  try {
    const result = await db.query(
      `UPDATE matches 
       SET home_score_real = $1, away_score_real = $2, updated_at = NOW()
       WHERE id = $3 AND (home_score_real IS NULL OR away_score_real IS NULL)
       RETURNING *`,
      [home_score_real, away_score_real, matchId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Partido ya actualizado o no encontrado.' });
    }

    res.json({ message: 'Sincronizado vía cliente.', match: result.rows[0] });
  } catch (err) {
    console.error('Error syncing match result:', err);
    res.status(500).json({ error: 'Error al sincronizar el resultado.' });
  }
});

module.exports = router;
