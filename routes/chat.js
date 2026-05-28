const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');
const mongoose = require('mongoose');

// MongoDB schema
const chatSchema = new mongoose.Schema({
  userId: String,
  message: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);

// OpenRouter client
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// POST /api/chat
router.post('/', auth, async (req, res) => {
  const { message } = req.body;

  const userId = req.user?.userId;

  if (!message) {
    return res.status(400).json({ msg: 'No message' });
  }

  try {
    const completion = await client.chat.completions.create({
      model:'openai/gpt-3.5-turbo',

      messages: [
        {
          role: 'system',
          content:
            'You are CareerPilot, an AI career guidance assistant. Provide concise, practical advice about careers, jobs, skills, resumes, and education.',
        },
        {
          role: 'user',
          content: message,
        },
      ],

      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;

    // Save chat
    if (userId) {
      await Chat.create({
        userId,
        message,
        response: reply,
      });
    }

    res.json({ reply });

  } catch (err) {
    console.error('AI API error:', err);

    res.status(500).json({
      reply: 'AI service temporarily unavailable.',
    });
  }
});

module.exports = router;

