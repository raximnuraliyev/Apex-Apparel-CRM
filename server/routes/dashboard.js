const express = require('express');
const auth = require('../middleware/auth');
const Client = require('../models/Client');
const Order = require('../models/Order');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/dashboard - Get dashboard aggregates
router.get('/', async (req, res) => {
  try {
    // Run all queries in parallel for performance
    const [
      totalClients,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      pipelineAgg,
      recentOrders,
      topClients,
      tierDistribution,
    ] = await Promise.all([
      // Total clients
      Client.countDocuments(),

      // Order counts by status
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Processing' }),
      Order.countDocuments({ status: 'Shipped' }),
      Order.countDocuments({ status: 'Delivered' }),

      // Total pipeline value (non-cancelled orders)
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // Recent 5 orders
      Order.find().sort({ createdAt: -1 }).limit(5).populate('clientId'),

      // Top 5 clients by totalSpend
      Client.find().sort({ totalSpend: -1 }).limit(5),

      // Tier distribution (totalSpend grouped by tier)
      Client.aggregate([
        { $group: { _id: '$tier', totalSpend: { $sum: '$totalSpend' } } },
        { $sort: { totalSpend: -1 } },
      ]),
    ]);

    const activeOrders = pendingOrders + processingOrders;
    const totalPipelineValue = pipelineAgg.length > 0 ? pipelineAgg[0].total : 0;

    res.json({
      totalClients,
      activeOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalPipelineValue,
      recentOrders,
      topClients,
      tierDistribution,
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ message: 'Server error fetching dashboard data.' });
  }
});

module.exports = router;
