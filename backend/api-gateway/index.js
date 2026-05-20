import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Auth middleware for protected routes
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes proxy configuration
const serviceUrls = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'
};

// Auth routes (public)
app.use('/api/auth', createProxyMiddleware({
  target: serviceUrls.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
}));

// Product routes (public)
app.use('/api/products', createProxyMiddleware({
  target: serviceUrls.product,
  changeOrigin: true,
  pathRewrite: { '^/api/products': '' },
}));

// Order routes (protected)
app.use('/api/orders', verifyToken, createProxyMiddleware({
  target: serviceUrls.order,
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '' },
}));

// Payment routes (protected)
app.use('/api/payments', verifyToken, createProxyMiddleware({
  target: serviceUrls.payment,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '' },
}));

// Notification routes (protected)
app.use('/api/notifications', verifyToken, createProxyMiddleware({
  target: serviceUrls.notification,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '' },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
