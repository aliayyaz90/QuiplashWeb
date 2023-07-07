const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lobbySchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
    },
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
    },
    rounds: {
        type: [Number],
        enum: [1, 2, 3],
        default: [1],
    },
});

const Lobby = mongoose.model('lobby', lobbySchema);

module.exports = Lobby;