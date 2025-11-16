const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');

// Define chat schema for MongoDB
const chatSchema = new mongoose.Schema({
  userId: String,
  message: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});
const Chat = mongoose.model('Chat', chatSchema);

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// POST /api/chat
// body: { message: "user message" }
// Requires auth middleware (adds req.user from JWT or session)
router.post('/', auth, async (req, res) => {
  const { message } = req.body;
  const userId = req.user?.id; // Assuming auth middleware sets req.user

  if (!message) {
    return res.status(400).json({ msg: 'No message' });
  }

  // Fallback if no GOOGLE_API_KEY
  if (!process.env.GOOGLE_API_KEY) {
    return res.json({ reply: `Echo: ${message}` });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({
      history: [], // Add past messages for context if needed
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    });

    const systemPrompt = 'You are CareerPilot, a career guidance assistant. Provide practical, concise advice on jobs, skills, education, or resumes.';
    const fullMessage = `${systemPrompt}\nUser: ${message}`;

    const result = await chat.sendMessage(fullMessage);
    const reply = result.response.text().trim();

    // Save to MongoDB
    if (userId) {
      await Chat.create({ userId, message, response: reply });
    }

    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ msg: 'AI error' });
  }
});

module.exports = router;