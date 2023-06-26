const { Lobby, User } = require("../models");

const usedCodes = new Set();

const create = async (req, res) => {
    try {
        const { body } = req;

        // Create a new user
        const user = await User.create(body);

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

module.exports = { create, join };