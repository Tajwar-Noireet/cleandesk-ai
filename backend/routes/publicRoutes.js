const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/businesses', publicController.listPublicBusinesses);
router.get('/businesses/:slug/services', publicController.getPublicBusinessServices);
router.get('/businesses/:slug/faqs', publicController.getPublicBusinessFAQs);
router.get('/businesses/:slug', publicController.getPublicBusiness);

// Public gig discovery routes
router.get('/services', publicController.listPublicServices);
router.get('/services/:businessSlug/:serviceSlug', publicController.getPublicService);

module.exports = router;
