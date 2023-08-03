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
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: function () {
            // Set the default expiry time to 90 seconds from the current time
            return new Date(Date.now() + 90 * 1000);
        },
    },
}, { timestamps: true });


const commonQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
    },
    answer: {
        type: String,
    },
    lobbyUserId: {
        type: Schema.Types.ObjectId,
    },
    votedBy: [
        {
            type: Schema.Types.ObjectId,
            default: []
        }
    ],
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
        loop1: {
            type: [questionSchema],
            default: [],
        },
        loop2: {
            type: [questionSchema],
            default: [],
        },
        commonQuestions: [
            {
                question: {
                    type: String,
                    default: '',
                },
                answerBy: {
                    type: [commonQuestionSchema],
                    default: [],
                },
            }
        ]
    }],
});

const Lobby = mongoose.model('lobby', lobbySchema);

module.exports = Lobby;