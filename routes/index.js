const express = require('express');
const router = express.Router();

const indexRoutes = require('./index.routes');
const lobbyRoutes = require('./lobyy.routes');
const questionRoutes = require('./question.routes.js');

router.use('/server', indexRoutes);
router.use('/lobby', lobbyRoutes);
router.use('/question', questionRoutes);

module.exports = router;