const { Lobby, User } = require("../models");

const usedCodes = new Set();

const create = async (req, res) => {
    try {
        const { body } = req;

        // Create a new user
        const user = await User.create(body);
        if (user) {
            // Generate a unique lobby code
            let lobbyCode = generateUniqueLobbyCode();

            // Check if the code is unique
            while (usedCodes.has(lobbyCode)) {
                lobbyCode = generateUniqueLobbyCode();
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

function generateUniqueLobbyCode() {
    // Define the characters to be used in the lobby code
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    // Initialize an empty string to store the generated code
    var code = '';

    // Generate a 6-character code
    for (var i = 0; i < 6; i++) {
        // Select a random index from the characters string
        var randomIndex = Math.floor(Math.random() * characters.length);

        // Retrieve the character at the random index and append it to the code string
        code += characters.charAt(randomIndex);
    }

    // Return the generated code
    return code;
}


const join = async (req, res) => {
    try {
        const { lobbyCode } = req.body;

        // Find the lobby with the given lobbyCode
        let findLobby = await Lobby.findOne({ lobbyCode: lobbyCode });

        if (findLobby) {

            // Check if the lobby is already locked
            if (findLobby.lobbyLocked) {
                return 'Lobby is already locked.';
            }

            // Generate a random name for the user
            const randomName = generateRandomName();

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

function generateRandomName() {
    // Array of adjectives to choose from
    const adjectives = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];

    // Array of nouns to choose from
    const nouns = ["Cat", "Dog", "Bird", "Lion", "Tiger", "Bear"];

    // Select a random adjective from the array
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

    // Select a random noun from the array
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    // Return the combination of the random adjective and noun as the generated random name
    return randomAdjective + " " + randomNoun;
}

const play = async (req, res) => {
    try {
        const { id } = req.body;

        // Check if the user exists
        const user = await User.findOne({ _id: id });
        if (!user) {
            return 'User not found.';
        }

        // Check if the user has already created a lobby
        const lobby = await Lobby.findOne({ lobbyCreator: id });
        if (!lobby) {
            return 'You need to create a lobby first.';
        }

        // Check if the lobby has at least 3 players
        if (lobby.playerList.length < 3) {
            return 'You need at least 3 players to perform this action.';
        }

        // Update the user's canPlayGame property to true
        const updatedUser = await User.findByIdAndUpdate(id, { canPlayGame: true }, { new: true });

        // Lock the lobby
        const updatedLobby = await Lobby.findByIdAndUpdate(lobby._id, { lobbyLocked: true }, { new: true });
        const lastIndex = updatedLobby.rounds - 1;

        // Return the success response
        return {
            code: 'success',
            message: `Game Round ${updatedLobby.rounds[lastIndex]} has started! Get ready to test your skills and knowledge. Good luck to all participants!`,
            lobby: updatedLobby
        };
    } catch (error) {
        return 'Internal server error.';
    }
};

const status = async (req, res) => {
    try {
        const { lobbyId, userId, status } = req.body;

        const lobby = await Lobby.findOne({ _id: lobbyId });

        if (!lobby) {
            return 'lobby not found.';
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


module.exports = { create, join, play, status };