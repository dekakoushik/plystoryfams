import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Real SMTP Dispatcher Endpoint
app.post('/api/send-test-email', async (req, res) => {
  try {
    const data = req.body || {};
    const { host, port, encryption, username, password, from_email, from_name, to, subject, message, html } = data;

    if (!host || !username || !password || !to) {
      return res.status(400).json({ success: false, error: 'Missing required SMTP parameters or password.' });
    }

    const isSecure = encryption === 'SSL/TLS' || Number(port) === 465;

    const transporter = nodemailer.createTransport({
      host: host,
      port: Number(port) || 587,
      secure: isSecure,
      auth: {
        user: username,
        pass: password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${from_name || 'Plystory FAMS Notifications'}" <${from_email || username}>`,
      to: to,
      subject: subject || '[Plystory FAMS] Real SMTP Verification',
      text: message || 'This is a verified automated dispatch from Plystory FAMS.',
      html: html || `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6fa; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <h2 style="color: #6366f1; margin: 0 0 16px 0;">PLYSTORY FAMS</h2>
            <h3 style="color: #10b981; margin-top: 0;">✓ Outbound SMTP Mail Connection Verified</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Hello Administrator,<br><br>
              Your outbound mail gateway for <strong>${username}</strong> has been successfully configured and verified.
            </p>
            <table style="width: 100%; font-size: 13px; margin: 20px 0; border-collapse: collapse;">
              <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>SMTP Host:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${host}:${port}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Encryption:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${encryption || 'STARTTLS'}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Sender:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${from_name} &lt;${from_email || username}&gt;</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Timestamp:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${new Date().toISOString()}</td></tr>
            </table>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              Sent by Plystory Fixed Asset Management System (FAMS) • Corporate HO
            </p>
          </div>
        </div>
      `
    });

    return res.status(200).json({ 
      success: true, 
      messageId: info.messageId, 
      response: info.response || 'Delivered 250 OK' 
    });

  } catch (err) {
    console.error('SMTP Mail Dispatch Error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'SMTP Authentication / Network Connection Failed' 
    });
  }
});

// Health check endpoint for Dockploy / Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA fallback for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FAMS] Production server running on http://0.0.0.0:${PORT}`);
});
