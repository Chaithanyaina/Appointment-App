import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Logging in...');
        try {
            await login(email, password);
            toast.success('Logged in successfully!', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to login.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
                <h2 className="text-3xl font-bold text-center text-white">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Email Address"/>
                    </div>
                    <div>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Password"/>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(22, 163, 74, 0.5)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500 transition-all disabled:opacity-50">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-emerald-400 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
export default Login;