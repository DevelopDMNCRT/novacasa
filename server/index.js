require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { up: runMigrations001 } = require('./migrations/001_create_users');
const { up: runMigrations002 } = require('./migrations/002_add_whatsapp_to_users');
const { up: runMigrations003 } = require('./migrations/003_create_predictions');
const { up: runMigrations004 } = require('./migrations/004_add_champion_to_users');
const { up: runMigrations005 } = require('./migrations/005_add_is_admin_to_users');
const { up: runMigrations006 } = require('./migrations/006_create_matches');
const { up: runMigrations007 } = require('./migrations/007_require_email');
const { up: runMigrations008 } = require('./migrations/008_create_password_reset_tokens');
const { up: runMigrations009 } = require('./migrations/009_add_activo_to_usuarios');
const { up: runMigrations010 } = require('./migrations/010_add_activo_to_users');
const { up: runMigrations011 } = require('./migrations/011_migrate_usuarios_to_users');
const { up: runMigrations012 } = require('./migrations/012_rename_password_participantes');
const { up: runMigrations013 } = require('./migrations/013_migrate_participantes_to_users');
const { up: runMigrations014 } = require('./migrations/014_add_ciudad_estado_to_users');
const { up: runMigrations015 } = require('./migrations/015_add_reminder_sent_to_matches');
const { up: runMigrations016 } = require('./migrations/016_create_push_subscriptions');
const authRoutes = require('./routes/auth');
const predictionsRoutes = require('./routes/predictions');
const matchesRoutes = require('./routes/matches');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const usuariosRoutes = require('./routes/usuarios');
const contactRoutes = require('./routes/contact');
const participantesRoutes = require('./routes/participantes');
const cronRoutes = require('./routes/cron');
const pushRoutes = require('./routes/push');

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS — en produccion permite cualquier origen de vercel.app + localhost
// En local usa lista restrictiva
app.use(cors({
  origin: (origin, callback) => {
    // Sin origin: Postman, server-to-server
    if (!origin) return callback(null, true);

    // En produccion: permitir cualquier subdominio de vercel.app y dominios configurados
    if (isProduction) {
      const allowed =
        origin.endsWith('.vercel.app') ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) ||
        (process.env.ADMIN_URL && origin === process.env.ADMIN_URL);
      return callback(null, allowed ? true : new Error('Not allowed by CORS'));
    }

    // En local: permitir localhost
    const localOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
    return callback(null, localOrigins.includes(origin) ? true : new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/participantes', participantesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/push', pushRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now, env: process.env.NODE_ENV });
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(500).json({ error: 'Database connection failed', detail: err.message });
  }
});

// Migraciones — solo en local (en Vercel ya estan aplicadas en la BD)
async function runMigrations() {
  try {
    await runMigrations001();
    await runMigrations002();
    await runMigrations003();
    await runMigrations004();
    await runMigrations005();
    await runMigrations006();
    await runMigrations007();
    await runMigrations008();
    await runMigrations009();
    await runMigrations010();
    await runMigrations011();
    await runMigrations012();
    await runMigrations013();
    await runMigrations014();
    await runMigrations015();
    await runMigrations016();
    console.log('Migrations applied successfully.');
  } catch (err) {
    // En produccion solo log, no matar el proceso
    console.error('Migration warning:', err.message);
    if (!isProduction) process.exit(1);
  }
}

if (!isProduction) {
  // En local: correr migraciones y levantar servidor
  runMigrations().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
} else {
  // En Vercel: migraciones en background, no bloqueamos el export
  runMigrations();
}

// Exportar para Vercel (serverless)
module.exports = app;
