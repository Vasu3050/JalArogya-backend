const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const panchayatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true // login ID
    },
    password: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    taluk: {
        type: String,
        required: true
    },
    state: {
        type: String,
        default: "Karnataka"
    },
    locationUrl: String,

    // 👇 villages under this panchayat
    villages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Village"
    }]

}, { timestamps: true });

// hash password before save
panchayatSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// compare password
panchayatSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Panchayat", panchayatSchema);