const WaterSource = require("../models/WaterSource");
const WaterQuality = require("../models/WaterQuality");
const { predictWaterQuality, rotateKey } = require("../services/groqService");
const Alert = require("../models/Alert");
const { extractCoordinates } = require("../utils/geo");

exports.predictWaterQualityController = async (req, res) => {
    try {
        // Rotate the API key once for this entire frontend request
        rotateKey();

        // 1. Get water sources for the logged-in panchayat
        const panchayatId = req.user.id;
        const sources = await WaterSource.find({ panchayat: panchayatId })
            .populate('village')
            .populate('panchayat');

        if (!sources || sources.length === 0) {
            return res.status(404).json({ message: "No water sources found" });
        }

        const results = [];

        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            let randomParams;

            if (i === 0) {
                // Highly Contaminated
                randomParams = {
                    pH: parseFloat((Math.random() * (5.5 - 4) + 4).toFixed(2)),
                    turbidity: parseFloat((Math.random() * (50 - 15) + 15).toFixed(2)),
                    temperature: parseFloat((Math.random() * (35 - 25) + 25).toFixed(2)),
                    dissolvedOxygen: parseFloat((Math.random() * (4 - 1) + 1).toFixed(2)),
                    conductivity: parseFloat((Math.random() * (2000 - 1500) + 1500).toFixed(2)),
                    fluorideLevel: parseFloat((Math.random() * (5 - 3) + 3).toFixed(2)),
                    nitrateLevel: parseFloat((Math.random() * (100 - 50) + 50).toFixed(2)),
                    bacterialCount: Math.floor(Math.random() * (5000 - 1000) + 1000)
                };
            } else if (i === 1) {
                // Medium Risk
                randomParams = {
                    pH: parseFloat((Math.random() * (6.5 - 6) + 6).toFixed(2)),
                    turbidity: parseFloat((Math.random() * (10 - 5) + 5).toFixed(2)),
                    temperature: parseFloat((Math.random() * (30 - 20) + 20).toFixed(2)),
                    dissolvedOxygen: parseFloat((Math.random() * (6 - 4) + 4).toFixed(2)),
                    conductivity: parseFloat((Math.random() * (1000 - 500) + 500).toFixed(2)),
                    fluorideLevel: parseFloat((Math.random() * (2 - 1) + 1).toFixed(2)),
                    nitrateLevel: parseFloat((Math.random() * (45 - 30) + 30).toFixed(2)),
                    bacterialCount: Math.floor(Math.random() * (500 - 100) + 100)
                };
            } else if (i === 2) {
                // Normal/Safe
                randomParams = {
                    pH: parseFloat((Math.random() * (8 - 7) + 7).toFixed(2)),
                    turbidity: parseFloat((Math.random() * (1 - 0) + 0).toFixed(2)),
                    temperature: parseFloat((Math.random() * (25 - 20) + 20).toFixed(2)),
                    dissolvedOxygen: parseFloat((Math.random() * (9 - 7) + 7).toFixed(2)),
                    conductivity: parseFloat((Math.random() * (300 - 100) + 100).toFixed(2)),
                    fluorideLevel: parseFloat((Math.random() * (0.5 - 0.1) + 0.1).toFixed(2)),
                    nitrateLevel: parseFloat((Math.random() * (10 - 0) + 0).toFixed(2)),
                    bacterialCount: 0
                };
            } else {
                // Random
                randomParams = {
                    pH: parseFloat((Math.random() * (9 - 5) + 5).toFixed(2)),
                    turbidity: parseFloat((Math.random() * (20 - 0) + 0).toFixed(2)),
                    temperature: parseFloat((Math.random() * (35 - 15) + 15).toFixed(2)),
                    dissolvedOxygen: parseFloat((Math.random() * (10 - 2) + 2).toFixed(2)),
                    conductivity: parseFloat((Math.random() * (1500 - 50) + 50).toFixed(2)),
                    fluorideLevel: parseFloat((Math.random() * (3 - 0) + 0).toFixed(2)),
                    nitrateLevel: parseFloat((Math.random() * (60 - 0) + 0).toFixed(2)),
                    bacterialCount: Math.floor(Math.random() * 1000)
                };
            }

            // 3. Pass this to LLM to get the prediction
            // System prompt in groqService will act as water quality prediction expert
            const prediction = await predictWaterQuality({
                ...randomParams,
                sourceName: source.name,
                sourceType: source.type,
                location: {
                    village: source.village?.name,
                    panchayat: source.village?.panchayat?.name,
                    district: source.village?.panchayat?.district,
                    taluk: source.village?.panchayat?.taluk,
                    state: source.village?.panchayat?.state
                }
            });

            // 4. Extract coordinates for map display
            const coords = extractCoordinates(source.locationUrl);

            // 5. Create Alert if contamination is high (automated monitoring)
            if (prediction.contaminationLevel === "HIGHLY_CONTAMINATED" || prediction.contaminationLevel === "CONTAMINATED") {
                const existingAlert = await Alert.findOne({ 
                    waterSourceId: source._id, 
                    status: "ACTIVE" 
                });

                if (!existingAlert) {
                    await Alert.create({
                        villageId: source.village?._id,
                        panchayatId: source.panchayat?._id,
                        waterSourceId: source._id,
                        type: "WATER_CONTAMINATION",
                        title: `${prediction.contaminationLevel.replace('_', ' ')}: ${source.name}`,
                        message: prediction.reasoning,
                        severity: prediction.contaminationLevel === "HIGHLY_CONTAMINATED" ? "CRITICAL" : "HIGH",
                        predictedDisease: prediction.probableDisease,
                        locationUrl: source.locationUrl
                    });
                }
            }

            // 6. Return all the source with their prediction in JSON format
            results.push({
                source_id: source._id,
                source_name: source.name,
                village: source.village?.name || "N/A",
                panchayat: source.panchayat?.name || "N/A",
                district: source.panchayat?.district || "N/A",
                taluk: source.panchayat?.taluk || "N/A",
                state: source.panchayat?.state || "Karnataka",
                contaminationLevel: prediction.contaminationLevel || "MODERATE",
                probableDisease: prediction.probableDisease || "Gastrointestinal infections",
                precautions: prediction.precautions || ["Boil water before consumption"],
                solutions: prediction.solutions || ["Regular chlorination"],
                reasoning: prediction.reasoning || "Automatic analysis based on provided parameters.",
                parameters: randomParams,
                coordinates: coords || { lat: 15.8497 + (Math.random() - 0.5) * 0.1, lng: 75.319 + (Math.random() - 0.5) * 0.1 } // Fallback to Bagalkot region
            });
        }

        res.status(200).json(results);

    } catch (error) {
        console.error("Predict Water Quality Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
