import React, { useState } from 'react';
import { Bell, MapPin, Eye, Moon, Shield, Save } from 'lucide-react';

const DonorSettings = () => {
    const [settings, setSettings] = useState({
        darkMode: false,
        emergencyAlerts: true,
        locationSharing: true,
        emailNotifs: true
    });

    const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-800 to-neutral-500 flex items-center gap-3">
                        <span className="text-4xl">⚙️</span> Settings
                    </h1>
                    <p className="text-neutral-500 font-medium ml-12">Manage privacy and preferences.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Appearance */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/60">
                    <h3 className="text-lg font-black text-neutral-900 mb-6 flex items-center gap-2"><Eye size={20} className="text-blue-500" /> Appearance</h3>
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white"><Moon size={18} /></div>
                            <div>
                                <div className="font-bold text-neutral-900">Dark Mode</div>
                                <div className="text-xs font-bold text-neutral-400">Switch to dark theme</div>
                            </div>
                        </div>
                        <button onClick={() => toggle('darkMode')} className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.darkMode ? 'bg-neutral-900' : 'bg-neutral-200'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Privacy & Alerts */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/60">
                    <h3 className="text-lg font-black text-neutral-900 mb-6 flex items-center gap-2"><Shield size={20} className="text-red-500" /> Privacy & Alerts</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><Bell size={18} /></div>
                                <div>
                                    <div className="font-bold text-neutral-900">Emergency Alerts</div>
                                    <div className="text-xs font-bold text-neutral-400">Receive urgent blood requests</div>
                                </div>
                            </div>
                            <button onClick={() => toggle('emergencyAlerts')} className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.emergencyAlerts ? 'bg-red-500' : 'bg-neutral-200'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.emergencyAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><MapPin size={18} /></div>
                                <div>
                                    <div className="font-bold text-neutral-900">Location Sharing</div>
                                    <div className="text-xs font-bold text-neutral-400">Allow locating for nearby requests</div>
                                </div>
                            </div>
                            <button onClick={() => toggle('locationSharing')} className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.locationSharing ? 'bg-blue-500' : 'bg-neutral-200'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.locationSharing ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <button className="w-full py-4 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> Save Preferences
                </button>
            </div>
        </div>
    );
};

export default DonorSettings;
