import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { User, Mail, Phone, MapPin, Heart, Shield, Lock, Save, Camera, Edit2, Droplet, Calendar, Award } from 'lucide-react';
import { authAPI } from '../../../services/api';

const DonorProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    // Initial State (Populated from Auth Context)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bloodGroup: '',
        dob: '',
        address: '',
        bio: '',
        occupation: '',
        livesSaved: 0
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bloodGroup: user.bloodGroup || '',
                dob: user.dob || '',
                address: user.location || ''
            }));

            // Fetch latest stats (lives saved)
            const fetchStats = async () => {
                try {
                    const stats = await authAPI.getDonorStats(user.id);
                    setFormData(prev => ({ ...prev, livesSaved: stats.livesSaved || 0 }));
                } catch (e) {
                    console.error("Failed to fetch profile stats");
                }
            };
            fetchStats();
        }
    }, [user]);

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Auto-Capitalization
        if (name === 'name' || name === 'occupation') {
            value = value.replace(/\b\w/g, c => c.toUpperCase());
        }
        if (name === 'address' || name === 'bio') {
            value = value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Calculate Changed Fields (Partial Update)
            const changedData = {};

            // Compare each field with initial user data
            Object.keys(formData).forEach(key => {
                let initialValue = user[key];
                // Handle naming mismatch: formData.address vs user.location
                if (key === 'address') initialValue = user.location;

                // If value differs, add to payload
                if (formData[key] !== initialValue) {
                    changedData[key] = formData[key];
                }
            });

            // Special handling: map 'address' back to 'location' for backend
            if (changedData.address !== undefined) {
                changedData.location = changedData.address;
                delete changedData.address;
            }

            if (Object.keys(changedData).length === 0) {
                setIsEditing(false);
                return; // No changes
            }

            await authAPI.updateProfile(user.id, changedData);
            setIsEditing(false);

            // Improve UX: Refresh data or show toast
            // For now, we rely on the component re-rendering via Context update if implemented,
            // or just local state matching. Ideally, fetchProfile again or update context.
            // window.location.reload(); // Brute force refresh to sync Context
        } catch (e) {
            console.error("Failed to update profile", e);
            alert("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-red-50/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[100px]" />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <User size={32} />
                        </div>
                        My Profile
                    </h2>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${isEditing
                        ? 'bg-neutral-900 text-white shadow-neutral-500/20 hover:scale-105'
                        : 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50'
                        }`}
                >
                    {isEditing ? <><Save size={20} /> Save Changes</> : <><Edit2 size={20} /> Edit Profile</>}
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Col: Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-500 via-rose-500 to-primary-700 opacity-100" />
                        <div className="absolute top-0 left-0 w-full h-32 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                        <div className="relative z-10 -mt-12">
                            <div className="w-40 h-40 mx-auto bg-white rounded-[2rem] p-1.5 shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-5xl font-black text-primary border-4 border-white shadow-inner relative overflow-hidden">
                                    {formData.name.charAt(0)}
                                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary text-primary">
                                    <Camera size={18} />
                                </div>
                            </div>

                            <div className="mt-6 mb-2">
                                <h3 className="text-2xl font-black text-neutral-900">{formData.name}</h3>
                                <p className="text-neutral-500 font-medium">{formData.occupation}</p>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wide uppercase border border-blue-100">
                                <Shield size={14} /> {user?.role?.toUpperCase()}
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                                <div className="p-4 bg-white/80 rounded-2xl border border-white shadow-sm">
                                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Blood Group</div>
                                    <div className="text-2xl font-black text-primary flex items-center gap-1">
                                        <Droplet size={20} className="fill-current" /> {formData.bloodGroup}
                                    </div>
                                </div>
                                <div className="p-4 bg-white/80 rounded-2xl border border-white shadow-sm">
                                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Lives Saved</div>
                                    <div className="text-2xl font-black text-emerald-500 flex items-center gap-1">
                                        <Heart size={20} className="fill-current" /> {formData.livesSaved}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badges/Achievements Placeholder */}
                    <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-lg">
                        <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                            <Award size={20} className="text-amber-500" /> Achievements
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-xl shrink-0 opacity-80 grayscale hover:grayscale-0 transition-all cursor-help" title="Locked">
                                    🏆
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Details Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white/60 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 relative overflow-hidden">
                        <h4 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
                            <span className="w-2 h-8 bg-primary rounded-full" />
                            Personal Information
                        </h4>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-100/50 text-neutral-500 cursor-not-allowed font-medium"
                                        value={formData.email}
                                        disabled={true}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                                        <Lock size={16} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                        <Phone size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Date of Birth</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <input
                                        type="date"
                                        name="dob"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-100/50 text-neutral-500 cursor-not-allowed font-medium"
                                        value={formData.dob}
                                        disabled={true}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                                        <Lock size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Update Section */}
                        {isEditing && (
                            <div className="mt-8 pt-6 border-t border-dashed border-neutral-200">
                                <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2 text-red-600">
                                    <Lock size={16} /> Change Password (Optional)
                                </h4>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter new password (min 6 chars)"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-neutral-800"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <h4 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-2 pt-8 border-t border-dashed border-neutral-200">
                        <span className="w-2 h-8 bg-blue-500 rounded-full" />
                        Address Details
                    </h4>

                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Residential Address</label>
                        <div className="relative group">
                            <div className="absolute top-4 left-4 pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                <MapPin size={22} />
                            </div>
                            <textarea
                                name="address"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-neutral-800 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                                rows="3"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorProfile;
