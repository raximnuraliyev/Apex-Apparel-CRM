const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String },
    qty: { type: Number },
    price: { type: Number },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
    },
    clientName: {
      type: String,
    },
    companyName: {
      type: String,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    shippingCarrier: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
