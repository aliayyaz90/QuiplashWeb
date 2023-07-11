const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lobbySchema = new mongoose.Schema({
    lobbyCode: {
        type: String,
        unique: true,
    },
    minPlayers: {
        type: Number,
        min: 3,
    },
    maxPlayers: {
        type: Number,
        max: 32,
    },
    lobbyCreator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    playerList: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    round: {
        type: Schema.Types.ObjectId,
        ref: 'Round',
    },
    lobbyLocked: {
        type: Boolean,
        default: false,
    }
});

const Lobby = mongoose.model('lobby', lobbySchema);

module.exports = Lobby;