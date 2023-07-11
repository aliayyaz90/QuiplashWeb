const { v4: uuidv4 } = require('uuid');

const generateUniqueLobbyCode = () => new Promise(async (resolve, reject) => {
    try {
        // Generate a unique UUID code
        var code = uuidv4().substr(0, 6).toUpperCase();
        // Return the generated code
        resolve(code);
    } catch (error) {
        reject(error)
    }
});

const generateRandomName = () => new Promise(async (resolve, reject) => {
    try {
        // Array of adjectives to choose from
        const adjectives = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];

        // Array of nouns to choose from
        const nouns = ["Cat", "Dog", "Bird", "Lion", "Tiger", "Bear"];

        // Select a random adjective from the array
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

        // Select a random noun from the array
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        resolve(randomAdjective + " " + randomNoun);
    } catch (error) {
        reject(error)
    }
});

module.exports = {
    generateUniqueLobbyCode,
    generateRandomName,
};