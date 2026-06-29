const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

// Private dashboard routes for managing conversations
router.get('/:businessId', authMiddleware, conversationController.getConversationsByBusiness);
router.get('/detail/:conversationId', authMiddleware, conversationController.getConversationDetail);

module.exports = router;
