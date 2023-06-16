const express = require('express');
const router = express.Router();

const { lobbyController } = require('./../controllers');
router.post('/create', lobbyController.create);

module.exports = router;