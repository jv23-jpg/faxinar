const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 4001;

// Optional SendGrid integration
const SG_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM || 'noreply@faxinar.local';
let sgMail = null;
if (SG_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(SG_KEY);
  } catch (err) {
    console.warn('SendGrid not installed or misconfigured:', err.message);
    sgMail = null;
  }
}

// Serve static frontend (production build)
const fs = require('fs');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
app.post('/api/send-invite', async (req, res) => {
  const { email, link, type = 'invite', from } = req.body || {};
  if (!email || !link) return res.status(400).json({ error: 'email and link are required' });

  if (!sgMail) {
    // Not configured: return 501 but accept payload so UI can still mark as sent if desired
    return res.status(501).json({ message: 'SendGrid not configured on server' });
  }

  try {
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: type === 'invite' ? 'Convite Faxinar' : 'Notificação Faxinar',
      text: `Olá, você foi convidado. Ative sua conta aqui: ${link}`,
      html: `<p>Olá,</p><p>Você foi convidado. Ative sua conta <a href="${link}">clicando aqui</a>.</p><p>Enviado por: ${from || 'admin'}</p>`,
    };
    await sgMail.send(msg);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Erro enviando e-mail:', err?.response?.body || err.message || err);
    return res.status(500).json({ error: 'failed to send' });
  }
});

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Send invite server running on port ${PORT}`));

module.exports = app;
