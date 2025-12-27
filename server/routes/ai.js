const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { queryAI } = require('../services/aiService');
const { body, validationResult } = require('express-validator');

// AI query endpoint
router.post('/query', authenticate, [
  body('query').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        message: 'AI service is not configured. Please set OPENAI_API_KEY in environment variables.' 
      });
    }

    const { query } = req.body;
    const result = await queryAI(query, req.user.id, req.user.role);

    res.json({
      response: result.response,
      suggestions: result.suggestions
    });
  } catch (error) {
    console.error('AI Query Error:', error);
    res.status(500).json({ 
      message: 'Error processing AI query', 
      error: error.message 
    });
  }
});

module.exports = router;

