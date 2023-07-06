const express = require('express');
const router = express.Router();

const { lobbyController } = require('./../controllers');

router.post('/create', lobbyController.create);
router.post('/join', lobbyController.join);
router.post('/play', lobbyController.play);
router.post('/status', lobbyController.status);

module.exports = router;