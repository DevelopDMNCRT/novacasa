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

// POST /api/matches/sync-apifootball (Cron or Secured)
router.post('/sync-apifootball', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized CRON request' });
  }

  try {
    const { fetchFixturesByDate, findMatchResultInApiFootball } = require('../utils/apifootballSync');
    
    // Buscar todos los partidos que no tengan resultado y que su fecha ya haya pasado
    const pendingMatchesRes = await db.query(
      `SELECT * FROM matches 
       WHERE home_score_real IS NULL 
       AND away_score_real IS NULL`
    );

    const pendingMatches = pendingMatchesRes.rows;
    if (pendingMatches.length === 0) {
      return res.json({ message: 'No pending matches to sync.' });
    }

    const monthMap = {'enero':1, 'febrero':2, 'marzo':3, 'abril':4, 'mayo':5, 'junio':6, 'julio':7, 'agosto':8, 'septiembre':9, 'octubre':10, 'noviembre':11, 'diciembre':12};
    const getRealDate = (dateText) => {
      if (!dateText) return null;
      const lower = dateText.toLowerCase();
      let day = 1; let month = 6; let year = 2026;
      const parts = lower.replace(/,/g, '').split(' de ');
      if (parts.length >= 2) {
        day = parseInt(parts[0], 10);
        const mYear = parts[1].split(' ');
        month = monthMap[mYear[0]] || 6;
        if (mYear.length > 1) { year = parseInt(mYear[1], 10); }
      } else {
        const p2 = lower.split(' ');
        if (p2.length >= 3) {
           day = parseInt(p2[0], 10);
           month = monthMap[p2[2]] || 6;
        }
      }
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    };

    const datesToFetch = new Set();
    const validMatches = [];
    
    for (const m of pendingMatches) {
      const d = getRealDate(m.date_text);
      if (d && d <= new Date()) {
        const dateString = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
        datesToFetch.add(dateString);
        validMatches.push({ ...m, parsedDateString: dateString });
      }
    }

    if (datesToFetch.size === 0) {
      return res.json({ message: 'No valid dates to sync yet.' });
    }

    const apiDataByDate = {};
    for (const dateStr of datesToFetch) {
      apiDataByDate[dateStr] = await fetchFixturesByDate(dateStr);
    }

    let updatedCount = 0;
    for (const m of validMatches) {
      const events = apiDataByDate[m.parsedDateString];
      if (events && events.length > 0) {
        const result = findMatchResultInApiFootball(m, events);
        if (result) {
          await db.query(
            `UPDATE matches SET home_score_real = $1, away_score_real = $2, updated_at = NOW() WHERE id = $3`,
            [result.homeScore, result.awayScore, m.id]
          );
          updatedCount++;
        }
      }
    }

    res.json({ message: `Sincronización completada. Actualizados: ${updatedCount}` });
  } catch (err) {
    console.error('Error in API-Football sync:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
