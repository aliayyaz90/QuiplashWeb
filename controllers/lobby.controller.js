const { lobbyService } = require('../services');

const create = async (req, res) => {
    try {
        const data = await lobbyService.create(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

const join = async (req, res) => {
    try {
        const data = await lobbyService.join(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

const play = async (req, res) => {
    try {
        const data = await lobbyService.play(req);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
};

module.exports = { create,join,play };