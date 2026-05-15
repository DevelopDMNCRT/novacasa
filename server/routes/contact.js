const express = require('express');
const router = express.Router();
const { sendContactFormEmail } = require('../email');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    await sendContactFormEmail({ name, email, message });
    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (err) {
    console.error('Error enviando correo de contacto:', err);
    res.status(500).json({ error: 'Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde.' });
  }
});

module.exports = router;
