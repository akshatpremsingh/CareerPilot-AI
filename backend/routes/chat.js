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
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

// Initialize Google Gemini API client (will be undefined if no key)
let genAI = null;
if (process.env.GOOGLE_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  } catch (e) {
    console.error('Failed to initialize GoogleGenerativeAI client:', e && e.message ? e.message : e);
    genAI = null;
  }
}

// Helper: canned fallback reply
function fallbackReply(message) {
  // Short, useful fallback so UI remains helpful during downtime
  return `Sorry — our AI service is temporarily unavailable. Meanwhile: here are quick suggestions for "${message}":\n` +
    `1) Clarify your goal (job, college, skills). 2) List 3 steps you can take this week. 3) Ask for resume tips or interview prep.\n` +
    `If you'd like, try again in a moment.`;
}

// POST /api/chat
// body: { message: "user message" }
// Requires auth middleware (adds req.user from JWT or session)
router.post('/', auth, async (req, res) => {
  const { message } = req.body;
  const userId = req.user?.id; // Assuming auth middleware sets req.user

  if (!message) {
    return res.status(400).json({ msg: 'No message' });
  }

  // If no API key / client available — immediate fallback
  if (!genAI) {
    const reply = `Echo: ${message} — (AI not configured)`;
    try { if (userId) await Chat.create({ userId, message, response: reply }); } catch (e) { console.error('Save chat failed:', e); }
    return res.json({ reply });
  }

  // Try call to generative model; catch all errors and fallback gracefully
  try {
    // allow overriding model via env var if you want to test other names
    const modelName = process.env.GEN_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const chat = model.startChat({
      history: [], // Add past messages for context if desired
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    });

    const systemPrompt = 'You are CareerPilot, a career guidance assistant. Provide practical, concise advice on jobs, skills, education, or resumes.';
    const fullMessage = `${systemPrompt}\nUser: ${message}`;

    const result = await chat.sendMessage(fullMessage);
    // Some SDK variants return different shapes — handle defensively
    const reply = (result?.response?.text && typeof result.response.text === 'function')
      ? result.response.text().trim()
      : (result?.candidates?.[0]?.content ?? result?.output ?? String(result)).toString().trim();

    // Save to MongoDB (non-blocking - if save fails, still return reply)
    if (userId) {
      Chat.create({ userId, message, response: reply }).catch(e => console.error('Save chat failed:', e && e.message ? e.message : e));
    }

    return res.json({ reply });
  } catch (err) {
    // Log full error for debugging (but don't expose internals to client)
    console.error('Gemini API error (chat):', err && (err.stack || err.message) ? (err.stack || err.message) : err);

    // If the error looks like a 404 or model-not-found, include hint in logs
    const errMsg = (err && err.message) ? err.message.toLowerCase() : '';
    if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('model')) {
      console.warn('Gemini model likely not available:', process.env.GEN_MODEL || 'default model');
    }

    // Friendly fallback reply
    const reply = fallbackReply(message);

    // Save fallback to DB too
    try {
      if (userId) await Chat.create({ userId, message, response: reply });
    } catch (saveErr) {
      console.error('Save chat fallback failed:', saveErr && saveErr.message ? saveErr.message : saveErr);
    }

    // Return fallback so frontend remains functional
    return res.json({ reply });
  }
});

module.exports = router;
