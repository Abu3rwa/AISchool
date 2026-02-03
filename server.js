const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
