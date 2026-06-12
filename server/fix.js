const db = require('./db');

async function fixDB() {
  try {
    console.log('Adding match_date column...');
    await db.query('ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_date TIMESTAMPTZ');
    
    const {rows} = await db.query('SELECT id, date_text FROM matches');
    const monthMap = {'Junio': '06', 'Julio': '07'};
    
    for(const m of rows) {
      if (!m.date_text) continue;
      const parts = m.date_text.split(' de ');
      if(parts.length === 2) {
        const day = parts[0].padStart(2, '0');
        const monthYear = parts[1].split(', ');
        const month = monthMap[monthYear[0]];
        const year = monthYear[1];
        const dateStr = `${year}-${month}-${day}T12:00:00Z`;
        await db.query('UPDATE matches SET match_date = $1 WHERE id = $2', [dateStr, m.id]);
        console.log(`Updated match ${m.id} with date ${dateStr}`);
      }
    }
    console.log('Fixed DB match_date successfully');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

fixDB();
