const express = require('express');
const router = express.Router();

const indexRoutes = require('./index.routes');
const lobbyRoutes = require('./lobyy.routes');

router.use('/server', indexRoutes);
router.use('/lobby', lobbyRoutes);

module.exports = router;