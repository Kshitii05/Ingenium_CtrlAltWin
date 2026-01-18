const express = require('express');
const router = express.Router();
const medicalChatbotController = require('../../controllers/medicalChatbotController');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

// Chat with AI assistant
router.post('/chat', authMiddleware, roleMiddleware('medical_user'), medicalChatbotController.chatWithAI);

module.exports = router;
