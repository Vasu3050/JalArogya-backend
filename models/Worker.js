const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  villages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Village"
  }],
  panchayats: [{   // optional (derived from villages ideally)
    type: mongoose.Schema.Types.ObjectId,
    ref: "Panchayat"
  }]
}, { timestamps: true });

// hash password
workerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
workerSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Worker", workerSchema);