const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route to fetch FAQs for chatbot setup
router.get('/:businessId', faqController.getFAQsByBusiness);

// Private routes to add, edit, or delete FAQs
router.post('/', authMiddleware, faqController.createFAQ);
router.put('/:id', authMiddleware, faqController.updateFAQ);
router.delete('/:id', authMiddleware, faqController.deleteFAQ);

module.exports = router;
