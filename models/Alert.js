const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({

  // 🔗 WHERE (RELATIONS - MUST)
  villageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Village",
    required: true
  },

  panchayatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Panchayat",
    required: true
  },

  waterSourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WaterSource"
  },

  // 🧠 WHY ALERT WAS GENERATED
  type: {
    type: String,
    enum: ['OUTBREAK_RISK', 'WATER_CONTAMINATION', 'GENERAL_ADVISORY'],
    required: true
  },

  // 📢 DISPLAY
  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  // ⚠️ SEVERITY
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },

  // 🤖 AI OUTPUT (IMPORTANT)
  predictedDisease: {
    type: String
  },

  confidence: {
    type: Number // 0–100
  },

  // 🔗 LINK BACK TO DATA (VERY IMPORTANT)
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SymptomReport"
  }],

  relatedWaterQuality: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "WaterQuality"
  }],

  // 📍 OPTIONAL (for UI map quick use)
  locationUrl: {
    type: String
  },

  // 🔄 STATUS
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED'],
    default: 'ACTIVE'
  },

  resolvedAt: {
    type: Date
  },

}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);