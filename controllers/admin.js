const Admin = require("../models/Admin.js");
const Panchayat = require("../models/Panchayat.js");
const Village = require("../models/Village.js");
const Worker = require("../models/Worker.js");
const WaterSource = require("../models/WaterSource.js");
const SymptomReport = require("../models/SymptomReport.js");
const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
    try {


        //res.send("Admin login");
        const { username, password } = req.body;

        // 1. validate input
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        // 2. find admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // 3. password check
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // 4. generate JWT
        const token = jwt.sign(
            { id: admin._id, role: "admin" },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        // 5. Set cookie and response
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({
            message: "Login successful",
            token, // keeping token in response for backward compatibility if needed
            admin: {
                id: admin._id,
                username: admin.username
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

exports.logoutAdmin = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
};

// write a function to create panchayats , villages, workers diff analys=z all the models and decide which function is need to be done first so that interdependednt functions work


exports.createPanchayat = async (req, res) => {
    try {
        const { name, code, password, district, taluk, state, locationUrl } = req.body;

        if (!name || !code || !password || !district || !taluk) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existing = await Panchayat.findOne({ code });
        if (existing) {
            return res.status(400).json({ message: "Panchayat already exists" });
        }

        const panchayat = new Panchayat({
            name,
            code,
            password,
            district,
            taluk,
            state,
            locationUrl
        });

        await panchayat.save();

        // link to admin
        if (req.user && req.user.id) {
            await Admin.findByIdAndUpdate(req.user.id, {
                $push: { panchayats: panchayat._id }
            });
        } else {
            console.warn("No admin user found in request during panchayat creation");
        }

        res.status(201).json({ message: "Panchayat created successfully", panchayat });

    } catch (error) {
        console.error("Create Panchayat Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



exports.createVillage = async (req, res) => {
    try {
        const { name, population, numberOfHouses, locationUrl, panchayatId } = req.body;

        if (!name || !panchayatId) {
            return res.status(400).json({ message: "Name and Panchayat required" });
        }

        const village = new Village({
            name,
            population,
            numberOfHouses,
            locationUrl
        });

        await village.save();

        // add village to panchayat
        await Panchayat.findByIdAndUpdate(panchayatId, {
            $push: { villages: village._id }
        });

        res.status(201).json({ message: "Village created", village });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.createWorker = async (req, res) => {
    try {
        const { name, phone, password, villageIds, panchayatId } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existing = await Worker.findOne({ phone });
        if (existing) {
            return res.status(400).json({ message: "Worker already exists" });
        }

        const worker = new Worker({
            name,
            phone,
            password,
            villages: villageIds || [],
            panchayats: panchayatId ? [panchayatId] : []
        });

        await worker.save();

        res.status(201).json({ message: "Worker created", worker });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getPanchayats = async (req, res) => {
    try {
        const panchayats = await Panchayat.find().populate('villages');
        res.status(200).json(panchayats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getVillages = async (req, res) => {
    try {
        const villages = await Village.find();
        res.status(200).json(villages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getWorkers = async (req, res) => {
    try {
        const workers = await Worker.find().populate('villages').populate('panchayats');
        res.status(200).json(workers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Admin CRUD - Update/Delete operations
exports.updatePanchayat = async (req, res) => {
    try {
        const { id } = req.params;
        const panchayat = await Panchayat.findByIdAndUpdate(id, req.body, { new: true });
        if (!panchayat) return res.status(404).json({ message: "Panchayat not found" });
        res.status(200).json({ message: "Panchayat updated", panchayat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deletePanchayat = async (req, res) => {
    try {
        const { id } = req.params;
        const panchayat = await Panchayat.findByIdAndDelete(id);
        if (!panchayat) return res.status(404).json({ message: "Panchayat not found" });
        res.status(200).json({ message: "Panchayat deleted" });
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
        const village = await Village.findByIdAndDelete(id);
        if (!village) return res.status(404).json({ message: "Village not found" });
        // Also remove from any panchayat that has this village
        await Panchayat.updateMany({ villages: id }, { $pull: { villages: id } });
        res.status(200).json({ message: "Village deleted" });
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

// Water Source CRUD
exports.createWaterSource = async (req, res) => {
    try {
        const { name, type, locationUrl, villageId, panchayatId } = req.body;
        if (!name || !type || !panchayatId) {
            return res.status(400).json({ message: "Name, type and Panchayat ID are required" });
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
        const waterSources = await WaterSource.find().populate('village').populate('panchayat');
        res.status(200).json(waterSources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateWaterSource = async (req, res) => {
    try {
        const { id } = req.params;
        const waterSource = await WaterSource.findByIdAndUpdate(id, req.body, { new: true });
        if (!waterSource) return res.status(404).json({ message: "Water source not found" });
        res.status(200).json({ message: "Water source updated", waterSource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteWaterSource = async (req, res) => {
    try {
        const { id } = req.params;
        const waterSource = await WaterSource.findByIdAndDelete(id);
        if (!waterSource) return res.status(404).json({ message: "Water source not found" });
        res.status(200).json({ message: "Water source deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Symptom Reports view
exports.getAllSymptomReports = async (req, res) => {
    try {
        const reports = await SymptomReport.find()
            .populate('reporterId', 'name phone')
            .populate('villageId', 'name')
            .populate('panchayatId', 'name')
            .populate('waterSourceId', 'name type')
            .sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
