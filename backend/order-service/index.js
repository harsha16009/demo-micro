import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.ORDER_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_ORDER_URI || 'mongodb://mongo:27017/order-db';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Order Service DB connected'))
  .catch(err => console.log('❌ DB Connection Error:', err));

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      addOns: [String],
      subtotal: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 50 },
  discount: { type: Number, default: 0 },
  finalAmount: Number,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipcode: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['card', 'upi', 'wallet', 'cash'], default: 'card' },
  deliveryTime: Date,
  estimatedDelivery: { type: Number, default: 30 }, // minutes
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Background Tracking Simulation
const simulateOrderTracking = (orderId) => {
  console.log(`🚀 Starting tracking simulation for Order ${orderId}`);
  
  // Confirmed -> Preparing in 10 seconds
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (order && order.status === 'confirmed') {
        order.status = 'preparing';
        order.updatedAt = new Date();
        await order.save();
        console.log(`📦 Order ${orderId} is now PREPARING`);
        
        try {
          await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/send-delivery-update`, {
            userEmail: 'demo@fruithub.com',
            userName: 'Demo Customer',
            orderId: order._id,
            status: 'preparing'
          });
        } catch (e) {
          console.log('Notification failed:', e.message);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, 10000);

  // Preparing -> Out for Delivery in 20 seconds
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (order && order.status === 'preparing') {
        order.status = 'out-for-delivery';
        order.updatedAt = new Date();
        await order.save();
        console.log(`🚗 Order ${orderId} is now OUT FOR DELIVERY`);
        
        try {
          await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/send-delivery-update`, {
            userEmail: 'demo@fruithub.com',
            userName: 'Demo Customer',
            orderId: order._id,
            status: 'out-for-delivery'
          });
        } catch (e) {
          console.log('Notification failed:', e.message);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, 20000);

  // Out for Delivery -> Delivered in 30 seconds
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (order && order.status === 'out-for-delivery') {
        order.status = 'delivered';
        order.updatedAt = new Date();
        await order.save();
        console.log(`✅ Order ${orderId} is now DELIVERED`);
        
        try {
          await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/send-delivery-update`, {
            userEmail: 'demo@fruithub.com',
            userName: 'Demo Customer',
            orderId: order._id,
            status: 'delivered'
          });
        } catch (e) {
          console.log('Notification failed:', e.message);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, 30000);
};

// Routes
// Create order
app.post('/', async (req, res) => {
  try {
    const { userId, items, deliveryAddress, paymentMethod, notes } = req.body;

    // Calculate totals
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.subtotal || (item.price * item.quantity);
    });

    const deliveryCharge = totalAmount > 500 ? 0 : 50; // Free delivery over 500
    const finalAmount = totalAmount + deliveryCharge;

    const order = new Order({
      userId,
      items,
      totalAmount,
      deliveryCharge,
      finalAmount,
      deliveryAddress,
      paymentMethod,
      notes,
      estimatedDelivery: Math.floor(Math.random() * 30) + 15 // 15-45 minutes
    });

    await order.save();

    if (paymentMethod === 'cash') {
      setTimeout(async () => {
        try {
          const cashOrder = await Order.findById(order._id);
          if (cashOrder) {
            cashOrder.status = 'confirmed';
            await cashOrder.save();
            simulateOrderTracking(cashOrder._id);
          }
        } catch (err) {
          console.error('Error starting cash order simulation:', err);
        }
      }, 2000);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Get user orders
app.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Order Service is running' });
});

// Get single order
app.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// Update order status
app.put('/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = { status, updatedAt: new Date() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (status === 'confirmed') {
      simulateOrderTracking(order._id);
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// Cancel order
app.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Order Service is running' });
});

app.listen(PORT, () => {
  console.log(`📦 Order Service running on port ${PORT}`);
});
