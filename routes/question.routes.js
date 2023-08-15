const express = require('express');
const router = express.Router();

const { questionController } = require('./../controllers');

router.get('/getQuestions', questionController.getQuestions);
router.post('/addQuestions', questionController.addQuestion);

module.exports = router;