const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    population: Number,
    numberOfHouses: Number,
    locationUrl: String
}, { timestamps: true });

module.exports = mongoose.model("Village", villageSchema);