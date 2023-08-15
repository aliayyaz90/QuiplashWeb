const express = require('express');
const router = express.Router();

const { lobbyController } = require('./../controllers');

router.get('/all', lobbyController.getLobbies);
router.get('/get-waiting-lobbies', lobbyController.getWaitingLobbies);
router.post('/create', lobbyController.createLobby);
router.post('/join', lobbyController.joinLobby);
router.post('/play', lobbyController.playLobby);
router.post('/status', lobbyController.statusLobby);
router.post('/startRound', lobbyController.startRound);
router.post('/answer-the-questions', lobbyController.answerQuestions);
router.post('/commonQuestion', lobbyController.commonQuestion);
router.post('/votingQuestions', lobbyController.votingQuestions);
router.post('/roundWinner', lobbyController.roundWinner);
router.post('/lobbyWinner', lobbyController.lobbyWinner);


module.exports = router;