import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { User, Mail, Phone, MapPin, Shield, Lock, Save, Edit2, Building2 } from 'lucide-react';
import { authAPI } from '../../../services/api';

const HospitalProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    // Initial State (Populated from Auth Context)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.location || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Map 'address' to 'location' to match Backend Schema
            const payload = {
                ...formData,
                location: formData.address
            };
            if (formData.password) {
                payload.password = formData.password;
            }

            await authAPI.updateProfile(user.id, payload);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (e) {
            console.error("Failed to update profile", e);
            alert("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Building2 className="text-rose-600" size={32} />
                        Hospital Profile
                    </h2>
                    <p className="text-slate-500 font-medium ml-11">Manage your hospital identity and contact info.</p>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm ${isEditing
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:bg-rose-700'
                        : 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50'
                        }`}
                >
                    {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Left Col: Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-rose-600 opacity-10" />

                        <div className="relative z-10 mt-2">
                            <div className="w-32 h-32 mx-auto bg-white rounded-full p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 relative group-hover:scale-105 transition-transform duration-500">
                                <div className="w-full h-full rounded-full bg-rose-50 flex items-center justify-center text-4xl font-bold text-rose-600 border border-rose-100 shadow-inner overflow-hidden">
                                    <Building2 size={48} />
                                </div>
                            </div>

                            <div className="mt-6 mb-2">
                                <h3 className="text-xl font-bold text-slate-900">{formData.name || 'Hospital Name'}</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">Healthcare Provider</p>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold tracking-wide border border-rose-200 uppercase mt-2">
                                <Shield size={14} /> HOSPITAL LICENSE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Details Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-rose-600 rounded-full" />
                            General Information
                        </h4>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Hospital Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
                                        <Building2 size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed font-semibold text-sm"
                                        value={formData.email}
                                        disabled={true}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <Lock size={14} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Details section moved inside the card */}
                        <div className="mb-8 pt-6 border-t border-slate-100">
                            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-rose-600 rounded-full" />
                                Location Details
                            </h4>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Hospital Address</label>
                                <div className="relative group">
                                    <div className="absolute top-3 left-3 pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <textarea
                                        name="address"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Update Section */}
                        {isEditing && (
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 text-rose-600">
                                    <Lock size={16} /> Change Password (Optional)
                                </h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                                    <div className="relative group max-w-md">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter new password (min 6 chars)"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalProfile;
