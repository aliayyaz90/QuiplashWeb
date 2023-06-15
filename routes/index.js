const express = require('express');
const router = express.Router();

const indexRoutes = require('./index.routes');

router.use('/server', indexRoutes);

module.exports = router;