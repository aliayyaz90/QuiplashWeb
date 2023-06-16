const { lobbyService } = require('../services');

const create = async (req, res) => {
    try {
        const data = await lobbyService.create(req);
        res.send(data);
    } catch (error) {
        setResponse(res, { type: 'serverError' });
    }
};

module.exports = { create };