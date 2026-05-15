const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/predictions
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const predictionsResult = await db.query(
      'SELECT match_id, home_score, away_score FROM predictions WHERE user_id = $1',
      [userId]
    );
    
    const userResult = await db.query(
      'SELECT champion_id FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      predictions: predictionsResult.rows,
      champion_id: userResult.rows[0]?.champion_id || null
    });
  } catch (err) {
    console.error('Error fetching predictions:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/predictions
router.post('/', requireAuth, async (req, res) => {
  const { matches, champion_id } = req.body;
  const userId = req.user.id;

  try {
    await db.query('BEGIN');

    // Save match predictions
    if (matches && Array.isArray(matches)) {
      for (const match of matches) {
        // match object structure: { id: 1, homeScore: 2, awayScore: 1 }
        const { id, homeScore, awayScore } = match;
        
        // Skip if scores are not provided (empty, null, or NaN)
        if (homeScore === '' || awayScore === '' || homeScore === null || awayScore === null || isNaN(homeScore) || isNaN(awayScore)) {
          continue;
        }

        await db.query(
          `INSERT INTO predictions (user_id, match_id, home_score, away_score)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, match_id) 
           DO UPDATE SET home_score = EXCLUDED.home_score, away_score = EXCLUDED.away_score, updated_at = NOW()`,
          [userId, id, homeScore, awayScore]
        );
      }
    }

    // Save champion prediction
    if (champion_id !== undefined) {
      await db.query(
        'UPDATE users SET champion_id = $1 WHERE id = $2',
        [champion_id, userId]
      );
    }

    await db.query('COMMIT');
    res.json({ message: 'Predicciones guardadas exitosamente.' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error saving predictions:', err);
    res.status(500).json({ error: 'Error al guardar predicciones.' });
  }
});

module.exports = router;
