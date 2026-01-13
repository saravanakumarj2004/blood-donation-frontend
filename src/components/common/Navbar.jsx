import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Handle Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Find Blood', path: '/login', state: { role: 'hospital' } },
        { name: 'Donate', path: '/login', state: { role: 'donor' } },
        { name: 'Hospitals', path: '/login', state: { role: 'hospital' } },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 backdrop-blur-md shadow-soft py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">



                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <img
                        src={logo}
                        alt="BloodStock Logo"
                        className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className={`font-extrabold text-2xl tracking-tight ${isScrolled ? 'text-neutral-900' : 'text-neutral-900'}`}>
                        Blood<span className="text-primary">Stock</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.path}
                            state={link.state}
                            className={`font-medium transition-colors hover:text-primary ${location.pathname === link.path && !link.state ? 'text-primary' : 'text-neutral-600'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="h-6 w-px bg-neutral-200 mx-2"></div>

                    <Link to="/login" className="text-neutral-600 font-medium hover:text-primary transition-colors">
                        Log In
                    </Link>
                    <Link to="/register" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5">
                        Join Now
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-neutral-800 p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-neutral-100 overflow-hidden shadow-xl"
                    >
                        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    state={link.state}
                                    className="text-lg font-medium text-neutral-700 py-2 border-b border-neutral-50 last:border-0"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-4">
                                <Link to="/login" className="w-full py-3 text-center text-neutral-700 font-bold border border-neutral-200 rounded-xl hover:bg-neutral-50">
                                    Log In
                                </Link>
                                <Link to="/register" className="w-full py-3 text-center bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
                                    Join Now
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
