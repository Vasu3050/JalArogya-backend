const express = require("express");
const router = express.Router();
const panchayatController = require("../controllers/panchayat.js");
const panchayatAuth = require("../middleware/panchayatAuth.js");

// Public routes
router.post("/login", panchayatController.loginPanchayat);

// Protected routes (Panchayat only)
router.get("/asha-workers", panchayatAuth, panchayatController.getAshaWorkers);

// Village CRUD for Panchayat
router.post("/villages", panchayatAuth, panchayatController.createVillage);
router.get("/villages", panchayatAuth, panchayatController.getVillages);
router.put("/villages/:id", panchayatAuth, panchayatController.updateVillage);
router.delete("/villages/:id", panchayatAuth, panchayatController.deleteVillage);

// Worker CRUD for Panchayat
router.post("/workers", panchayatAuth, panchayatController.createWorker);
router.put("/workers/:id", panchayatAuth, panchayatController.updateWorker);
router.delete("/workers/:id", panchayatAuth, panchayatController.deleteWorker);

// Water Source CRUD for Panchayat
router.post("/water-sources", panchayatAuth, panchayatController.createWaterSource);
router.get("/water-sources", panchayatAuth, panchayatController.getWaterSources);
router.put("/water-sources/:id", panchayatAuth, panchayatController.updateWaterSource);
router.delete("/water-sources/:id", panchayatAuth, panchayatController.deleteWaterSource);

// Symptom Report Routes for Panchayat
router.get("/symptom-reports", panchayatAuth, panchayatController.getPanchayatSymptomReports);

module.exports = router;
