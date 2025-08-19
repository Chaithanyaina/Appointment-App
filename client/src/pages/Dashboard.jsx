import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import moment from 'moment';

function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState('');

  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const from = moment().format('YYYY-MM-DD');
      const to = moment().add(7, 'days').format('YYYY-MM-DD');
      const response = await api.get(`/slots?from=${from}&to=${to}`);
      setSlots(response.data);
    } catch (err) {
      setError('Failed to fetch available slots.');
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const response = await api.get('/my-bookings');
      setMyBookings(response.data);
    } catch (err) {
      setError('Failed to fetch your bookings.');
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    fetchMyBookings();
  }, [fetchSlots, fetchMyBookings]);

  const handleBook = async (slotId) => {
    setError('');
    try {
      await api.post('/book', { slotId });
      // Refresh both lists after booking
      fetchSlots();
      fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to book slot.');
    }
  };
  
  const formatDate = (date) => moment(date).format('MMMM Do YYYY, h:mm a');

  return (
    <div className="container">
      <h2>Patient Dashboard</h2>
      {error && <p className="error">{error}</p>}
      <div className="dashboard-grid">
        <div className="slots-list">
          <h3>Available Slots (Next 7 Days)</h3>
          {loadingSlots ? (
            <p className="loading">Loading slots...</p>
          ) : (
            <ul>
              {slots.map(slot => (
                <li key={slot.slotId}>
                  <span>{formatDate(slot.start)}</span>
                  <button onClick={() => handleBook(slot.slotId)}>Book</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bookings-list">
          <h3>My Bookings</h3>
          {loadingBookings ? (
            <p className="loading">Loading your bookings...</p>
          ) : (
            <ul>
              {myBookings.map(booking => (
                <li key={booking._id}>
                  <span>{formatDate(booking.slotStartTime)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;