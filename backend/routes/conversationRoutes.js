const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

// Private dashboard routes for managing conversations
router.get('/', authMiddleware, conversationController.getOwnerConversations);
router.get('/business/:businessId', authMiddleware, conversationController.getConversationsByBusiness);
router.get('/detail/:conversationId', authMiddleware, conversationController.getConversationDetail);
router.get('/:id', authMiddleware, conversationController.getConversationDetail);
router.post('/:id/messages', authMiddleware, conversationController.sendOwnerMessage);
router.post('/:id/ai-draft', authMiddleware, conversationController.generateAiDraft);
router.post('/:id/ai-send', authMiddleware, conversationController.generateAndSendAiReply);
router.post('/:id/reviewed', authMiddleware, conversationController.markReviewed);

module.exports = router;
