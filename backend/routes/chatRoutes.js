const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chat endpoint (Public)
router.post('/message', chatController.handleMessage);

module.exports = router;
