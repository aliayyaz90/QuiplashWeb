const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roundTypes = ['1', '2', '3'];

const questionSchema = new Schema({
    question: {
        type: String,
        required: true,
    },
    lobbyUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    answer: {
        type: String,
        default: '',
    }
});


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
    lobbyLocked: {
        type: Boolean,
        default: false,
    },
    rounds: [{
        round: {
            type: String,
            enum: roundTypes,
            default: '1',
        },
        loop1: [questionSchema],
        loop2: [questionSchema],
    }],
});

const Lobby = mongoose.model('lobby', lobbySchema);

module.exports = Lobby;