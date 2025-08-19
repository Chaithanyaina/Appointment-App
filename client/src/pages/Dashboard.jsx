import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import moment from 'moment';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

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

const Card = ({ children, className }) => (
    <div className={`bg-gray-900 shadow-2xl rounded-2xl p-6 border border-gray-800 ${className}`}>
        {children}
    </div>
);

const Dashboard = () => {
    const [slots, setSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [loading, setLoading] = useState({ slots: false, bookings: false });
    const [modal, setModal] = useState({ isOpen: false, data: null });

    const sevenDays = Array.from({ length: 7 }, (_, i) => moment().add(i, 'days'));

    const fetchSlots = useCallback(async (date) => {
        setLoading(prev => ({ ...prev, slots: true }));
        try {
            const response = await api.get(`/slots?from=${date}&to=${date}`);
            setSlots(response.data);
        } catch (err) {
            toast.error('Failed to fetch available slots.');
        } finally {
            setLoading(prev => ({ ...prev, slots: false }));
        }
    }, []);

    const fetchMyBookings = useCallback(async () => {
        setLoading(prev => ({ ...prev, bookings: true }));
        try {
            const response = await api.get('/my-bookings');
            setMyBookings(response.data);
        } catch (err) {
            toast.error('Failed to fetch your bookings.');
        } finally {
            setLoading(prev => ({ ...prev, bookings: false }));
        }
    }, []);
    
    useEffect(() => {
        fetchSlots(selectedDate);
    }, [selectedDate, fetchSlots]);
    
    useEffect(() => {
        fetchMyBookings();
    }, [fetchMyBookings]);

    const handleBook = async (slotId) => {
        const loadingToast = toast.loading('Booking your slot...');
        try {
            await api.post('/book', { slotId });
            toast.success('Appointment booked successfully!', { id: loadingToast });
            fetchSlots(selectedDate);
            fetchMyBookings();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to book slot.', { id: loadingToast });
        } finally {
            setModal({ isOpen: false, data: null });
        }
    };
    
    const handleCancel = async (bookingId) => {
        const loadingToast = toast.loading('Cancelling your appointment...');
        try {
            await api.delete(`/bookings/${bookingId}`);
            toast.success('Appointment cancelled.', { id: loadingToast });
            fetchSlots(selectedDate);
            fetchMyBookings();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to cancel.', { id: loadingToast });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <PageWrapper>
            <h1 className="text-3xl font-bold text-white mb-8">Patient Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center">
                        <CalendarIcon className="h-6 w-6 mr-2" />
                        Available Slots
                    </h2>
                    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                        {sevenDays.map(day => (
                            <button key={day.format('YYYY-MM-DD')} onClick={() => setSelectedDate(day.format('YYYY-MM-DD'))}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${selectedDate === day.format('YYYY-MM-DD') ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                <p>{day.format('ddd')}</p>
                                <p className="font-bold text-lg">{day.format('DD')}</p>
                            </button>
                        ))}
                    </div>

                    {loading.slots ? <p>Loading...</p> : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {slots.length > 0 ? slots.map(slot => (
                                    <motion.div key={slot.slotId} variants={itemVariants}>
                                        <button onClick={() => setModal({ isOpen: true, data: slot })} className="w-full text-center bg-gray-800 hover:bg-emerald-500 border border-gray-700 hover:border-emerald-500 p-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1">
                                            <p className="font-bold">{moment(slot.start).format('h:mm A')}</p>
                                        </button>
                                    </motion.div>
                                )) : <p className="col-span-full text-gray-400">No available slots for this day.</p>}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </Card>

                <Card>
                     <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center">
                        <ClockIcon className="h-6 w-6 mr-2" />
                        My Appointments
                    </h2>
                    {loading.bookings ? <p>Loading...</p> : (
                         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                             {myBookings.length > 0 ? myBookings.map(booking => (
                                 <motion.div key={booking._id} variants={itemVariants} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                                     <div>
                                         <p className="font-bold">{moment(booking.slotStartTime).format('dddd, MMM DD')}</p>
                                         <p className="text-sm text-gray-300">{moment(booking.slotStartTime).format('h:mm A')}</p>
                                     </div>
                                     <button onClick={() => handleCancel(booking._id)} className="text-red-400 hover:text-red-300 p-2 rounded-full transition-colors">
                                         <XCircleIcon className="h-6 w-6" />
                                     </button>
                                 </motion.div>
                             )) : <p className="text-gray-400">You have no upcoming appointments.</p>}
                         </motion.div>
                    )}
                </Card>
            </div>
            
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, data: null })}
                onConfirm={() => handleBook(modal.data.slotId)}
                title="Confirm Booking"
                description={`Are you sure you want to book an appointment for ${moment(modal.data?.start).format('MMMM Do, YY')} at ${moment(modal.data?.start).format('h:mm A')}?`}
            />
        </PageWrapper>
    );
};

export default Dashboard;