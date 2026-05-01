const express = require('express');
const router = express.Router();
const WaterQuality = require('../models/WaterQuality');

// Get all water records
router.get('/', async (req, res) => {
  try {
    const records = await WaterQuality.find().sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a new water record
router.post('/', async (req, res) => {
  const record = new WaterQuality(req.body);
  try {
    const newRecord = await record.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
