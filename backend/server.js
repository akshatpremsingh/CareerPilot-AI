// server.js (drop-in replacement)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
let onboardingRoutes;
try {
  onboardingRoutes = require('./routes/onboarding');
} catch (e) {
  onboardingRoutes = null; // optional
}

const app = express();

// --- IMPORTANT: trust proxy so X-Forwarded-For is trusted (necessary on Render) ---
app.set('trust proxy', 1);

// security headers
app.use(helmet());

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS setup - in production set CLIENT_URL to your frontend origin
const CLIENT_URL = process.env.CLIENT_URL || '*';
app.use(cors({ origin: CLIENT_URL }));

// Rate limiter: basic protection for auth/chat endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // adjust as needed
  standardHeaders: true,
  legacyHeaders: false,
  // keyGenerator uses req.ip which works correctly when trust proxy is set
  keyGenerator: (req /*, res*/) => {
    return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});
app.use(limiter);

// --- Health route (must be before catch-all static route) ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Mount API routes (ensure these are registered before serving frontend)
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
if (onboardingRoutes) app.use('/api/onboarding', onboardingRoutes);

// Helper: create a reusable transporter with sensible defaults and timeouts
function createTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || 465);
  const secure = process.env.EMAIL_SECURE === 'false' ? false : true; // default true for 465
  const authUser = process.env.EMAIL_USER;
  const authPass = process.env.EMAIL_PASS;

  // if credentials are missing, return null (caller should handle)
  if (!authUser || !authPass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: authUser, pass: authPass },
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 30000),
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 30000),
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT || 30000),
  });
}

// Contact form route (keeps your implementation but safer)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, msg: 'All fields are required.' });
  }

  const transporter = createTransporter();

  if (!transporter) {
    // gracefully fail if mailer not configured; still store feedback if you want
    console.warn('Mailer not configured: missing EMAIL_USER / EMAIL_PASS / EMAIL_HOST env vars');
    return res.status(503).json({ success: false, msg: 'Email service not configured. Message not sent.' });
  }

  try {
    // send message to site owner
    await transporter.sendMail({
      from: `"AI Career Counselor" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      text: message,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br/>${message}</p>`
    });

    // confirmation email to user (non-blocking - catch errors)
    try {
      await transporter.sendMail({
        from: `"AI Career Counselor" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `We received your message!`,
        text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest regards,\nAI Career Counselor Team`,
        html: `<p>Hi <b>${name}</b>,</p><p>Thank you for reaching out! We have received your message and will get back to you soon.</p><p>Best regards,<br/><b>AI Career Counselor Team</b></p>`
      });
    } catch (innerErr) {
      console.error('Confirmation email failed:', innerErr && innerErr.message ? innerErr.message : innerErr);
      // don't fail the whole request if confirmation fails
    }

    res.json({ success: true, msg: 'Message received. A confirmation email was sent if possible.' });
  } catch (error) {
    console.error('Error sending email (primary):', error && error.message ? error.message : error);
    // avoid revealing internals to clients
    res.status(500).json({ success: false, msg: 'Failed to send message.' });
  }
});

// Serve frontend static files (only after API routes)
const frontendPath = path.join(__dirname, 'public');
if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  // catch-all for SPA (must be last)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Global error handler (prevents crashes on uncaught route errors)
app.use(function (err, req, res, next) {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Database connect + start server
const PORT = process.env.PORT || 5000;
// support both names to be safe
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err.message || err);
  // exit so deployment platform marks failure
  process.exit(1);
});

// keep the process alive but log unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
