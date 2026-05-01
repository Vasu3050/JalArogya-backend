const express = require("express");
const router = express.Router();
const workerController = require("../controllers/worker.js");
const workerAuth = require("../middleware/auth.js");

// Water Source Routes for Worker
router.get("/water-sources", workerAuth, workerController.getAssignedWaterSources);
router.post("/water-sources", workerAuth, workerController.createWaterSource);
router.put("/water-sources/:id", workerAuth, workerController.updateWaterSource);

// Symptom Reporting Routes for Worker
router.post("/report-symptoms", workerAuth, workerController.reportSymptoms);
router.get("/my-reports", workerAuth, workerController.getMyReports);

module.exports = router;
