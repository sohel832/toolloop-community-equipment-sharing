const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.get('/', communityController.getCommunities);
router.get('/:id', communityController.getCommunityById);
router.post('/', communityController.createCommunity);
router.post('/:community_id/join', communityController.joinCommunity);
router.post('/:community_id/leave', communityController.leaveCommunity);

module.exports = router;
