const express = require('express');
const router = express.Router();
const SymptomReport = require('../models/SymptomReport');
const panchayatAuth = require('../middleware/panchayatAuth');

// Get all reports with full population
router.get('/', panchayatAuth, async (req, res) => {
  try {
    const { workerId, villageId } = req.query;
    const panchayatId = req.user.id;
    let query = { panchayatId };
    if (workerId) query.reporterId = workerId;
    if (villageId) query.villageId = villageId;

    const reports = await SymptomReport.find(query)
      .populate('villageId')
      .populate('panchayatId')
      .populate('reporterId', 'name role')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a new report
router.post('/', async (req, res) => {
  const report = new SymptomReport(req.body);
  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
