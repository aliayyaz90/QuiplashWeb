const { lobbyService } = require('../services');

// create a lobby
const createLobby = async (req, res) => {
    try {
        const data = await lobbyService.createLobby(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

// join lobby with lobby code
const joinLobby = async (req, res) => {
    try {
        const data = await lobbyService.joinLobby(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

// play lobby
const playLobby = async (req, res) => {
    try {
        const data = await lobbyService.playLobby(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

const statusLobby = async (req, res) => {
    try {
        const data = await lobbyService.statusLobby(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};



const startRound = async (req, res) => {
    try {
        const data = await lobbyService.startRound(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

const answerQuestions = async (req, res) => {
    try {
        const data = await lobbyService.answerQuestions(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};


const commonQuestion = async (req, res) => {
    try {
        const data = await lobbyService.commonQuestion(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

const votingQuestions = async (req, res) => {
    try {
        const data = await lobbyService.votingQuestions(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

const roundWinnder = async (req, res) => {
    try {
        const data = await lobbyService.roundWinnder(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

module.exports = { createLobby, joinLobby, playLobby, statusLobby, startRound, answerQuestions, commonQuestion,votingQuestions, roundWinnder };