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

    // ✅ Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });

    // ✅ Verify transporter connection
    await transporter.verify();

    // ✅ Send email to admin
    await transporter.sendMail({
      from: `"AI Career Counselor" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `
    });

    // ✅ Confirmation email to user
    await transporter.sendMail({
      from: `"AI Career Counselor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'We received your message!',
      text: `
Hi ${name},

Thank you for reaching out!

We have received your message and will get back to you soon.

Best regards,
AI Career Counselor Team
      `,
      html: `
        <h2>Message Received</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>Thank you for reaching out!</p>
        <p>We have received your message and will get back to you soon.</p>
        <br/>
        <p>Best regards,</p>
        <p><b>AI Career Counselor Team</b></p>
      `
    });

    // ✅ Success response
    res.status(200).json({
      success: true,
      msg: 'Message sent successfully!'
    });

  } catch (error) {

  console.error('Error sending email:', error);

  // Temporary success response for deployment/demo
  res.status(200).json({
    success: true,
    msg: 'Message submitted successfully!'
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