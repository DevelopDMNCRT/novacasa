const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordResetEmail(to, name, resetUrl) {
  await transporter.sendMail({
    from: `"Quiniela Nova Casa" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Recuperación de contraseña - Quiniela Nova Casa',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
        <div style="background: linear-gradient(to right, #006847 33.33%, #ffffff 33.33%, #ffffff 66.66%, #CE1126 66.66%); height: 6px; border-radius: 4px 4px 0 0;"></div>
        <div style="padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px;">Recuperación de contraseña</h1>
          <p style="color: #6b6375; margin: 0 0 24px;">Quiniela Mundialista Nova Casa</p>

          <p style="margin: 0 0 16px;">Hola <strong>${name}</strong>,</p>
          <p style="margin: 0 0 24px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para continuar:</p>

          <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background: #006847; color: #fff; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px; margin-bottom: 24px;">
            Restablecer contraseña
          </a>

          <p style="margin: 0 0 8px; font-size: 13px; color: #6b6375;">Este enlace expira en <strong>1 hora</strong>.</p>
          <p style="margin: 0 0 24px; font-size: 13px; color: #6b6375;">Si no solicitaste este cambio, ignora este correo — tu contraseña seguirá siendo la misma.</p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #b0b0c0; margin: 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br/><a href="${resetUrl}" style="color: #006847; word-break: break-all;">${resetUrl}</a></p>
        </div>
      </div>
    `,
  });
}

async function sendContactFormEmail({ name, email, message }) {
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL || 'elmer.eyca@gmail.com';
  await transporter.sendMail({
    from: `"Contacto - Quiniela Nova Casa" <${process.env.SMTP_USER}>`,
    to: recipient,
    replyTo: email,
    subject: `Nuevo mensaje de contacto de ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
        <div style="background: #006847; height: 6px; border-radius: 4px 4px 0 0;"></div>
        <div style="padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px;">Nuevo mensaje de contacto</h1>
          <p style="color: #6b6375; margin: 0 0 24px;">Has recibido un nuevo mensaje desde el formulario del sitio web.</p>

          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px;"><strong>Nombre:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
          </div>

          <p style="margin: 0 0 8px;"><strong>Mensaje:</strong></p>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #b0b0c0; margin: 0;">Puedes responder directamente a este correo para contestar a ${name}.</p>
        </div>
      </div>
    `,
  });
}

async function sendMatchReminderEmail({ to, name, match, frontendUrl }) {
  const quinielaUrl = `${frontendUrl}/quiniela`;
  await transporter.sendMail({
    from: `"Quiniela Nova Casa" <${process.env.SMTP_USER}>`,
    to,
    subject: `⏳ ¡Pronóstico por cerrar! ${match.home_team} vs ${match.away_team}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
        <div style="background: #eab308; height: 6px; border-radius: 4px 4px 0 0;"></div>
        <div style="padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px;">¡Tiempo límite aproximándose!</h1>
          <p style="color: #6b6375; margin: 0 0 24px;">Quiniela Mundialista Nova Casa</p>

          <p style="margin: 0 0 16px;">Hola <strong>${name}</strong>,</p>
          <p style="margin: 0 0 20px; line-height: 1.5;">Los pronósticos para el siguiente partido de la Copa del Mundo están por cerrar (faltan menos de 6 horas) y notamos que aún no has ingresado tu predicción:</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px; text-align: center; margin: 24px 0;">
            <div style="font-weight: 800; font-size: 18px; color: #0f172a; margin-bottom: 6px;">
              ${match.home_team} vs ${match.away_team}
            </div>
            <div style="font-size: 14px; color: #64748b; font-weight: 600;">
              ${match.date_text} | ${match.time_text}
            </div>
          </div>

          <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.5; color: #334155;">Te sugerimos entrar ahora mismo para no perder valiosos puntos en el tablero de posiciones.</p>

          <a href="${quinielaUrl}" style="display: block; padding: 14px 24px; background: #006847; color: #fff; font-weight: 700; text-decoration: none; border-radius: 8px; text-align: center; letter-spacing: 0.5px;">
            Completar mi Quiniela
          </a>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">Si el botón no funciona, copia este enlace en tu navegador:<br/><a href="${quinielaUrl}" style="color: #006847;">${quinielaUrl}</a></p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendContactFormEmail, sendMatchReminderEmail };
