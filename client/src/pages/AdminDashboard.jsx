import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import moment from 'moment';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/all-bookings');
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);
  
  const formatDate = (date) => moment(date).format('MMMM Do YYYY, h:mm a');

  return (
    <div className="admin-bookings-list">
      <h2>Admin Dashboard: All Bookings</h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Loading all bookings...</p>
      ) : (
        <ul>
          {bookings.map(booking => (
            <li key={booking._id}>
              <span><strong>Patient:</strong> {booking.userName}</span>
              <span><strong>Time:</strong> {formatDate(booking.slotStartTime)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminDashboard;