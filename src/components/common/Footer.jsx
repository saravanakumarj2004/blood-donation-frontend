import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-8 border-t border-neutral-800 font-sans">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white font-bold text-2xl">
                            <span className="text-primary text-3xl">🩸</span> BloodStock
                        </div>
                        <p className="text-neutral-500 leading-relaxed text-sm">
                            A unified digital platform connecting donors, hospitals, and blood banks to ensure
                            availability and zero wastage. Saving lives through technology, one unit at a time.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Explore</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/donate" className="hover:text-primary transition-colors">Find Donor</Link></li>
                            <li><Link to="/hospitals" className="hover:text-primary transition-colors">Partner Hospitals</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="/cookie" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                            <li><Link to="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary"></span> support@bloodstock.com
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary"></span> +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary"></span> 123 Health Ave, NY
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
                    <p>&copy; 2026 Blood Donation System. All rights reserved.</p>
                    <p className="flex items-center gap-1">Made with <Heart size={16} className="text-primary fill-current" /> for humanity.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
