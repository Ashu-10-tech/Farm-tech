// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors =  require('cors'); // Use const cors = require('cors')

dotenv.config();
const app = express();

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Body parser

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error(err));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tenders', require('./routes/tenderRoutes'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));