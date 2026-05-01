const mongoose = require("mongoose");

const waterSourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    type: {
        type: String,
        enum: ["tap", "well", "borewell", "river", "lake", "tank", "other"],
        required: true
    },

    locationUrl: {
        type: String
    },

    village: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Village"
    },

    panchayat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Panchayat"
    }

}, { timestamps: true });

module.exports = mongoose.model("WaterSource", waterSourceSchema);