const mongoose = require('mongoose');

const WaterQualitySchema = new mongoose.Schema({

  // 🔗 RELATIONS (VERY IMPORTANT FOR ML CONTEXT)
  waterSourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WaterSource",
    required: true
  },

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

  // 📍 Optional quick access (denormalized for faster queries)
  locationUrl: {
    type: String
  },

  // 📊 CORE ML FEATURES (NUMERICAL)
  pH: {
    type: Number,
    required: true
  },

  turbidity: {
    type: Number, // NTU
    required: true
  },

  temperature: {
    type: Number // °C (important for bacteria growth)
  },

  dissolvedOxygen: {
    type: Number // mg/L
  },

  conductivity: {
    type: Number // µS/cm
  },

  fluorideLevel: {
    type: Number // mg/L
  },

  nitrateLevel: {
    type: Number // mg/L
  },

  bacterialCount: {
    type: Number // CFU/ml (better than boolean)
  },

  // 🧠 DERIVED LABELS (FOR TRAINING / SUPERVISED LEARNING)
  contaminationLevel: {
    type: String,
    enum: ["SAFE", "MODERATE", "CONTAMINATED", "HIGHLY_CONTAMINATED"]
  },

  // optional: link to disease outcome
  linkedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SymptomReport"
  }],


}, { timestamps: true });

module.exports = mongoose.model('WaterQuality', WaterQualitySchema);