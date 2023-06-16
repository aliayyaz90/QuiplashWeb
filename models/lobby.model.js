const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lobbySchema = new mongoose.Schema({
    username: {
        type: String,
    },
    lobbyCode: {
        type: String,
        unique: true
    },
    minPlayers: {
        type: Number,
        default: 3,
        min: 3
    },
    maxPlayers: {
        type: Number,
    },
    lobbyCreator: {
        type: String,
    },
    lobbyPlayPermission: {
        type: Boolean,
        default: false
    },
    round: {
        type: Schema.Types.ObjectId,
        ref: 'Round',
    }
});

const Lobby = mongoose.model('lobby', lobbySchema);

module.exports = Lobby;