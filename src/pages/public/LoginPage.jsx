import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    Droplet,
    Mail,
    Lock,
    ArrowRight,
    User,
    Building2,
    ShieldCheck,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Optional: Import specific assets if needed, or use placeholders
// import loginBg from '../../assets/images/login-bg.jpg'; 

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // State
    const [role, setRole] = useState(location.state?.role || 'donor');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setGeneralError('');
    };

    // Validate Form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // await new Promise(resolve => setTimeout(resolve, 800)); // Remove delay

            const result = await login({
                email: formData.email,
                password: formData.password,
                role: role
            });

            if (result.success) {
                const dashboardMap = {
                    donor: '/dashboard/donor',
                    hospital: '/dashboard/hospital',
                    admin: '/dashboard/admin'
                };
                navigate(dashboardMap[role]);
            } else {
                setGeneralError(result.message || 'Login failed');
            }
        } catch (err) {
            setGeneralError('An unexpected error occurred');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Pre-fill demo credentials - DISABLED
    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setFormData({
            email: '',
            password: ''
        });
        setErrors({});
        setGeneralError('');
    };

    // Handle initial role from navigation state
    React.useEffect(() => {
        if (location.state?.role) {
            handleRoleChange(location.state.role);
        }
    }, [location.state]);

    const roles = [
        { id: 'donor', label: 'Donor', icon: User },
        { id: 'hospital', label: 'Hospital', icon: Building2 },
        { id: 'admin', label: 'Admin', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen flex bg-white font-sans text-neutral-800">

            {/* Visual Side (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-neutral-900 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-neutral-900 to-neutral-900 opacity-90 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1966&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />

                <div className="relative z-20 max-w-lg space-y-8">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                        <Droplet size={32} className="text-white fill-current" />
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight text-white">
                        Donate Blood,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Save a Life.</span>
                    </h1>
                    <p className="text-lg text-neutral-300 leading-relaxed theme-transition">
                        Join the largest network of donors and hospitals. Real-time availability, secure tracking, and instant emergency response monitoring.
                    </p>
                    <div className="space-y-4">
                        {[
                            'Secure & Private Data',
                            'Real-time Updates',
                            'Verified Partner Hospitals'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-neutral-200 font-medium">
                                <CheckCircle size={20} className="text-success-400" /> {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-medium transition-colors">
                    Back to Home
                </Link>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-flex lg:hidden items-center justify-center w-12 h-12 bg-primary text-white rounded-xl mb-6 shadow-lg shadow-primary/30">
                            <Droplet size={24} className="fill-current" />
                        </Link>
                        <h2 className="text-3xl font-bold text-neutral-900">Welcome Back</h2>
                        <p className="text-neutral-500 mt-2">Please login to access your dashboard.</p>
                    </div>

                    {/* Role Selector */}
                    <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100/50 rounded-xl border border-neutral-100">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => handleRoleChange(r.id)}
                                className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${role === r.id
                                    ? 'bg-white shadow-sm text-primary ring-1 ring-neutral-200/50'
                                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'
                                    }`}
                            >
                                <r.icon size={18} className={`mb-1 ${role === r.id ? 'fill-current' : ''}`} />
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {generalError && (
                            <div className="p-4 bg-red-50 text-error text-sm rounded-xl border border-red-100 font-medium text-center">
                                {generalError}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.email
                                            ? 'border-error focus:ring-2 focus:ring-error/20'
                                            : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-error font-medium">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.password
                                            ? 'border-error focus:ring-2 focus:ring-error/20'
                                            : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-error font-medium">{errors.password}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded text-primary border-neutral-300 focus:ring-primary" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-primary font-medium hover:text-primary-hover">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Logging in...' : 'Sign In'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-neutral-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-bold hover:text-primary-hover">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
