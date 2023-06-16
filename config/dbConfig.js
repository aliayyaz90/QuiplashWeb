const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.DB_URI;

const dbConfig = async () => {
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('You have successfully connected to the database.');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
};

module.exports = dbConfig;