const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.DB_URI;

const dbConfig = async () => {
    console.log('Waiting for db config.');
};

module.exports = dbConfig;