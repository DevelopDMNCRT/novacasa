const db = require('./db');

async function run() {
  try {
    console.log('Simulando resultados para la Jornada 1...');

    const res = await db.query("SELECT id, home_team, away_team FROM matches WHERE jornada = '1'");
    const matches = res.rows;

    if (matches.length === 0) {
      console.log('No se encontraron partidos de la Jornada 1.');
      return;
    }

    for (const match of matches) {
      // Resultados aleatorios entre 0 y 3
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);

      await db.query(
        'UPDATE matches SET home_score_real = $1, away_score_real = $2, updated_at = NOW() WHERE id = $3',
        [homeScore, awayScore, match.id]
      );

      console.log(`Partido actualizado: ${match.home_team} ${homeScore} - ${awayScore} ${match.away_team}`);
    }

    console.log('¡Jornada 1 simulada con éxito! Revisa tu Leaderboard.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
