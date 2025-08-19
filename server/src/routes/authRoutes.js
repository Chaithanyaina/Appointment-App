import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg } 
    });
  }
  next();
};

const registerValidation = [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

const loginValidation = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
];


// POST /api/register
router.post('/register', registerValidation, validate, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User already exists.' } });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /api/login
router.post('/login', loginValidation, validate, async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.status(200).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } else {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;