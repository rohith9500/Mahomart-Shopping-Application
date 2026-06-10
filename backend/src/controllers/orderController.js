const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true, // Auto pay for demo efficiency
      paidAt: Date.now(),
    });

    // Deduct product variant stock upon successful purchase
    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      if (dbProduct) {
        // Find variant matching color/size
        const variant = dbProduct.variants.find(
          (v) => v.color === item.color && v.size === item.size
        );
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
          await dbProduct.save();
        }
      }
    }

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Security check: Only allow admin or the user who placed the order to see it
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order delivery status (For Demo tracking purposes)
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  const { status } = req.body; // Processing, Shipped, Out for Delivery, Delivered
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.currentStatus = status;
      
      // Update specific status timeline node
      const timelineNode = order.statusTimeline.find(t => t.status === status);
      if (timelineNode) {
        timelineNode.isCompleted = true;
        timelineNode.timestamp = Date.now();
      }

      // Also complete all preceding nodes for realism
      const stages = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
      const targetIndex = stages.indexOf(status);
      for (let i = 0; i <= targetIndex; i++) {
        const node = order.statusTimeline.find(t => t.status === stages[i]);
        if (node && !node.isCompleted) {
          node.isCompleted = true;
          node.timestamp = Date.now();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
};
