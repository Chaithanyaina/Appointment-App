import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const activeLinkStyle = { color: '#34d399' };

    return (
        <header className="bg-transparent">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-800">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 text-white text-xl font-bold flex items-center">
                            <CalendarDaysIcon className="h-7 w-7 text-emerald-400 mr-2" />
                            <span>ClinicFlow</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {user?.role === 'admin' && (
                                    <NavLink to="/admin" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Admin</NavLink>
                                )}
                                <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</NavLink>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={logout}
                                    className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                    Logout
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"><ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" /> Login</NavLink>
                                <NavLink to="/register" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"><UserPlusIcon className="h-5 w-5 mr-1" /> Register</NavLink>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;