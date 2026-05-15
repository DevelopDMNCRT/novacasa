const db = require('../db');

async function up() {
  // 1. Create push_subscriptions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      auth TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // 2. Create table to track sent round notifications to prevent spamming
  await db.query(`
    CREATE TABLE IF NOT EXISTS jornada_notifications (
      jornada VARCHAR(50) PRIMARY KEY,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { up };
