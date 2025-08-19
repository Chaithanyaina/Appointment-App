import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// --- FIX 1: define a ref *outside* ---
let mockUserRef = { current: null };

// --- FIX 2: mock BEFORE importing routes ---
jest.unstable_mockModule('../middleware/auth.js', () => ({
  protect: (req, res, next) => {
    req.user = mockUserRef.current;
    return next();
  },
  isAdmin: (req, res, next) => next(),
}));

// --- FIX 3: dynamically import routes AFTER mocking ---
let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // create test user
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'patient',
    password: 'dummyPassword123'
  });
  await user.save();
  mockUserRef.current = user;

  // dynamic import AFTER jest.unstable_mockModule
  const bookingRoutes = (await import('../routes/bookingRoutes.js')).default;

  app = express();
  app.use(express.json());
  app.use('/api', bookingRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Booking.deleteMany({});
});

describe('Booking API Endpoints', () => {
  test('should book an available slot successfully', async () => {
    const slotId = new Date().toISOString();

    const response = await request(app)
      .post('/api/book')
      .send({ slotId });

    expect(response.status).toBe(201);
    expect(response.body.userName).toBe('Test User');
  });

  test('should return a 409 conflict error when booking a taken slot', async () => {
    const slotId = new Date().toISOString();

    await request(app).post('/api/book').send({ slotId });
    const response = await request(app).post('/api/book').send({ slotId });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('SLOT_TAKEN');
  });

  test("should return only the authenticated user's bookings", async () => {
    const startTime1 = new Date();
    const endTime1 = new Date(startTime1.getTime() + 30 * 60000);
    const startTime2 = new Date(startTime1.getTime() + 60 * 60000);
    const endTime2 = new Date(startTime2.getTime() + 30 * 60000);

    await Booking.create({
      userId: mockUserRef.current._id,
      userName: mockUserRef.current.name,
      slotStartTime: startTime1,
      slotEndTime: endTime1
    });

    await Booking.create({
      userId: new mongoose.Types.ObjectId(),
      userName: 'Other User',
      slotStartTime: startTime2,
      slotEndTime: endTime2
    });

    const response = await request(app).get('/api/my-bookings');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].userName).toBe('Test User');
  });
});
