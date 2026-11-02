const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

router.get('/item/:itemId', availabilityController.getAvailability);
router.post('/', availabilityController.addAvailability);
router.put('/:id', availabilityController.updateAvailability);
router.delete('/:id', availabilityController.deleteAvailability);

module.exports = router;
