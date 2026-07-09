const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

// All customer routes are private and isolated to the authenticated customer user
router.get('/dashboard', authMiddleware, customerController.getCustomerDashboard);
router.get('/conversations', authMiddleware, customerController.getCustomerConversations);
router.post('/conversations/:id/messages', authMiddleware, customerController.sendCustomerConversationMessage);
router.get('/conversations/:id', authMiddleware, customerController.getCustomerConversationDetail);
router.get('/bookings', authMiddleware, customerController.getCustomerBookings);
router.put('/profile', authMiddleware, customerController.updateCustomerProfile);
router.put('/request-update', authMiddleware, customerController.requestUpdateOrReschedule);
router.post('/request-update', authMiddleware, customerController.requestUpdateOrReschedule);

// Public route: no auth required. Optional JWT resolution is handled inside the controller.
router.post('/enquiries', customerController.createEnquiry);

module.exports = router;
