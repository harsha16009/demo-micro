import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import validator from 'validator';

dotenv.config();

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_AUTH_URI || 'mongodb://mongo:27017/auth-db';

const seedDemoUser = async () => {
  try {
    const demoEmail = 'demo@fruithub.com';
    const existingUser = await mongoose.model('User').findOne({ email: demoEmail });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const demoUser = new (mongoose.model('User'))({
        name: 'Demo Customer',
        email: demoEmail,
        phone: '9876543210',
        password: hashedPassword,
        address: '123 Fresh Way, Orchard Valley'
      });
      await demoUser.save();
      console.log('✅ Demo user seeded: demo@fruithub.com / password123');
    } else {
      console.log('ℹ️ Demo user already exists.');
    }
  } catch (err) {
    console.log('⚠️ Error seeding demo user:', err.message);
  }
};

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Auth Service DB connected');
    seedDemoUser();
  })
  .catch(err => console.log('❌ DB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  address: String,
  role: { type: String, default: 'user', enum: ['user', 'admin', 'delivery'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
// Register
app.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      address
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile
app.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service is running' });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
});
