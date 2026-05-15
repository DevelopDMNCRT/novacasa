const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    // 1. Fetch all users and their predictions
    const usersRes = await db.query('SELECT id, name, champion_id FROM users WHERE is_admin = FALSE AND deleted_at IS NULL');
    const matchesRes = await db.query('SELECT id, home_score_real, away_score_real FROM matches');
    const predictionsRes = await db.query('SELECT user_id, match_id, home_score, away_score FROM predictions');

    const users = usersRes.rows;
    const matches = matchesRes.rows;
    const predictions = predictionsRes.rows;

    // 2. Calculate points for each user
    const leaderboard = users.map(user => {
      let points = 0;
      const userPredictions = predictions.filter(p => p.user_id === user.id);

      userPredictions.forEach(pred => {
        const match = matches.find(m => m.id === pred.match_id);
        if (!match || match.home_score_real === null || match.away_score_real === null) return;

        const p_home = pred.home_score;
        const p_away = pred.away_score;
        const r_home = match.home_score_real;
        const r_away = match.away_score_real;

        // Exact match: 2 points
        if (p_home === r_home && p_away === r_away) {
          points += 2;
        } 
        // Correct winner/draw: 1 point
        else if (
          (p_home > p_away && r_home > r_away) || // Home winner
          (p_home < p_away && r_home < r_away) || // Away winner
          (p_home === p_away && r_home === r_away) // Draw
        ) {
          points += 1;
        }
      });

      // Add points for correct champion (Argentina has id 5)
      if (user.champion_id === 5) {
        points += 3;
      }

      return {
        id: user.id,
        name: user.name,
        username: `@${user.name.toLowerCase().replace(/\s+/g, '')}${user.id}`,
        points: points
      };
    });

    // 3. Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    // 4. Assign rank
    let currentRank = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].points < leaderboard[i - 1].points) {
        currentRank = i + 1;
      }
      leaderboard[i].rank = currentRank;
    }

    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
