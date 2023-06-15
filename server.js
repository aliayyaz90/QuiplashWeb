const express = require('express');
const dotenv = require('dotenv');
const logger = require('morgan');
const dbConfig = require('./config/dbConfig');
const indexRoutes = require('./routes');

dotenv.config();

const PORT = process.env.PORT || 8000;

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to the database
dbConfig();

// Routes
app.use('/api/v1', indexRoutes);

// Default route for unmatched paths
app.use('*', (req, res) => {
  res.send('Something went wrong...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});