const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const adminAuth = require("../middleware/adminAuth.js");

// Public routes
router.post("/login", adminController.loginAdmin);
router.post("/logout", adminController.logoutAdmin);

// Protected routes (Admin only) - Setup & Management
router.post("/panchayat", adminAuth, adminController.createPanchayat);
router.post("/village", adminAuth, adminController.createVillage);
router.post("/worker", adminAuth, adminController.createWorker);

router.get("/panchayat", adminAuth, adminController.getPanchayats);
router.get("/village", adminAuth, adminController.getVillages);
router.get("/worker", adminAuth, adminController.getWorkers);

// Admin CRUD - Update/Delete
router.put("/panchayat/:id", adminAuth, adminController.updatePanchayat);
router.delete("/panchayat/:id", adminAuth, adminController.deletePanchayat);

router.put("/village/:id", adminAuth, adminController.updateVillage);
router.delete("/village/:id", adminAuth, adminController.deleteVillage);

router.put("/worker/:id", adminAuth, adminController.updateWorker);
router.delete("/worker/:id", adminAuth, adminController.deleteWorker);

// Water Source Routes
router.post("/water-sources", adminAuth, adminController.createWaterSource);
router.get("/water-sources", adminAuth, adminController.getWaterSources);
router.put("/water-sources/:id", adminAuth, adminController.updateWaterSource);
router.delete("/water-sources/:id", adminAuth, adminController.deleteWaterSource);

// Symptom Report Routes
router.get("/symptom-reports", adminAuth, adminController.getAllSymptomReports);

module.exports = router;
