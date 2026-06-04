const express = require('express');
const auth = require('../middleware/auth');
const Client = require('../models/Client');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/clients - Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error.message);
    res.status(500).json({ message: 'Server error fetching clients.' });
  }
});

// POST /api/clients - Create a new client
router.post('/', async (req, res) => {
  try {
    const { company, name, email, phone, tier, status } = req.body;

    if (!company || !name || !email) {
      return res.status(400).json({ message: 'Company, name, and email are required.' });
    }

    const client = await Client.create({ company, name, email, phone, tier, status });
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error.message);
    res.status(500).json({ message: 'Server error creating client.' });
  }
});

module.exports = router;
