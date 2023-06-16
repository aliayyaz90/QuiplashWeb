const { Lobby } = require("../models");

const create = async (req, res) => {
    try {
        const {body}= req;
        const data = await Lobby.create(body);
        return data;
    } catch (error) {
        throw error;
    }
};

module.exports = { create };