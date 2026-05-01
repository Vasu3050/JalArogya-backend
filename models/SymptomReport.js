const mongoose = require('mongoose');

const SymptomReportSchema = new mongoose.Schema({

  // 👩‍⚕️ who reported
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true
  },

  // 🏡 where
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

  // 🌍 exact report location (GMaps URL)
  locationUrl: {
    type: String
  },

  // 🤒 symptoms (controlled list)
  symptoms: [{
    type: String,
    enum: [
      "diarrhea",
      "vomiting",
      "fever",
      "abdominal_pain",
      "dehydration",
      "nausea",
      "blood_in_stool",
      "fatigue",
      "jaundice_symptoms",
      "muscle_pain"
    ]
  }],

  patientCount: {
    type: Number,
    default: 1
  },

  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },

  waterSourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WaterSource"
  },

  waterSourceOther: {
    type: String
  },

  
  isResolved: {
    type: Boolean,
    default: false
  },
  
  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model('SymptomReport', SymptomReportSchema);