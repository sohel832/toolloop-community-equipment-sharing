const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getPayments);
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/refund', paymentController.refundPayment);
router.patch('/:id/status', paymentController.updatePaymentStatus);

module.exports = router;
