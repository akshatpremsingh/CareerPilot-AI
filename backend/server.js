// server.js (replace your current file with this)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
let onboardingRoutes;
try {
  onboardingRoutes = require('./routes/onboarding');
} catch (e) {
  onboardingRoutes = null; // optional
}

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup - in production set CLIENT_URL to your frontend origin
const CLIENT_URL = process.env.CLIENT_URL || '*';
app.use(cors({ origin: CLIENT_URL }));

// --- Health route (must be before catch-all static route) ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Mount API routes (ensure these are registered before serving frontend)
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
if (onboardingRoutes) app.use('/api/onboarding', onboardingRoutes);

// Contact form route (keeps your implementation)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, msg: 'All fields are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"AI Career Counselor" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      text: message,
      html: `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br/>${message}</p>
      `
    });

    // confirmation email to user
    await transporter.sendMail({
      from: `"AI Career Counselor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message!`,
      text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest regards,\nAI Career Counselor Team`,
      html: `
        <p>Hi <b>${name}</b>,</p>
        <p>Thank you for reaching out! We have received your message and will get back to you soon.</p>
        <p>Best regards,<br/><b>AI Career Counselor Team</b></p>
      `
    });

    res.json({ success: true, msg: 'Message sent successfully and confirmation email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, msg: 'Failed to send message.', error: error.message });
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
