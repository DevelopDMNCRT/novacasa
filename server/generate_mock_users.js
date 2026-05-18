const db = require('./db');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    console.log('Iniciando generación de 100 participantes mock...');

    // 1. Obtener partidos (Fase de grupos y R16)
    const resMatches = await db.query("SELECT id FROM matches WHERE jornada IN ('1', '2', '3', 'R16')");
    const matchIds = resMatches.rows.map(r => r.id);
    
    if (matchIds.length === 0) {
      console.log('No hay partidos en la base de datos para predecir.');
      return;
    }

    const hash = await bcrypt.hash('password123', 10);
    const usersCount = 100;
    
    // Generar valores para users
    const userValues = [];
    let queryUsers = `INSERT INTO users (name, email, whatsapp, password_hash, is_admin, activo, ciudad, estado, created_at) VALUES `;
    
    for (let i = 1; i <= usersCount; i++) {
      const name = `Mock User ${i}`;
      const email = `mockuser${i}@example.com`;
      const whatsapp = `+52000000${i.toString().padStart(4, '0')}`;
      userValues.push(`('${name}', '${email}', '${whatsapp}', '${hash}', FALSE, TRUE, 'MockCity', 'MockState', NOW())`);
    }
    
    queryUsers += userValues.join(', ') + ' RETURNING id';
    
    console.log('Insertando usuarios en bloque...');
    const resUsers = await db.query(queryUsers);
    const userIds = resUsers.rows.map(r => r.id);
    
    console.log('Usuarios insertados:', userIds.length);
    console.log('Insertando predicciones en bloque...');
    
    // Generar predicciones en bloque
    const chunkSize = 1000;
    let currentChunk = [];
    
    for (const userId of userIds) {
      for (const matchId of matchIds) {
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 4);
        currentChunk.push(`(${userId}, ${matchId}, ${homeScore}, ${awayScore})`);
        
        if (currentChunk.length >= chunkSize) {
          await db.query(`INSERT INTO predictions (user_id, match_id, home_score, away_score) VALUES ${currentChunk.join(', ')}`);
          currentChunk = [];
        }
      }
    }
    
    if (currentChunk.length > 0) {
      await db.query(`INSERT INTO predictions (user_id, match_id, home_score, away_score) VALUES ${currentChunk.join(', ')}`);
    }

    console.log('¡100 participantes generados exitosamente con sus pronósticos!');
  } catch (err) {
    console.error('Error generando mocks:', err);
  } finally {
    process.exit(0);
  }
}

run();
