const express = require('express');
const router = express.Router();
const { predictOutbreak } = require('../services/groqService');
const SymptomReport = require('../models/SymptomReport');
const WaterQuality = require('../models/WaterQuality');
const Alert = require('../models/Alert');

const { predictWaterQualityController } = require('../controllers/predict');
const panchayatAuth = require('../middleware/panchayatAuth');

router.get('/water-quality', panchayatAuth, predictWaterQualityController);

router.post('/analyze', async (req, res) => {
  try {
    const { village } = req.body;
    
    // Fetch recent data for the village
    const symptoms = await SymptomReport.find({ 'location.village': village }).limit(20);
    const water = await WaterQuality.find({ 'location.village': village }).limit(5);
    
    if (symptoms.length === 0 && water.length === 0) {
      return res.status(400).json({ message: 'Insufficient data for analysis' });
    }

    const prediction = await predictOutbreak(symptoms, water);
    
    // If risk is high, auto-generate an alert
    if (['HIGH', 'CRITICAL'].includes(prediction.riskLevel)) {
      const alert = new Alert({
        type: 'OUTBREAK_RISK',
        title: `High Outbreak Risk in ${village}`,
        message: prediction.reasoning,
        location: { village },
        severity: prediction.riskLevel
      });
      await alert.save();
    }

    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
