const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.get('/', ratingController.getRatings);
router.post('/', ratingController.createRating);

module.exports = router;
