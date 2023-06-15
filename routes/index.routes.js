const express = require('express');
const router = express.Router();

// server health
router.get('/health', (req, res) => {
  res.send('Server is working fine!');
});

module.exports = router;