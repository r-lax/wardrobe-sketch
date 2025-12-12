// server/models/color.js

const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  hex: { type: String }, // optional for color picker
});

module.exports = mongoose.model('Color', ColorSchema);
