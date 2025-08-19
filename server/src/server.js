import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import connectDB from './db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Initialize App
const app = express();
connectDB();

// Seed Admin User (No changes)
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('Admin user seeded.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};
seedAdmin();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());

// Security: Apply rate limiting to all API requests
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window`
	standardHeaders: 'draft-7',
	legacyHeaders: false, 
});
app.use('/api', limiter);


// Routes
app.get('/health', (req, res) => res.send('API is healthy and running!')); // Health check
app.use('/api', authRoutes);
app.use('/api', bookingRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));