// server/routes/lookupRoutes.js
const express = require('express');
const Category = require('../models/category');
const Color = require('../models/color');
const Style = require('../models/style');
const router = express.Router();

// GET all lookups
router.get('/', async (req, res) => {
  try {
    const [categories, colors, styles] = await Promise.all([
      Category.find().sort('name'),
      Color.find().sort('name'),
      Style.find().sort('name'),
    ]);
    res.json({ categories, colors, styles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new lookup items
router.post('/:type', async (req, res) => {
  const { type } = req.params;
  const { name, hex } = req.body;
  try {
    let Model;
    if (type === 'categories') Model = Category;
    else if (type === 'colors') Model = Color;
    else if (type === 'styles') Model = Style;
    else return res.status(400).json({ error: 'Invalid type' });

    const doc = new Model(type === 'colors' ? { name, hex } : { name });
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
