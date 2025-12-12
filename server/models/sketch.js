// server/models/sketch.js
const mongoose = require('mongoose');

const SketchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  color_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: false },
  style_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Style', required: false },
  image: String,
  createdAt: { type: Date, default: Date.now },
});

// Indexes to support filtering and sorting
SketchSchema.index({ category_id: 1 });
SketchSchema.index({ color_id: 1 });
SketchSchema.index({ style_id: 1 });
SketchSchema.index({ createdAt: -1 });
SketchSchema.index({ category_id: 1, createdAt: -1 });


module.exports = mongoose.model('Sketch', SketchSchema);
