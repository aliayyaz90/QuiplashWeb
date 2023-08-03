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

        if (lobby?.rounds[0]?.loop1?.length) {
            return "mafi mil ski ha"
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
    console.log(result, 'asdasdasdas')
    return result
}


const startRound = async (req, res) => {
    try {
        const { body } = req;
        if (body) {
            console.log(body, 'body');
            let findLobby = await Lobby.findOne({ lobbyCode: body.lobbyCode });
            console.log('11111111111111111111');
            if (body.round === '0') {
                return 'Lobby match not start yet.'
            }
            else if (body.round === '1') {
                if (findLobby?.rounds[0]?.loop1?.length > 0 && findLobby?.rounds[0]?.loop2?.length) {
                    return "mafi de dao"
                }
                if (findLobby?.rounds[0]?.loop1?.length > 0) {

                    console.log('222222222222222222');

                    const questions = findLobby?.rounds[0]?.loop1;
                    const users = findLobby.playerList;

                    const loop2 = [];

                    for (let outer = 0; outer < questions.length; outer++) {
                        const round = [];

                        for (let inner = 0; inner < users.length; inner++) {
                            const targetQuestion = questions[(inner + outer) % questions.length];
                            round.push({ lobbyUserId: users[inner], question: targetQuestion.question });

                        }
                        loop2.push(round);
                    }

                    findLobby.rounds[0].loop2 = loop2[1];

                    findLobby.save();

                    return findLobby;

                } else {
                    return 'Lobby match not start yet.'
                }
            } else if (body.round === '2') {
                if (findLobby?.rounds[1]?.loop1?.length > 0) {
                    console.log('8888888888888888888888888 %%%%%%%%%%%%%%%55 *8888888888888888888')
                    if (findLobby?.rounds[1]?.loop1?.length > 0 && findLobby?.rounds[1]?.loop2?.length) {
                        return "mafi de dao"
                    }
                    if (findLobby?.rounds[1]?.loop1?.length > 0) {

                        console.log('222222222222222222');

                        const questions = findLobby?.rounds[1]?.loop1;
                        const users = findLobby.playerList;

                        const loop2 = [];

                        for (let outer = 0; outer < questions.length; outer++) {
                            const round = [];

                            for (let inner = 0; inner < users.length; inner++) {
                                const targetQuestion = questions[(inner + outer) % questions.length];
                                round.push({ lobbyUserId: users[inner], question: targetQuestion.question });

                            }
                            loop2.push(round);
                        }

                        findLobby.rounds[1].loop2 = loop2[1];

                        findLobby.save();

                        return findLobby;

                    } else {
                        return 'Lobby match not start yet.'
                    }
                    console.log('8888888888888888888888888 %%%%%%%%%%%%%%%55 *8888888888888888888')
                } else {
                    console.log(findLobby, '#########################')
                    if (findLobby.rounds.length === 1) {
                        console.log(findLobby, '********************')
                        findLobby.rounds.push({
                            round: '2',
                            loop1: [],
                            loop2: [],
                        })
                        console.log(findLobby, '*********_________________________***********')
                        // const newRound = '2';
                        // await updateRound(findLobby._id.toString(), newRound);
                    }
                    // Fetch random questions equal to the number of players in the lobby
                    const questions = await Question.aggregate().sample(findLobby.playerList.length);
                    console.log(questions, 'questions questions questions')
                    // Generate the loop1 array using map and random questions

                    const loop1Array = findLobby.playerList.map((player, index) => {
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
                    findLobby.rounds[1].loop1 = ""
                    findLobby.rounds[1].loop1 = loop1Array;
                    findLobby.save();

                    return findLobby;
                }
            } else if (body.round === '3') {
                if (findLobby?.rounds[2]?.loop1?.length > 0) {
                    console.log('8888888888888888888888888 %%%%%%%%%%%%%%%55 *8888888888888888888')
                    if (findLobby?.rounds[2]?.loop1?.length > 0 && findLobby?.rounds[2]?.loop2?.length) {
                        return "mafi de dao"
                    }
                    if (findLobby?.rounds[2]?.loop1?.length > 0) {

                        console.log('222222222222222222');

                        const questions = findLobby?.rounds[2]?.loop1;
                        const users = findLobby.playerList;

                        const loop2 = [];

                        for (let outer = 0; outer < questions.length; outer++) {
                            const round = [];

                            for (let inner = 0; inner < users.length; inner++) {
                                const targetQuestion = questions[(inner + outer) % questions.length];
                                round.push({ lobbyUserId: users[inner], question: targetQuestion.question });

                            }
                            loop2.push(round);
                        }

                        findLobby.rounds[2].loop2 = loop2[1];

                        findLobby.save();

                        return findLobby;

                    } else {
                        return 'Lobby match not start yet.'
                    }
                    console.log('8888888888888888888888888 %%%%%%%%%%%%%%%55 *8888888888888888888')
                } else {
                    console.log(findLobby, '#########################')
                    if (findLobby.rounds.length === 2) {
                        console.log(findLobby, '********************')
                        findLobby.rounds.push({
                            round: '3',
                            loop1: [],
                            loop2: [],
                        })
                        console.log(findLobby, '*********_________________________***********')
                        // const newRound = '2';
                        // await updateRound(findLobby._id.toString(), newRound);
                    }
                    // Fetch random questions equal to the number of players in the lobby
                    const questions = await Question.aggregate().sample(findLobby.playerList.length);
                    console.log(questions, 'questions questions questions')
                    // Generate the loop1 array using map and random questions

                    const loop1Array = findLobby.playerList.map((player, index) => {
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
                    findLobby.rounds[2].loop1 = ""
                    findLobby.rounds[2].loop1 = loop1Array;
                    findLobby.save();

                    return findLobby;
                }
            }
            return "something went wrong"
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

        let loopsArray;
        let userFound = false;

        if (round === '1' && loop === '1') {
            loopsArray = lobby.rounds[0].loop1;
        } else if (round === '1' && loop === '2') {
            loopsArray = lobby.rounds[0].loop2;
        }


        for (const item of loopsArray) {
            if (item.lobbyUserId.toString() === userId) {
                const currentTime = Date.now();
                const timeDifference = currentTime - item.expiresAt;
                const timeLimit = 90000;

                if (item.answer) {
                    return "mafi mil ski ha k nai"
                }

                if (timeDifference > timeLimit) {
                    item.answer = "time-out";
                    lobby.save();
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

const commonQuestion = async (req, res) => {
    const { lobbyId, round } = req.body;
    let findLobby = await Lobby.findOne({ _id: lobbyId });
    console.log(findLobby, 'findLobby findLobby findLobby')
    if (findLobby) {
        let response = [];
        if (round === '1') {
            if (findLobby?.rounds[0]?.commonQuestions?.length > 0) {
                return "sir mafi de do"
            }

            findLobby.rounds[0].loop1.forEach(iteration1 => {
                findLobby.rounds[0].loop2.forEach(iteration3 => {
                    if (iteration1.question === iteration3.question) {
                        const obj = {
                            question: iteration3.question,
                            answerBy: [
                                {
                                    question: iteration1.question,
                                    lobbyUserId: iteration1.lobbyUserId,
                                    answer: iteration1.answer,
                                },
                                {
                                    question: iteration3.question,
                                    lobbyUserId: iteration3.lobbyUserId,
                                    answer: iteration3.answer,
                                }
                            ],
                        }
                        response.push(obj);
                    }
                });

            });
            console.log(findLobby, '00000000000000000')

            findLobby.rounds[0].commonQuestions = response;

        }
        else if (round === '2') {
            if (findLobby?.rounds[1]?.commonQuestions?.length > 0) {
                return "sir mafi de do"
            } else {
                console.log(findLobby, 'findLobby findLobby')
                findLobby.rounds[1].loop1.forEach(iteration1 => {
                    findLobby.rounds[1].loop2.forEach(iteration3 => {
                        if (iteration1.question === iteration3.question) {
                            console.log(iteration3, 'sssssssssssssssssssss')
                            const obj = {
                                question: iteration3.question,
                                answerBy: [
                                    {
                                        question: iteration1.question,
                                        lobbyUserId: iteration1.lobbyUserId,
                                        answer: iteration1.answer,
                                    },
                                    {
                                        question: iteration3.question,
                                        lobbyUserId: iteration3.lobbyUserId,
                                        answer: iteration3.answer,
                                    }
                                ],
                            }
                            response.push(obj);
                        }
                    });

                });
                findLobby.rounds[1].commonQuestions = response;
            }

        }
        else if (round === '3') {
            if (findLobby?.rounds[2]?.commonQuestions?.length > 0) {
                return "sir mafi de do"
            } else {
                findLobby.rounds[2].loop1.forEach(iteration1 => {
                    findLobby.rounds[2].loop2.forEach(iteration3 => {
                        if (iteration1.question === iteration3.question) {
                            console.log(iteration3, 'sssssssssssssssssssss')
                            const obj = {
                                question: iteration3.question,
                                answerBy: [
                                    {
                                        question: iteration1.question,
                                        lobbyUserId: iteration1.lobbyUserId,
                                        answer: iteration1.answer,
                                    },
                                    {
                                        question: iteration3.question,
                                        lobbyUserId: iteration3.lobbyUserId,
                                        answer: iteration3.answer,
                                    }
                                ],
                            }
                            response.push(obj);
                        }
                    });

                });
                findLobby.rounds[2].commonQuestions = response;
            }
        }

        findLobby.save();
        return {
            code: 'success',
            response: findLobby,
        };

    } else {
        return "Lobby not found";
    }
};

const votingQuestions = async (req, res) => {
    const { round, lobbyId, lobbyUserId, answer, questionId } = req.body;
    console.log(round, lobbyId, lobbyUserId, answer, questionId, 'round, lobbyId, lobbyUserId, answer')
    let findLobby = await Lobby.findOne({ _id: lobbyId });
    if (round === "1") {
        findLobby.rounds[0].commonQuestions.forEach(iteration1 => {
            iteration1.answerBy.forEach(iteration2 => {
                if (iteration2._id.toString() === questionId) {
                    if (iteration2.votedBy.length > 0 && !iteration2.votedBy.toString().includes(lobbyUserId)) {
                        iteration2.votedBy.push(lobbyUserId);
                    }
                    else {
                        iteration2.votedBy = [lobbyUserId];
                    }
                }
            });
        });
    } else if (round === "2") {
        findLobby.rounds[1].commonQuestions.forEach(iteration1 => {
            iteration1.answerBy.forEach(iteration2 => {
                if (iteration2._id.toString() === questionId) {
                    if (iteration2.votedBy.length > 0 && !iteration2.votedBy.toString().includes(lobbyUserId)) {
                        iteration2.votedBy.push(lobbyUserId);
                    }
                    else {
                        iteration2.votedBy = [lobbyUserId];
                    }
                }
            });
        });
    }
    else if (round === "3") {
        findLobby.rounds[2].commonQuestions.forEach(iteration1 => {
            iteration1.answerBy.forEach(iteration2 => {
                if (iteration2._id.toString() === questionId) {
                    if (iteration2.votedBy.length > 0 && !iteration2.votedBy.toString().includes(lobbyUserId)) {
                        iteration2.votedBy.push(lobbyUserId);
                    }
                    else {
                        iteration2.votedBy = [lobbyUserId];
                    }
                }
            });
        });
    }
    findLobby.save();
    return findLobby;
}

const roundWinnder = async (req, res) => {
    const { round, lobbyId } = req.body;
    const round_1_points = 1;
    const round_2_points = 2;
    const round_3_points = 1;
    let findLobby = await Lobby.findOne({ _id: lobbyId });
    let winnerArray = []
    if (round === '1') {
        findLobby.rounds[0].commonQuestions.forEach(iteration1 => {
            iteration1.answerBy.forEach(iteration2 => {
                winnerArray.push({ lobbyUserId: iteration2.lobbyUserId, question: iteration2.question, questionId: iteration2._id, voted: iteration2.votedBy.length });
            });
        });
        return winnerArray;
    } else if (round === '2') {
        findLobby.rounds[1].commonQuestions.forEach(iteration1 => {
            iteration1.answerBy.forEach(iteration2 => {
                winnerArray.push({ lobbyUserId: iteration2.lobbyUserId, question: iteration2.question, questionId: iteration2._id, voted: iteration2.votedBy.length });
            });
        });
        return winnerArray;
    } else if (round === '3') {
        findLobby.rounds[2].commonQuestions.forEach(iteration1 => {
            iteration1.answerBy.forEach(iteration2 => {
                winnerArray.push({ lobbyUserId: iteration2.lobbyUserId, question: iteration2.question, questionId: iteration2._id, voted: iteration2.votedBy.length });
            });
        });
        return winnerArray;
    } else {
        return "sorry"
    }
}


module.exports = { createLobby, joinLobby, playLobby, statusLobby, startRound, answerQuestions, commonQuestion, votingQuestions, roundWinnder };