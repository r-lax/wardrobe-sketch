// server/routes/sketchRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const Sketch = require('../models/sketch');
const Category = require('../models/category');
const Color = require('../models/color');
const Style = require('../models/style');
const router = express.Router();

// CREATE transaction
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let populated;

    await session.withTransaction(async () => {
      const sketch = new Sketch(req.body);
      await sketch.save({ session });

      populated = await Sketch.findById(sketch._id)
        .populate('category_id', 'name')
        .populate('color_id', 'name hex')
        .populate('style_id', 'name')
        .session(session);
    });

    session.endSession();
    res.json(populated);

  } catch (err) {
    session.endSession();

    // Fallback for standalone MongoDB (no transactions)
    if (err.code === 20) {
      try {
        const sketch = new Sketch(req.body);
        await sketch.save();

        const populated = await Sketch.findById(sketch._id)
          .populate('category_id', 'name')
          .populate('color_id', 'name hex')
          .populate('style_id', 'name');

        return res.json(populated);
      } catch (fallbackErr) {
        return res.status(400).json({ error: fallbackErr.message });
      }
    }

    res.status(400).json({ error: err.message });
  }
});


// READ (with filters)
router.get('/', async (req, res) => {
  try {
    const filter = {};

    // If frontend sends ObjectId directly
    if (mongoose.isValidObjectId(req.query.category_id)) {
      filter.category_id = req.query.category_id;
    } else if (req.query.category_id) {
      // Support legacy name-based filter
      const catDoc = await Category.findOne({ name: req.query.category_id });
      if (catDoc) filter.category_id = catDoc._id;
    }

    if (mongoose.isValidObjectId(req.query.color_id)) {
      filter.color_id = req.query.color_id;
    } else if (req.query.color_id) {
      const colDoc = await Color.findOne({ name: req.query.color_id });
      if (colDoc) filter.color_id = colDoc._id;
    }

    if (mongoose.isValidObjectId(req.query.style_id)) {
      filter.style_id = req.query.style_id;
    } else if (req.query.style_id) {
      const styDoc = await Style.findOne({ name: req.query.style_id });
      if (styDoc) filter.style_id = styDoc._id;
    }

    const sketches = await Sketch.find(filter)
      .populate('category_id', 'name')
      .populate('color_id', 'name hex')
      .populate('style_id', 'name')
      .sort({ createdAt: -1 });

    res.json(sketches);
  } catch (err) {
    console.error('Error in GET /api/sketches:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Sketch.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category_id', 'name')
      .populate('color_id', 'name hex')
      .populate('style_id', 'name');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await Sketch.findByIdAndDelete(req.params.id).session(session);
    });

    session.endSession();
    res.json({ message: 'Deleted' });

  } catch (err) {
    session.endSession();

    // Fallback for standalone MongoDB
    if (err.code === 20) {
      await Sketch.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Deleted' });
    }

    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
