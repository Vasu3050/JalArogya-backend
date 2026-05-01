const Panchayat = require("../models/Panchayat.js");
const Village = require("../models/Village.js");
const Worker = require("../models/Worker.js");
const WaterSource = require("../models/WaterSource.js");
const SymptomReport = require("../models/SymptomReport.js");
const jwt = require("jsonwebtoken");

exports.loginPanchayat = async (req, res) => {
    try {
        const { panchayatName, password } = req.body;

        if (!panchayatName || !password) {
            return res.status(400).json({ message: "Panchayat name and password are required" });
        }

        // Search by name or code (as code is usually the login ID, but user asked for panchayatName)
        const panchayat = await Panchayat.findOne({ name: panchayatName });
        if (!panchayat) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await panchayat.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: panchayat._id, role: "panchayat" },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful",
            token,
            panchayat: {
                id: panchayat._id,
                name: panchayat.name,
                code: panchayat.code
            }
        });

    } catch (error) {
        console.error("Panchayat login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAshaWorkers = async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const workers = await Worker.find({ panchayats: panchayatId }).populate('villages');
        res.status(200).json(workers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// CRUD for Villages under Panchayat
exports.createVillage = async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const { name, population, numberOfHouses, locationUrl } = req.body;

        if (!name) return res.status(400).json({ message: "Village name is required" });

        const village = new Village({ name, population, numberOfHouses, locationUrl });
        await village.save();

        await Panchayat.findByIdAndUpdate(panchayatId, { $push: { villages: village._id } });

        res.status(201).json({ message: "Village created", village });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getVillages = async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const panchayat = await Panchayat.findById(panchayatId).populate('villages');
        res.status(200).json(panchayat.villages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateVillage = async (req, res) => {
    try {
        const { id } = req.params;
        const village = await Village.findByIdAndUpdate(id, req.body, { new: true });
        if (!village) return res.status(404).json({ message: "Village not found" });
        res.status(200).json({ message: "Village updated", village });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteVillage = async (req, res) => {
    try {
        const { id } = req.params;
        const panchayatId = req.user.id;

        const village = await Village.findByIdAndDelete(id);
        if (!village) return res.status(404).json({ message: "Village not found" });

        await Panchayat.findByIdAndUpdate(panchayatId, { $pull: { villages: id } });

        res.status(200).json({ message: "Village deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// CRUD for Workers under Panchayat
exports.createWorker = async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const { name, phone, password, villageIds } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existing = await Worker.findOne({ phone });
        if (existing) return res.status(400).json({ message: "Worker already exists" });

        const worker = new Worker({
            name, phone, password,
            villages: villageIds || [],
            panchayats: [panchayatId]
        });

        await worker.save();
        res.status(201).json({ message: "Worker created", worker });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await Worker.findByIdAndUpdate(id, req.body, { new: true });
        if (!worker) return res.status(404).json({ message: "Worker not found" });
        res.status(200).json({ message: "Worker updated", worker });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await Worker.findByIdAndDelete(id);
        if (!worker) return res.status(404).json({ message: "Worker not found" });
        res.status(200).json({ message: "Worker deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Water Source CRUD for Panchayat
exports.createWaterSource = async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const { name, type, locationUrl, villageId } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: "Name and type are required" });
        }

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

exports.getWaterSources = async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const waterSources = await WaterSource.find({ panchayat: panchayatId }).populate('village');
        res.status(200).json(waterSources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateWaterSource = async (req, res) => {
    try {
        const { id } = req.params;
        const panchayatId = req.user.id;

        const waterSource = await WaterSource.findOneAndUpdate(
            { _id: id, panchayat: panchayatId },
            req.body,
            { new: true }
        );

        if (!waterSource) return res.status(404).json({ message: "Water source not found in your panchayat" });
        res.status(200).json({ message: "Water source updated", waterSource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteWaterSource = async (req, res) => {
    try {
        const { id } = req.params;
        const panchayatId = req.user.id;

        const waterSource = await WaterSource.findOneAndDelete({ _id: id, panchayat: panchayatId });
        if (!waterSource) return res.status(404).json({ message: "Water source not found in your panchayat" });

        res.status(200).json({ message: "Water source deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Symptom Reports view for Panchayat
exports.getPanchayatSymptomReports = async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const reports = await SymptomReport.find({ panchayatId })
            .populate('reporterId', 'name phone')
            .populate('villageId', 'name')
            .populate('waterSourceId', 'name type')
            .sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
