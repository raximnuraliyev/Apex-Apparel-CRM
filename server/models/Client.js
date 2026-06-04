const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    phone: {
      type: String,
      default: '',
    },
    tier: {
      type: String,
      enum: ['Platinum', 'Gold', 'Silver', 'Bronze'],
      default: 'Bronze',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending Approval'],
      default: 'Active',
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
