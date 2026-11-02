const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

router.get('/overview', queryController.getDbOverview);
router.get('/table/:table', queryController.getTableData);
router.post('/execute', queryController.executeCustomQuery);
router.post('/seed', queryController.seedDatabase);

module.exports = router;
