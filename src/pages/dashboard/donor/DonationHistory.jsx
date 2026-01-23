import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckCircle, Clock, Droplet, ArrowRight, Activity, Filter } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { donorAPI } from '../../../services/api';

const DonationHistory = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState('All'); // 'All', 'Emergency', 'Voluntary'

    useEffect(() => {
        const fetchHistory = async () => {
            if (user?.id) {
                try {
                    const data = await donorAPI.getHistory(user.id);
                    setDonations(data);
                } catch (error) {
                    console.error("Failed to load history", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchHistory();

        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const filteredDonations = donations.filter(d => {
        if (filterType === 'All') return true;
        if (filterType === 'Emergency') return d.type === 'Emergency Donation' || d.type === 'EMERGENCY_ALERT';
        if (filterType === 'Voluntary') return d.type !== 'Emergency Donation' && d.type !== 'EMERGENCY_ALERT';
        return true;
    });

    const toggleFilter = () => {
        if (filterType === 'All') setFilterType('Emergency');
        else if (filterType === 'Emergency') setFilterType('Voluntary');
        else setFilterType('All');
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-40 left-20 w-[400px] h-[400px] bg-green-50/50 rounded-full blur-[80px]" />
                <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[80px]" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] shadow-xl shadow-neutral-100/50">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                            <Clock size={32} />
                        </div>
                        Donation History
                    </h2>
                    <p className="text-neutral-500 font-medium mt-2 ml-16">Track your journey of saving lives.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleFilter}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all ${filterType !== 'All'
                            ? 'bg-primary text-white border-primary shadow-primary/30 hover:bg-primary-dark'
                            : 'bg-white/80 border-white/50 text-neutral-600 hover:bg-white'
                            }`}
                    >
                        <Filter size={18} /> {filterType === 'All' ? 'Filter Type' : filterType}
                    </button>
                    <div className="px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl border border-primary/10">
                        Total Donations: {filteredDonations.length}
                    </div>
                </div>
            </div>

            <div className="relative border-l-4 border-neutral-100 ml-4 md:ml-8 space-y-12 pb-12">
                {filteredDonations.length > 0 ? (
                    filteredDonations.map((donation, idx) => (
                        <div key={donation.id || idx} className="relative pl-8 md:pl-16 group">
                            {/* Timeline Connector */}
                            <div className="absolute -left-[14px] top-8 w-7 h-7 bg-white rounded-full border-4 border-primary shadow-lg flex items-center justify-center group-hover:scale-125 transition-transform z-10">
                                <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 text-sm font-black text-primary mb-2 uppercase tracking-wider">
                                            <Calendar size={16} /> {new Date(donation.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            <span className="text-neutral-400 mx-1">|</span>
                                            {donation.time ? new Date(`2000-01-01T${donation.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time N/A'}
                                        </div>
                                        <h3 className="text-2xl font-black text-neutral-900 mb-1">{donation.hospitalName || donation.location || 'Blood Bank'}</h3>
                                        <div className="text-neutral-500 font-medium flex items-center gap-2">
                                            <MapPin size={16} /> {donation.location || 'Main Center'}
                                        </div>
                                    </div>

                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${donation.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        'bg-neutral-50 text-neutral-600 border-neutral-100'}`}>
                                        <CheckCircle size={16} /> {donation.status}
                                    </span>
                                    {(donation.status === 'Pending' || donation.status === 'Scheduled') && (
                                        <button
                                            onClick={async () => {
                                                if (confirm("Cancel appointment?")) {
                                                    await donorAPI.cancelAppointment(donation.id || donation._id, "Web Cancel");
                                                    window.location.reload();
                                                }
                                            }}
                                            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200"
                                        >Cancel</button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-dashed border-neutral-200 relative z-10">
                                    <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 text-center hover:bg-white transition-colors">
                                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Units</div>
                                        <div className="text-xl font-black text-neutral-900 flex items-center justify-center gap-1">
                                            <Droplet size={18} className="text-primary" /> {donation.units}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 text-center hover:bg-white transition-colors">
                                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Type</div>
                                        <div className="text-base font-bold text-neutral-900 truncate px-2">
                                            {donation.type === 'Emergency Donation' ? 'Emergency' : 'Voluntary'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 text-center hover:bg-white transition-colors col-span-2 md:col-span-2">
                                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Impact</div>
                                        <div className="text-base font-bold text-primary flex items-center justify-center gap-2">
                                            <Activity size={18} />
                                            {donation.status === 'Completed' ? 'Lives Saved' : 'Pending Verification'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="ml-8 md:ml-16 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-12 text-center border-2 border-dashed border-neutral-200">
                        <div className="w-20 h-20 bg-neutral-100/80 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock size={40} className="text-neutral-400" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">No donations found</h3>
                        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                            {filterType === 'All'
                                ? "Your journey of saving lives hasn't started yet. Book your first appointment today!"
                                : `No ${filterType.toLowerCase()} donations found in your history.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationHistory;
