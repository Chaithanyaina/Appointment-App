import express from 'express';
import moment from 'moment-timezone';
import Booking from '../models/Booking.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/slots', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: '`from` and `to` query parameters are required.' } });
  }

  try {
    const fromDate = moment.tz(from, 'UTC').startOf('day');
    const toDate = moment.tz(to, 'UTC').endOf('day');

    const bookedSlots = await Booking.find({
      slotStartTime: { $gte: fromDate.toDate(), $lte: toDate.toDate() }
    });
    const bookedStartTimes = new Set(bookedSlots.map(b => moment(b.slotStartTime).toISOString()));
    
    const availableSlots = [];
    let currentDay = fromDate.clone();
    
    while (currentDay.isBefore(toDate)) {
        const clinicOpen = currentDay.clone().hour(9).minute(0).second(0);
        const clinicClose = currentDay.clone().hour(17).minute(0).second(0);

        let slot = clinicOpen.clone();
        while(slot.isBefore(clinicClose)) {
            const slotIso = slot.toISOString();
            if (!bookedStartTimes.has(slotIso)) {
                availableSlots.push({
                    slotId: slotIso,
                    start: slot.toISOString(),
                    end: slot.clone().add(30, 'minutes').toISOString()
                });
            }
            slot.add(30, 'minutes');
        }
      currentDay.add(1, 'day');
    }

    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.post('/book', protect, async (req, res) => {
    const { slotId } = req.body;
    if (!slotId) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: '`slotId` is required.' } });
    }

    try {
        const slotStartTime = moment.tz(slotId, 'UTC');
        const slotEndTime = slotStartTime.clone().add(30, 'minutes');

        const newBooking = new Booking({
            userId: req.user._id,
            userName: req.user.name,
            slotStartTime: slotStartTime.toDate(),
            slotEndTime: slotEndTime.toDate(),
        });

        await newBooking.save();
        res.status(201).json(newBooking);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: { code: 'SLOT_TAKEN', message: 'This slot has already been booked.' } });
        }
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to book slot.' } });
    }
});

router.get('/my-bookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).sort({ slotStartTime: 'asc' });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to retrieve bookings.' } });
    }
});

router.get('/all-bookings', protect, isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ slotStartTime: 'asc' });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to retrieve all bookings.' } });
    }
});

export default router;