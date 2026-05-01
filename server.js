const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jal_arogya';

// Import Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const workerRoutes = require("./routes/worker");
const predictionRoutes = require("./routes/predictions");
const alertRoutes = require("./routes/alerts");
const panchayatRoutes = require("./routes/panchayat");
const reportRoutes = require("./routes/reports");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/panchayat", panchayatRoutes);
app.use("/api/reports", reportRoutes);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
