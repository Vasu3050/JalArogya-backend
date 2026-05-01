const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log('Login Attempt:', { phone, hasPassword: !!password });

    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide phone and password' });
    }

    // Check if worker exists
    const worker = await Worker.findOne({ phone });
    if (!worker) {
      return res.status(400).json({ message: 'Phone number not registered' });
    }

    // Check password using model method
    const isMatch = await worker.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Create JWT
    const payload = { worker: { id: worker.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token,
      worker: {
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        villages: worker.villages,
        panchayats: worker.panchayats
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get Current Worker
const workerAuth = require('../middleware/auth');
router.get('/me', workerAuth, async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker.id).select('-password').populate('villages').populate('panchayats');
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
