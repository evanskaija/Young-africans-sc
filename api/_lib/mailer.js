const net = require('net');
const tls = require('tls');
const os = require('os');

const bool = (value, fallback = false) => {
  if (typeof value === 'undefined' || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const config = () => ({
  // SMTP settings must come from the active environment. In particular, do not
  // silently fall back to local Mailpit when a production deployment is missing
  // its provider configuration.
  host: String(process.env.SMTP_HOST || '').trim(),
  port: Number.parseInt(process.env.SMTP_PORT || '', 10),
  secure: bool(process.env.SMTP_SECURE, false),
  requireTls: bool(process.env.SMTP_REQUIRE_TLS, false),
  auth: bool(process.env.SMTP_AUTH, Boolean(process.env.SMTP_USER || process.env.SMTP_PASSWORD)),
  user: String(process.env.SMTP_USER || ''),
  password: String(process.env.SMTP_PASSWORD || ''),
  fromEmail: String(process.env.SMTP_FROM_EMAIL || '').trim(),
  fromName: String(process.env.SMTP_FROM_NAME || 'Young Africans SC').trim(),
  timeoutMs: Math.min(Math.max(Number.parseInt(process.env.SMTP_TIMEOUT_MS || '10000', 10), 1000), 30000)
});

const headerValue = (value) => String(value || '').replace(/[\r\n]/g, ' ').trim();
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

class SmtpSession {
  constructor(socket, timeoutMs) {
    this.socket = socket;
    this.buffer = '';
    this.waiting = [];
    this.responses = [];
    this.closed = false;
    this.socket.setEncoding('utf8');
    this.socket.setTimeout(timeoutMs);
    this.socket.on('data', (chunk) => { this.buffer += chunk; this.consume(); });
    this.socket.on('timeout', () => this.fail(new Error('SMTP connection timed out.')));
    this.socket.on('error', (error) => this.fail(error));
    this.socket.on('close', () => { if (!this.closed) this.fail(new Error('SMTP connection closed unexpectedly.')); });
  }

  consume() {
    while (this.buffer.includes('\r\n')) {
      const lineEnd = this.buffer.indexOf('\r\n');
      const line = this.buffer.slice(0, lineEnd);
      this.buffer = this.buffer.slice(lineEnd + 2);
      const code = Number.parseInt(line.slice(0, 3), 10);
      if (!Number.isInteger(code)) continue;
      if (line[3] === '-') continue;
      const pending = this.waiting.shift();
      if (pending) pending.resolve({ code, line });
      else this.responses.push({ code, line });
    }
  }

  response() { return this.responses.length ? Promise.resolve(this.responses.shift()) : new Promise((resolve, reject) => this.waiting.push({ resolve, reject })); }

  async command(command, expected) {
    this.socket.write(`${command}\r\n`);
    const response = await this.response();
    if (!expected.includes(response.code)) throw new Error(`SMTP command failed with ${response.code}.`);
    return response;
  }

  async data(message) {
    const stuffed = message.split('\r\n').map((line) => line.startsWith('.') ? `.${line}` : line).join('\r\n');
    this.socket.write(`${stuffed}\r\n.\r\n`);
    const response = await this.response();
    if (response.code !== 250) throw new Error(`SMTP message was rejected with ${response.code}.`);
  }

  fail(error) { while (this.waiting.length) this.waiting.shift().reject(error); }
  close() { this.closed = true; this.socket.end(); }
}

const openSocket = (settings) => new Promise((resolve, reject) => {
  const onConnect = (socket) => resolve(new SmtpSession(socket, settings.timeoutMs));
  const socket = settings.secure
    ? tls.connect({ host: settings.host, port: settings.port, servername: settings.host, rejectUnauthorized: true }, () => onConnect(socket))
    : net.createConnection({ host: settings.host, port: settings.port }, () => onConnect(socket));
  socket.once('error', reject);
  socket.setTimeout(settings.timeoutMs, () => { socket.destroy(new Error('SMTP connection timed out.')); });
});

const sendEmail = async ({ to, subject, text, html }) => {
  const settings = config();
  if (!settings.host || !Number.isInteger(settings.port)) throw new Error('SMTP_HOST and SMTP_PORT must be configured.');
  if (settings.requireTls && !settings.secure) throw new Error('SMTP_REQUIRE_TLS requires SMTP_SECURE=true for an encrypted SMTP connection.');
  if (settings.auth && (!settings.user || !settings.password)) throw new Error('SMTP_AUTH requires SMTP_USER and SMTP_PASSWORD.');
  const recipient = headerValue(to);
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error('A valid recipient email is required.');
  const sender = headerValue(settings.fromEmail);
  if (!sender || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) throw new Error('SMTP_FROM_EMAIL must be configured with a valid sender email.');
  const session = await openSocket(settings);
  try {
    const greeting = await session.response();
    if (greeting.code !== 220) throw new Error(`SMTP greeting failed with ${greeting.code}.`);
    await session.command(`EHLO ${headerValue(os.hostname()) || 'localhost'}`, [250]);
    if (settings.auth) {
      await session.command('AUTH LOGIN', [334]);
      await session.command(Buffer.from(settings.user).toString('base64'), [334]);
      await session.command(Buffer.from(settings.password).toString('base64'), [235]);
    }
    await session.command(`MAIL FROM:<${sender}>`, [250]);
    await session.command(`RCPT TO:<${recipient}>`, [250, 251]);
    await session.command('DATA', [354]);
    const message = [
      `From: ${headerValue(settings.fromName)} <${sender}>`,
      `To: <${recipient}>`,
      `Subject: ${headerValue(subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${cryptoRandomId()}@${headerValue(settings.host) || 'localhost'}>`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="YANGA_OTP_BOUNDARY"',
      '',
      '--YANGA_OTP_BOUNDARY',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      String(text || ''),
      '',
      '--YANGA_OTP_BOUNDARY',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      String(html || ''),
      '',
      '--YANGA_OTP_BOUNDARY--'
    ].join('\r\n');
    await session.data(message);
    await session.command('QUIT', [221, 250]);
  } finally { session.close(); }
};

const cryptoRandomId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
const sendOtpEmail = ({ to, code, expiresMinutes }) => sendEmail({
  to,
  subject: 'Young Africans SC — MY YANGA verification code',
  text: `Your MY YANGA verification code is ${code}. It expires in ${expiresMinutes} minutes and can be used once. If you did not request this, you can ignore this email.`,
  html: `<div style="font-family:Arial,sans-serif;color:#003b24;max-width:560px"><p style="font-size:12px;letter-spacing:2px;color:#8a7110;font-weight:bold">YOUNG AFRICANS SC / MY YANGA</p><h1 style="font-size:28px">Verify your account ownership</h1><p>Your one-time verification code is:</p><p style="font-size:34px;letter-spacing:9px;font-weight:bold;color:#003b24">${escapeHtml(code)}</p><p>This code expires in ${escapeHtml(expiresMinutes)} minutes and can be used once.</p><p style="color:#68736c;font-size:12px">If you did not request this code, you can ignore this email.</p></div>`
});

module.exports = { config, sendEmail, sendOtpEmail };
