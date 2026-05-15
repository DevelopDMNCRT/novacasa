const db = require('../db');

async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY,
      jornada VARCHAR(50) NOT NULL,
      date_text VARCHAR(100),
      time_text VARCHAR(100),
      home_team VARCHAR(100) NOT NULL,
      away_team VARCHAR(100) NOT NULL,
      home_logo VARCHAR(255),
      away_logo VARCHAR(255),
      home_score_real INTEGER,
      away_score_real INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Insert initial matches if table is empty
  const countRes = await db.query('SELECT COUNT(*) FROM matches');
  if (parseInt(countRes.rows[0].count) === 0) {
    const matches = [
      // Jornada 1
      [1, '1', '11 de Junio, 2026', 'Estadio Azteca', 'México', 'Sudáfrica', 'mx', 'za'],
      [2, '1', '12 de Junio, 2026', 'SoFi Stadium', 'Estados Unidos', 'Paraguay', 'us', 'py'],
      [3, '1', '13 de Junio, 2026', 'MetLife Stadium', 'Brasil', 'Marruecos', 'br', 'ma'],
      [4, '1', '16 de Junio, 2026', 'Arrowhead Stadium', 'Argentina', 'Argelia', 'ar', 'dz'],
      [5, '1', '17 de Junio, 2026', 'NRG Stadium', 'Portugal', 'RD Congo', 'pt', 'cd'],
      [6, '1', '17 de Junio, 2026', 'AT&T Stadium', 'Inglaterra', 'Croacia', 'gb-eng', 'hr'],
      // Jornada 2
      [7, '2', '18 de Junio, 2026', 'Estadio Akron', 'México', 'Corea del Sur', 'mx', 'kr'],
      [8, '2', '19 de Junio, 2026', 'Lincoln Financial Field', 'Brasil', 'Haití', 'br', 'ht'],
      [9, '2', '20 de Junio, 2026', 'NRG Stadium', 'Países Bajos', 'Suecia', 'nl', 'se'],
      [10, '2', '20 de Junio, 2026', 'BMO Field', 'Alemania', 'Costa Marfil', 'de', 'ci'],
      [11, '2', '21 de Junio, 2026', 'Mercedes-Benz Stadium', 'España', 'Arabia Saudita', 'es', 'sa'],
      [12, '2', '22 de Junio, 2026', 'AT&T Stadium', 'Argentina', 'Austria', 'ar', 'at'],
      // Jornada 3
      [13, '3', '24 de Junio, 2026', 'Estadio Azteca', 'República Checa', 'México', 'cz', 'mx'],
      [14, '3', '24 de Junio, 2026', 'Hard Rock Stadium', 'Escocia', 'Brasil', 'gb-sct', 'br'],
      [15, '3', '26 de Junio, 2026', 'Estadio Akron', 'Uruguay', 'España', 'uy', 'es'],
      [16, '3', '26 de Junio, 2026', 'Gillette Stadium', 'Noruega', 'Francia', 'no', 'fr'],
      [17, '3', '27 de Junio, 2026', 'Hard Rock Stadium', 'Colombia', 'Portugal', 'co', 'pt'],
      [18, '3', '27 de Junio, 2026', 'AT&T Stadium', 'Jordania', 'Argentina', 'jo', 'ar']
    ];

    for (const m of matches) {
      await db.query(
        `INSERT INTO matches (id, jornada, date_text, time_text, home_team, away_team, home_logo, away_logo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        m
      );
    }
  }
}

module.exports = { up };
