import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import {
    Droplet,
    Mail,
    Lock,
    ArrowRight,
    User,
    Building2,
    MapPin,
    CheckCircle,
    Phone,
    Calendar,
    AlertCircle
} from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';

const RegisterPage = () => {
    const navigate = useNavigate();

    const [role, setRole] = useState('donor');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        phone: '',
        bloodGroup: '',
        dob: '',
        gender: '', // Added Gender field
        securityQuestion: '',
        securityAnswer: ''
    });

    const securityQuestions = [
        "What is your mother's maiden name?",
        "What was the name of your first pet?",
        "What city were you born in?",
        "What is your favorite book?",
        "What is the name of your primary school?"
    ];

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Auto-Capitalization
        if (name === 'name') {
            value = value.replace(/\b\w/g, c => c.toUpperCase());
        }
        if (name === 'location' || name === 'securityAnswer') {
            value = value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            // Simple 10 digit validation
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        if (role === 'donor' && !formData.bloodGroup) {
            newErrors.bloodGroup = 'Please select your blood group';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.location.trim()) {
            newErrors.location = role === 'hospital' ? 'Hospital location is required' : 'Address/Location is required';
        }

        if (role === 'donor' && !formData.dob) {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (!formData.dob) {
                newErrors.dob = 'Date of birth is required';
            } else if (age < 18) {
                newErrors.dob = 'You must be at least 18 years old to donate';
                alert("You are not eligible to donate as well as creating the account in our website.");
            }
        }

        if (!formData.securityQuestion) {
            newErrors.securityQuestion = 'Please select a security question';
        }
        if (!formData.securityAnswer.trim()) {
            newErrors.securityAnswer = 'Security answer is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await authAPI.register({
                ...formData,
                role: role
            });

            if (response.success) {
                setIsLoading(false);
                navigate('/login', {
                    state: {
                        role: role,
                        message: 'Registration successful! Please login.'
                    }
                });
            }
        } catch (error) {
            console.error("Registration failed", error);
            // Extract specific backend error message
            const backendError = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';

            setErrors(prev => ({
                ...prev,
                // Assign to generic 'form' error or specific field if possible. 
                // For now, alerting or setting a global error is better, but putting it adjacent to email/submit is fallback.
                form: backendError
            }));

            // Also show a toast/alert for immediate visibility
            alert(backendError);

            setIsLoading(false);
        }
    };

    const roles = [
        { id: 'donor', label: 'Donor', icon: User },
        { id: 'hospital', label: 'Hospital', icon: Building2 },
    ];

    return (
        <div className="min-h-screen flex bg-white font-sans text-neutral-800">

            {/* Visual Side (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-neutral-900 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-neutral-900 to-neutral-900 opacity-90 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />

                <div className="relative z-20 max-w-lg space-y-8">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                        <User size={32} className="text-white fill-current" />
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight text-white">
                        Join the<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Mission.</span>
                    </h1>
                    <p className="text-lg text-neutral-300 leading-relaxed theme-transition">
                        {role === 'donor'
                            ? "Become a hero today. Your donation can save up to 3 lives. Register now to find nearby donation centers."
                            : "Partner with us to manage blood inventory efficiently and save lives in your community."}
                    </p>
                    <div className="space-y-4">
                        {[
                            'Secure Account Protection',
                            'Instant Notifications',
                            'Verified Community'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-neutral-200 font-medium">
                                <CheckCircle size={20} className="text-emerald-400" /> {item}
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
                        <Link to="/" className="inline-flex lg:hidden items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-xl mb-6 shadow-lg shadow-emerald-600/30">
                            <Droplet size={24} className="fill-current" />
                        </Link>
                        <h2 className="text-3xl font-bold text-neutral-900">Create Account</h2>
                        <p className="text-neutral-500 mt-2">Sign up to get started.</p>
                    </div>

                    {/* Role Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100/50 rounded-xl border border-neutral-100">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className={`flex flex-row items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${role === r.id
                                    ? 'bg-white shadow-sm text-neutral-900 ring-1 ring-neutral-200/50'
                                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'
                                    }`}
                            >
                                <r.icon size={18} className={`${role === r.id ? 'fill-current text-primary' : ''}`} />
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {errors.form && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={20} className="shrink-0" />
                            {errors.form}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            {role !== 'hospital' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Gender</label>
                                    <CustomSelect
                                        options={['Male', 'Female', 'Other']}
                                        value={formData.gender}
                                        onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                                        placeholder="Select Gender"
                                        className="w-full"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">{role === 'hospital' ? 'Hospital Name' : 'Full Name'}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                        {role === 'hospital' ? <Building2 size={20} /> : <User size={20} />}
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.name
                                            ? 'border-error focus:ring-2 focus:ring-error/20'
                                            : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder={role === 'hospital' ? 'General Hospital' : 'John Doe'}
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-xs text-error font-medium">{errors.name}</p>}
                            </div>

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
                                        placeholder="name@example.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-error font-medium">{errors.email}</p>}
                            </div>

                            {role === 'donor' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Blood Group</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 z-10 transition-colors">
                                            {/* Icon handled by CustomSelect if passed, or wrapper */}
                                            {/* CustomSelect handles icon internally better for spacing. Let's pass icon prop */}
                                        </div>
                                        <CustomSelect
                                            options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                            value={formData.bloodGroup}
                                            onChange={(val) => setFormData(prev => ({ ...prev, bloodGroup: val }))}
                                            placeholder="Select Blood Group"
                                            icon={Droplet}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                    {errors.bloodGroup && <p className="mt-1 text-xs text-error font-medium">{errors.bloodGroup}</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={role === 'donor' ? '' : 'md:col-span-2'}>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                            <Phone size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.phone
                                                ? 'border-error focus:ring-2 focus:ring-error/20'
                                                : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                }`}
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-1 text-xs text-error font-medium">{errors.phone}</p>}
                                </div>

                                {role === 'donor' && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Date of Birth</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                                <Calendar size={20} />
                                            </div>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.dob
                                                    ? 'border-error focus:ring-2 focus:ring-error/20'
                                                    : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                    }`}
                                            />
                                        </div>
                                        {errors.dob && <p className="mt-1 text-xs text-error font-medium">{errors.dob}</p>}
                                    </div>
                                )}
                            </div>

                            {role === 'donor' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Last Donation Date <span className="text-neutral-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                            <Calendar size={20} />
                                        </div>
                                        <input
                                            type="date"
                                            name="lastDonationDate"
                                            value={formData.lastDonationDate || ''}
                                            onChange={handleChange}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">Leave empty if you have never donated before.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">{role === 'hospital' ? 'Hospital Location' : 'Address / Location'}</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                            <MapPin size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.location
                                                ? 'border-error focus:ring-2 focus:ring-error/20'
                                                : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                }`}
                                            placeholder={role === 'hospital' ? 'City, District' : 'Street Address, City'}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (position) => {
                                                        const { latitude, longitude } = position.coords;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            coordinates: { latitude, longitude },
                                                            location: prev.location || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
                                                        }));
                                                        alert("Location detected successfully!");
                                                    },
                                                    (error) => {
                                                        console.error(error);
                                                        alert("Unable to retrieve location.");
                                                    }
                                                );
                                            } else {
                                                alert("Geolocation is not supported by your browser.");
                                            }
                                        }}
                                        className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-2"
                                        title="Get Current Location"
                                    >
                                        <MapPin size={20} />
                                        <span className="hidden sm:inline">Detect</span>
                                    </button>
                                </div>
                                {formData.coordinates && (
                                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                                        ✓ Coordinates captured
                                    </p>
                                )}
                                {errors.location && <p className="mt-1 text-xs text-error font-medium">{errors.location}</p>}
                            </div>

                        </div>

                        <div className="space-y-4 pt-2 border-t border-neutral-100">
                            <h3 className="text-sm font-bold text-neutral-900">Security & Recovery</h3>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Security Question</label>
                                <div className="relative">
                                    <CustomSelect
                                        options={securityQuestions}
                                        value={formData.securityQuestion}
                                        onChange={(val) => setFormData(prev => ({ ...prev, securityQuestion: val }))}
                                        placeholder="Select a security question"
                                        className="w-full"
                                        required
                                    />
                                </div>
                                {errors.securityQuestion && <p className="mt-1 text-xs text-error font-medium">{errors.securityQuestion}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Security Answer</label>
                                <input
                                    type="text"
                                    name="securityAnswer"
                                    value={formData.securityAnswer}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.securityAnswer
                                        ? 'border-error focus:ring-2 focus:ring-error/20'
                                        : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                        }`}
                                    placeholder="Your answer"
                                />
                                {errors.securityAnswer && <p className="mt-1 text-xs text-error font-medium">{errors.securityAnswer}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                        placeholder="••••••"
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-error font-medium">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white outline-none transition-all ${errors.confirmPassword
                                            ? 'border-error focus:ring-2 focus:ring-error/20'
                                            : 'border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="••••••"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-xs text-error font-medium">{errors.confirmPassword}</p>}
                            </div>
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-neutral-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-bold hover:text-primary-hover">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default RegisterPage;
