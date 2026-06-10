const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: String,
        color: String,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Card',
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    currentStatus: {
      type: String,
      required: true,
      enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
      default: 'Processing',
    },
    statusTimeline: [
      {
        status: {
          type: String,
          enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        description: String,
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save helper to auto-populate timeline when new order is created
OrderSchema.pre('save', function (next) {
  if (this.isNew && this.statusTimeline.length === 0) {
    this.statusTimeline = [
      { status: 'Processing', timestamp: new Date(), description: 'Order has been placed and is being processed.', isCompleted: true },
      { status: 'Shipped', description: 'Seller has packaged and shipped the items.', isCompleted: false },
      { status: 'Out for Delivery', description: 'Order has reached your local hub and is out for delivery.', isCompleted: false },
      { status: 'Delivered', description: 'Order delivered successfully.', isCompleted: false },
    ];
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
