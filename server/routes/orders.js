const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Client = require('../models/Client');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('clientId');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { clientId, clientName, companyName, items, status, totalAmount, shippingCarrier, trackingNumber, note } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required.' });
    }

    // Auto-generate order number
    const orderNumber = 'APX-' + Math.floor(1000 + Math.random() * 9000);

    // Calculate totalAmount from items if not provided
    let calculatedTotal = totalAmount;
    if (!calculatedTotal && items && items.length > 0) {
      calculatedTotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    }

    if (!calculatedTotal) {
      return res.status(400).json({ message: 'Total amount is required or provide items to calculate.' });
    }

    const order = await Order.create({
      orderNumber,
      clientId,
      clientName,
      companyName,
      items,
      status,
      totalAmount: calculatedTotal,
      shippingCarrier,
      trackingNumber,
      note,
    });

    // Update linked client's totalOrders and totalSpend
    await Client.findByIdAndUpdate(clientId, {
      $inc: { totalOrders: 1, totalSpend: calculatedTotal },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ message: 'Server error creating order.' });
  }
});

// PUT /api/orders/:id - Update an order
router.put('/:id', async (req, res) => {
  try {
    const { status, shippingCarrier, trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, shippingCarrier, trackingNumber },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order error:', error.message);
    res.status(500).json({ message: 'Server error updating order.' });
  }
});

module.exports = router;
