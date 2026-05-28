require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');

const app = express();

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS setup
const CLIENT_URL = process.env.CLIENT_URL || '*';
app.use(cors({ origin: CLIENT_URL }));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);

// 📩 Contact form route
app.post('/api/contact', async (req, res) => {

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      msg: 'All fields are required.'
    });
  }

  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email to admin
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

    // Confirmation email to user
    await transporter.sendMail({
      from: `"AI Career Counselor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message!`,
      text: `Hi ${name},

Thank you for reaching out! We have received your message and will get back to you soon.

Best regards,
AI Career Counselor Team`,
      html: `
        <p>Hi <b>${name}</b>,</p>
        <p>Thank you for reaching out! We have received your message and will get back to you soon.</p>
        <p>Best regards,<br/><b>AI Career Counselor Team</b></p>
      `
    });

    res.json({
      success: true,
      msg: 'Message sent successfully and confirmation email sent!'
    });

  } catch (error) {

    console.error('Error sending email:', error);

    res.status(500).json({
      success: false,
      msg: 'Failed to send message.',
      error: error.message
    });

  }

});

// ✅ Serve frontend static files
const frontendPath = path.join(__dirname, 'public');

app.use(express.static(frontendPath));

// ✅ Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});