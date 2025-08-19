import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import moment from 'moment';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserCircleIcon, CalendarIcon } from '@heroicons/react/24/solid';

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
    >
        {children}
    </motion.div>
);

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/all-bookings');
            setBookings(response.data);
        } catch (err) {
            toast.error('Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllBookings();
    }, [fetchAllBookings]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking =>
            booking.userName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.slotStartTime) - new Date(a.slotStartTime)); // Sort by most recent
    }, [bookings, searchTerm]);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-400 mb-8">View and manage all patient appointments.</p>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="bg-gray-800 shadow-lg rounded-xl">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-xl font-semibold text-emerald-400">All Bookings</h2>
                    </div>
                    {loading ? (
                        <p className="p-6 text-center">Loading bookings...</p>
                    ) : (
                        <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-gray-700">
                            {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                                <motion.li key={booking._id} variants={itemVariants} className="p-6 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center">
                                        <UserCircleIcon className="h-10 w-10 text-gray-500 mr-4" />
                                        <div>
                                            <p className="font-bold text-white">{booking.userName}</p>
                                            <p className="text-sm text-gray-400">{booking.userId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white flex items-center">
                                            <CalendarIcon className="h-5 w-5 text-emerald-400 mr-2" />
                                            {moment(booking.slotStartTime).format('MMMM Do, YYYY')}
                                        </p>
                                        <p className="text-sm text-gray-300">{moment(booking.slotStartTime).format('h:mm A')}</p>
                                    </div>
                                </motion.li>
                            )) : (
                                <p className="p-6 text-center text-gray-400">No bookings found.</p>
                            )}
                        </motion.ul>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default AdminDashboard;