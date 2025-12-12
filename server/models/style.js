// server/models/style.js
const mongoose = require('mongoose');

const StyleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Style', StyleSchema);