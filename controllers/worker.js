const Worker = require("../models/Worker.js");
const WaterSource = require("../models/WaterSource.js");
const SymptomReport = require("../models/SymptomReport.js");
const Village = require("../models/Village.js");

exports.getAssignedWaterSources = async (req, res) => {
    try {
        const workerId = req.worker.id;
        const worker = await Worker.findById(workerId);
        
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        // Get water sources in the worker's assigned villages
        const waterSources = await WaterSource.find({
            village: { $in: worker.villages }
        }).populate('village').populate('panchayat');

        res.status(200).json(waterSources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createWaterSource = async (req, res) => {
    try {
        const workerId = req.worker.id;
        const { name, type, locationUrl, villageId } = req.body;

        if (!name || !type || !villageId) {
            return res.status(400).json({ message: "Name, type and Village ID are required" });
        }

        const worker = await Worker.findById(workerId);
        if (!worker.villages.includes(villageId)) {
            return res.status(403).json({ message: "You can only add sources to your assigned villages" });
        }

        // Find the panchayat this village belongs to (ideally Worker has it, but let's be safe)
        const panchayatId = worker.panchayats[0]; // Assuming worker belongs to at least one panchayat

        const waterSource = new WaterSource({
            name,
            type,
            locationUrl,
            village: villageId,
            panchayat: panchayatId
        });

        await waterSource.save();
        res.status(201).json({ message: "Water source created", waterSource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateWaterSource = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.worker.id;

        const worker = await Worker.findById(workerId);
        const waterSource = await WaterSource.findById(id);

        if (!waterSource) return res.status(404).json({ message: "Water source not found" });

        if (!worker.villages.includes(waterSource.village.toString())) {
            return res.status(403).json({ message: "You can only update sources in your assigned villages" });
        }

        const updatedSource = await WaterSource.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Water source updated", waterSource: updatedSource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.reportSymptoms = async (req, res) => {
    try {
        const workerId = req.worker.id;
        const { 
            villageId, 
            panchayatId, 
            locationUrl, 
            symptoms, 
            patientCount, 
            severity, 
            waterSourceId,
            waterSourceOther 
        } = req.body;

        if (!villageId || !panchayatId || !symptoms || symptoms.length === 0) {
            return res.status(400).json({ message: "Village, Panchayat and Symptoms are required" });
        }

        const report = new SymptomReport({
            reporterId: workerId,
            villageId,
            panchayatId,
            locationUrl,
            symptoms,
            patientCount: patientCount || 1,
            severity: severity || 'LOW',
            waterSourceId,
            waterSourceOther
        });

        await report.save();
        res.status(201).json({ message: "Symptom report submitted successfully", report });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyReports = async (req, res) => {
    try {
        const workerId = req.worker.id;
        const reports = await SymptomReport.find({ reporterId: workerId })
            .populate('villageId', 'name')
            .populate('waterSourceId', 'name type')
            .sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
