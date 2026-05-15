const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendMatchReminderEmail } = require('../email');
const { broadcastPush } = require('../webpush');

// Cron endpoint: GET /api/cron/send-reminders
// This endpoint will be configured in vercel.json to run periodically.
router.get('/send-reminders', async (req, res) => {
  const logData = {
    email_reminders: { success: false, matches_processed: 0, emails_sent: 0 },
    push_notifications: { success: false, jornadas_notified: [], messages_sent: 0 }
  };

  try {
    // 1. Security Check
    // CRON_SECRET should be set in your Vercel environment variables.
    // Vercel automatically adds Authorization: Bearer <CRON_SECRET> to requests it triggers.
    const authHeader = req.headers.authorization;
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;
    
    // Only enforce in production to ease local testing
    if (process.env.NODE_ENV === 'production') {
      if (!authHeader || authHeader !== expectedToken) {
        console.warn('Unauthorized access attempt to Cron endpoint.');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const now = new Date();
    const inSixHours = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // ==========================================
    // TAREA A: RECORDATORIOS POR CORREO (EMAILS)
    // ==========================================
    try {
      // 2. Query upcoming matches starting in <= 6 hours (that haven't had notifications sent)
      const upcomingMatchesQuery = `
        SELECT * FROM matches 
        WHERE match_date <= $1 
          AND match_date > $2 
          AND reminder_sent = FALSE
      `;
      
      const matchesResult = await db.query(upcomingMatchesQuery, [inSixHours, now]);
      const matches = matchesResult.rows;

      console.log(`[Cron-Emails] Found ${matches.length} upcoming matches requiring notifications.`);

      if (matches.length > 0) {
        let totalEmailsSent = 0;

        // 3. Process each match
        for (const match of matches) {
          console.log(`[Cron-Emails] Processing match ${match.home_team} vs ${match.away_team} (ID: ${match.id})`);

          // 4. Query users who HAVE NOT submitted a prediction for this match
          const targetUsersQuery = `
            SELECT id, nombre, email 
            FROM users 
            WHERE activo = TRUE
              AND is_admin = FALSE
              AND NOT EXISTS (
                SELECT 1 FROM predictions 
                WHERE predictions.user_id = users.id 
                  AND predictions.match_id = $1
              )
          `;
          
          const usersResult = await db.query(targetUsersQuery, [match.id]);
          const users = usersResult.rows;
          
          console.log(`[Cron-Emails] Found ${users.length} users who haven't predicted this match.`);

          // 5. Send emails to each user
          for (const user of users) {
            try {
              await sendMatchReminderEmail({
                to: user.email,
                name: user.nombre,
                match: match,
                frontendUrl: FRONTEND_URL
              });
              totalEmailsSent++;
            } catch (emailErr) {
              console.error(`[Cron-Emails] Error sending email to ${user.email} for match ID ${match.id}:`, emailErr.message);
            }

            // 5.2. Enviar Notificación WebPush adicional si el usuario la tiene configurada
            try {
              const userSubsRes = await db.query(
                'SELECT id, endpoint, auth, p256dh FROM push_subscriptions WHERE user_id = $1',
                [user.id]
              );
              const userSubs = userSubsRes.rows;

              if (userSubs.length > 0) {
                const userPushPayload = {
                  notification: {
                    title: '⏳ ¡Pronóstico por cerrar!',
                    body: `Recuerda ingresar tu predicción para el partido ${match.home_team} vs ${match.away_team} (faltan menos de 6 horas).`,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    data: {
                      url: `${FRONTEND_URL}/quiniela`
                    },
                    vibrate: [100, 50, 100]
                  }
                };
                await broadcastPush(userSubs, userPushPayload, db);
              }
            } catch (pushErr) {
              console.error(`[Cron-Emails] Error sending push reminder to user ID ${user.id}:`, pushErr.message);
            }
          }

          // 6. Mark match as reminder sent
          await db.query('UPDATE matches SET reminder_sent = TRUE WHERE id = $1', [match.id]);
          console.log(`[Cron-Emails] Updated match ID ${match.id} reminder_sent = TRUE.`);
        }

        logData.email_reminders = { success: true, matches_processed: matches.length, emails_sent: totalEmailsSent };
      } else {
        logData.email_reminders = { success: true, message: 'No pending reminders.', matches_processed: 0, emails_sent: 0 };
      }
    } catch (emailFlowErr) {
      console.error('[Cron-Emails ERROR]:', emailFlowErr);
      logData.email_reminders = { success: false, error: emailFlowErr.message };
    }

    // ==========================================
    // TAREA B: NOTIFICACIONES WEB PUSH (FIN JORNADA)
    // ==========================================
    try {
      // 1. Find any completed jornada that HAS NOT had its push notification sent.
      // A jornada is complete when ALL of its matches have populated home_score_real & away_score_real.
      // Exclude any jornada that already has an entry in jornada_notifications.
      const completedJornadasQuery = `
        SELECT DISTINCT m.jornada 
        FROM matches m
        WHERE NOT EXISTS (
          SELECT 1 FROM matches m2 
          WHERE m2.jornada = m.jornada 
            AND (m2.home_score_real IS NULL OR m2.away_score_real IS NULL)
        )
        AND NOT EXISTS (
          SELECT 1 FROM jornada_notifications jn 
          WHERE jn.jornada = m.jornada
        )
      `;

      const completedRes = await db.query(completedJornadasQuery);
      const completedJornadas = completedRes.rows;

      console.log(`[Cron-Push] Found ${completedJornadas.length} newly completed jornadas.`);

      if (completedJornadas.length > 0) {
        // 2. Fetch all valid push subscriptions from DB
        const subsRes = await db.query('SELECT id, endpoint, auth, p256dh FROM push_subscriptions');
        const subscriptions = subsRes.rows;

        console.log(`[Cron-Push] Active subscriptions database pool: ${subscriptions.length} devices.`);

        if (subscriptions.length > 0) {
          let broadcastSuccesses = 0;

          for (const item of completedJornadas) {
            const currentJornada = item.jornada;
            console.log(`[Cron-Push] Triggering notification for completed Jornada: ${currentJornada}`);

            // Prepare notification payload
            // Formatting it clearly for standard desktop/mobile WebPush API wrappers
            const pushPayload = {
              notification: {
                title: `¡Jornada ${currentJornada} finalizada! 🏁`,
                body: `¿En qué lugar vas de tu tabla de posiciones? ¡Entra ahora a revisarlo!`,
                icon: '/favicon.ico', // standard fallback
                badge: '/favicon.ico',
                data: {
                  url: `${FRONTEND_URL}/leaderboard`
                },
                vibrate: [100, 50, 100]
              }
            };

            // 3. Broadcast to all devices
            const report = await broadcastPush(subscriptions, pushPayload, db);
            broadcastSuccesses += report.successes;

            // 4. Save that this Jornada was processed to avoid double notify
            await db.query('INSERT INTO jornada_notifications (jornada) VALUES ($1) ON CONFLICT DO NOTHING', [currentJornada]);
            
            logData.push_notifications.jornadas_notified.push(currentJornada);
          }
          logData.push_notifications.success = true;
          logData.push_notifications.messages_sent = broadcastSuccesses;

        } else {
          logData.push_notifications = { success: true, message: 'No active push subscriptions found.', jornadas_notified: [], messages_sent: 0 };
        }
      } else {
        logData.push_notifications = { success: true, message: 'No completed jornadas pending notification.', jornadas_notified: [], messages_sent: 0 };
      }
    } catch (pushFlowErr) {
      console.error('[Cron-Push ERROR]:', pushFlowErr);
      logData.push_notifications = { success: false, error: pushFlowErr.message };
    }

    // Retornar reporte unificado
    return res.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      results: logData
    });

  } catch (err) {
    console.error('[Cron General Critical Error]:', err);
    return res.status(500).json({ 
      error: 'Critical backend failure during cron loop processing.', 
      detail: err.message,
      partially_processed: logData
    });
  }
});

module.exports = router;
