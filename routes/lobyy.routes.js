const express = require('express');
const router = express.Router();

const { lobbyController } = require('./../controllers');

router.post('/create', lobbyController.createLobby);
router.post('/join', lobbyController.joinLobby);
router.post('/play', lobbyController.playLobby);

module.exports = router;