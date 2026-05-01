const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const panchayatAuth = require('../middleware/panchayatAuth');

// Get all active alerts
router.get('/', panchayatAuth, async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const alerts = await Alert.find({ status: 'ACTIVE', panchayatId })
            .populate('villageId')
            .populate('panchayatId')
            .populate('waterSourceId')
            .sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Resolve an alert
router.patch('/:id/resolve', panchayatAuth, async (req, res) => {
    try {
        const panchayatId = req.user.id;
        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, panchayatId },
            {
                status: 'RESOLVED',
                resolvedAt: new Date()
            },
            { new: true }
        );
        if (!alert) return res.status(404).json({ message: "Alert not found or not authorized" });
        res.json(alert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
