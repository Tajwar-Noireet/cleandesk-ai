const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const authMiddleware = require('../middleware/authMiddleware');

// Get business profile associated with the authenticated user
router.get('/me', authMiddleware, businessController.getBusinessOfCurrentUser);
router.get('/user', authMiddleware, businessController.getBusinessOfCurrentUser);

// Get business by ID - Public (so chatbot can fetch profile details)
router.get('/:id', businessController.getBusiness);

// Create and update business profile - Private (needs owner auth)
router.post('/', authMiddleware, businessController.createBusiness);
router.put('/:id', authMiddleware, businessController.updateBusiness);

module.exports = router;
