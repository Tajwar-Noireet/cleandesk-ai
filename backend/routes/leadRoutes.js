const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route to submit leads (from chatbot)
router.post('/', leadController.createLead);

// Private dashboard routes for managing leads
router.get('/:businessId', authMiddleware, leadController.getLeadsByBusiness);
router.put('/:id/status', authMiddleware, leadController.updateLeadStatus);

module.exports = router;
