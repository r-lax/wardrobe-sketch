// server/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connection with MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const sketchRoutes = require('./routes/sketchRoutes');
const lookupRoutes = require('./routes/lookupRoutes');

app.use('/api/sketches', sketchRoutes);
app.use('/api/lookups', lookupRoutes);
console.log('Routes mounted');

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
