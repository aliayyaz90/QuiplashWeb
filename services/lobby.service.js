const { Lobby, User, Question } = require("../models");
const { lobbyHelper } = require("../helpers");
const Constants = require('../utils/constants');

const usedCodes = new Set();

// create a lobby
const createLobby = async (req, res) => {
    try {
        const { body } = req;

        // Create a new user
        const user = await User.create(body);
        if (user) {
            // Generate a unique lobby code
            let lobbyCode = await lobbyHelper.generateUniqueLobbyCode();

            // Check if the code is unique
            while (usedCodes.has(lobbyCode)) {
                lobbyCode = await lobbyHelper.generateUniqueLobbyCode();
            }

            // Store the code in the used codes set
            usedCodes.add(lobbyCode);

            // Create a lobby associated with the user
            const lobbyData = {
                lobbyCode,
                lobbyCreator: user._id,
                playerList: [user._id]
            };

            // Create the lobby
            const lobby = await Lobby.create(lobbyData);

            // Populate the lobby with associated user and player data
            await lobby.populate(['lobbyCreator', 'playerList']);
            return lobby;
        }

    } catch (error) {
        console.log(error);
        throw error;
    }
};

// join lobby with lobby code
const joinLobby = async (req, res) => {
    try {
        const { lobbyCode } = req.body;

        // Find the lobby with the given lobbyCode
        let findLobby = await Lobby.findOne({ lobbyCode: lobbyCode });

        if (findLobby) {

            // Check if the lobby is already locked
            if (findLobby.lobbyLocked) {
                return Constants.LOBBY_LOCKED;
            }

            // Generate a random name for the user
            const randomName = await lobbyHelper.generateRandomName();

            // Create a new user with the random name
            const user = await User.create({ name: randomName });

            // Add the new user to the playerList array in the lobby
            const newUserList = [...findLobby.playerList, user._id];

            // Update the lobby's playerList with the new user
            const updatedLobby = await Lobby.findByIdAndUpdate(
                findLobby._id,
                { playerList: newUserList },
                { new: true }
            ).populate(['lobbyCreator', 'playerList']);

            return updatedLobby;
        }
    } catch (error) {
        console.log(error);
    }
};

// play lobby
const playLobby = async (req, res) => {
    try {
        const { id } = req.body;

        // Check if the user exists
        const user = await User.findOne({ _id: id });
        if (!user) {
            return Constants.USER_NOT_FOUND;
        }

        // Check if the user has already created a lobby
        const lobby = await Lobby.findOne({ lobbyCreator: id });
        if (!lobby) {
            return Constants.CREATE_LOBBY_FIRST;
        }

        // Check if the lobby has at least 3 players
        if (lobby.playerList.length < 3) {
            return Constants.MINIMUM_PLAYERS_REQUIRED;
        }

        // Update the user's canPlayGame property to true
        const updatedUser = await User.findByIdAndUpdate(id, { canPlayGame: true }, { new: true });

        // Lock the lobby
        const updatedLobby = await Lobby.findByIdAndUpdate(lobby._id, { lobbyLocked: true }, { new: true });
        // console.log('111111111111111111')

        // Return the success response
        const aaaa = await startRound(updatedLobby);
        // console.log(aaaa, 'aaaaaaaaaaaaaaaaaaaa');
        return {
            code: 'success',
            message: Constants.GAME_PLAYED_SUCCESSFULLY,
            lobby: aaaa,
        };
    } catch (error) {
        return Constants.INTERNAL_SEVER_ERROR;
    }
};


const statusLobby = async (req, res) => {
    try {
        const { lobbyId, userId, status } = req.body;

        const lobby = await Lobby.findOne({ _id: lobbyId });

        if (!lobby) {
            return Constants.LOBBY_NOT_FOUND;
        }
        if (!status && lobby.playerList.includes(userId)) {
            lobby.playerList = lobby.playerList.remove(userId);
            if (lobby.lobbyCreator.toString() === userId) {
                lobby.lobbyCreator = lobby.playerList[0];
            }
            await lobby.save();
            return lobby;
        } else {
            return lobby
        }

    } catch (error) {
        return 'Internal server error.';
    }
};

const updateRound = async (_id, round) => {
    console.log(_id, round);
    Lobby.findByIdAndUpdate(
        _id,
        { $push: { rounds: { round: round, questions: [] } } },
        { new: true }
    )
        .then(updatedLobby => {
            if (updatedLobby) {
                console.log('New round 1 added to the lobby:', updatedLobby);
            }
        })
        .catch(error => {
            console.log(error)
        });
}

const startRound = async (req, res) => {
    try {
        const { body } = req;
        if (body) {
        } else {
            const { _id, lobbyCode, lobbyCreator, playerList, lobbyLocked, rounds } = req;
            if (rounds.length === 0) {
                const newRound = '1'
                updateRound(_id.toString(), newRound);
            }
            const lobby = await Lobby.findById(_id.toString()).populate('playerList');

            const questions = await Question.aggregate().sample(lobby.playerList.length);

            lobby.playerList.forEach((player, index) => {
                const randomQuestion = questions[index];
                lobby.rounds[0].loop1.push({
                    question: randomQuestion.question,
                    lobbyUserId: player._id,
                });
            });


            return lobby;
        }
    } catch (error) {

    }
}


const answerQuestions = async (req, res) => {
    try {
        const { body } = req;
        console.log(body, 'body')
    } catch (error) {

    }
}



module.exports = { createLobby, joinLobby, playLobby, statusLobby, startRound, answerQuestions };