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

        // Update the user's canPlayGame status
        await User.findByIdAndUpdate(id, { canPlayGame: true }, { new: true });

        // Lock the lobby and start the round
        const updatedLobby = await Lobby.findByIdAndUpdate(
            lobby._id.toString(),
            { lobbyLocked: true },
            { new: true }
        );

        // Start the round and get the updated lobby data
        const result = await startRound(updatedLobby);
        return {
            code: 'success',
            message: Constants.GAME_PLAYED_SUCCESSFULLY,
            lobby: result,
        };
    } catch (error) {
        console.log(error);
        return Constants.INTERNAL_SEVER_ERROR;
    }
};



const statusLobby = async (req, res) => {
    try {
        const { lobbyId, userId, status } = req.body;
        const lobby = await Lobby.findOne({ _id: lobbyId });

        if (!lobby) {
            return 'Lobby not found.';
        }

        if (!status && lobby.playerList.includes(userId)) {
            // Remove userId from the playerList using array filtering
            lobby.playerList = lobby.playerList.filter((player) => player !== userId);

            if (lobby.lobbyCreator.toString() === userId) {
                lobby.lobbyCreator = lobby.playerList[0];
            }

            await lobby.save();
        }

        return lobby;

    } catch (error) {
        console.log(error, 'error')
        return 'Internal server error.';
    }
};


const updateRound = async (_id, round) => {
    const result = await Lobby.findByIdAndUpdate(
        _id,
        { $push: { rounds: { round: round, questions: [] } } },
        { new: true }
    )
    return result
}


const startRound = async (req, res) => {
    try {
        const { body } = req;
        if (body) {
            console.log(body, 'body');
            let findLobby = await Lobby.findOne({ lobbyCode: body.lobbyCode });
            if (body.round === '1') {
                if (findLobby?.rounds[0]?.loop1?.length > 0) {

                } else {
                    return 'Lobby match not start yet.'
                }
            } else if (body.round === '2') {
                if (findLobby?.rounds[1]?.loop1?.length > 0) {

                } else {
                    return 'Lobby match not start yet.'
                }
            }
            return findLobby;
        } else {
            const { _id, rounds } = req;
            if (rounds.length === 0) {
                const newRound = '1';
                await updateRound(_id.toString(), newRound);
            } else if (rounds[0].loop1.length > 0) {
                const n = 2;
                getRandomNthQuestion(n, rounds[0].loop1);

                return 'ssssssssssssssssssssss'
            }

            // Fetch the lobby with populated playerList
            const lobby = await Lobby.findById(_id);
            console.log(lobby, 'lobby lobby lobby lobby lobby')

            // Fetch random questions equal to the number of players in the lobby
            const questions = await Question.aggregate().sample(lobby.playerList.length);
            console.log(questions, 'questions questions questions')
            // Generate the loop1 array using map and random questions

            const loop1Array = lobby.playerList.map((player, index) => {
                if (index < questions.length) {
                    // If the index is within the bounds of 'questions', use the question at the corresponding index
                    return {
                        question: questions[index].question,
                        lobbyUserId: player._id,
                    };
                } else {
                    // If 'questions' does not have enough elements, provide a default question or handle it as needed
                    return {
                        question: 'Default question',
                        lobbyUserId: player._id,
                    };
                }
            });

            lobby.rounds[0].loop1 = loop1Array;
            lobby.save();

            return lobby;
        }

    } catch (error) {
        console.log(error);
        return 'Internal server error.';
    }
};

function getRandomNthQuestion(n, loop) {
    if (n <= 0 || n > loop.length) {
        console.log("Invalid value of n.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * loop.length);
    const nthQuestion = loop[randomIndex].question;
    console.log("The random nth question is:", nthQuestion);
}



const answerQuestions = async (req, res) => {
    try {
        const { lobbyId, userId, round, loop, question, answer } = req.body;

        const lobby = await Lobby.findById(lobbyId).populate('playerList');

        if (!lobby) {
            return 'User or lobby not found.';
        }

        const loop1Array = lobby.rounds[0].loop1;
        let userFound = false;

        for (const item of loop1Array) {
            if (item.lobbyUserId.toString() === userId) {
                const currentTime = Date.now();
                const timeDifference = currentTime - item.expiresAt;
                const timeLimit = 90000;

                if (timeDifference > timeLimit) {
                    return 'Answer time(90S) has expired.';
                } else {
                    item.answer = answer;
                    userFound = true;
                    break;
                }
            }
        }

        if (!userFound) {
            return 'User not found in the lobby.';
        }

        const result = await lobby.save();
        return {
            code: 'success',
            message: 'Answer saved successfully.',
            lobby: result,
        };
    } catch (error) {
        return 'Internal server error.';
    }
};



module.exports = { createLobby, joinLobby, playLobby, statusLobby, startRound, answerQuestions };