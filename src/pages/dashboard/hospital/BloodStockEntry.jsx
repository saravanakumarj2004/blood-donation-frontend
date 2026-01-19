import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Droplet, Calendar, Database, MapPin, Building2, CheckCircle, AlertTriangle, User } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';

const BloodStockEntry = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [form, setForm] = useState({
        bloodGroup: '',
        componentType: '',
        units: '',
        collectedDate: '',
        expiryDate: '',
        sourceType: '',
        sourceName: '',
        location: ''
    });

    const navigate = useNavigate();

    const handleInput = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));

        // Auto-calculate expiry
        if (key === 'collectedDate' && form.componentType) {
            calculateExpiry(value, form.componentType);
        }
        if (key === 'componentType' && form.collectedDate) {
            calculateExpiry(form.collectedDate, value);
        }
    };

    const calculateExpiry = (start, type) => {
        if (!start) return;
        const date = new Date(start);
        let days = 35; // Default Whole Blood
        if (type === 'Platelets') days = 5;
        if (type === 'Plasma') days = 365;

        date.setDate(date.getDate() + days);
        setForm(prev => ({ ...prev, expiryDate: date.toISOString().split('T')[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // New: Create Batch (which also updates inventory)
            console.log("Submitting Batch:", { hospitalId: user.id, ...form });

            await hospitalAPI.createBatch({
                hospitalId: user.id,
                ...form
            });

            setFeedback({ type: 'success', message: 'Blood Stock Entry Recorded! Redirecting to Batches...' });

            // Redirect to Batch Management page after short delay
            setTimeout(() => {
                navigate('/dashboard/hospital/batches');
            }, 1000);

            setForm({
                bloodGroup: '', componentType: '', units: '', collectedDate: '',
                expiryDate: '', sourceType: '', sourceName: '', location: ''
            });
        } catch (err) {
            console.error("Batch Entry Error:", err);
            const errMsg = err.response?.data?.error || err.message || "Failed to record entry";
            setFeedback({ type: 'error', message: `Error: ${errMsg}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in-right ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-bold">{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} className="ml-2 hover:bg-black/5 p-1 rounded-full"><AlertTriangle className="opacity-0" size={16} /></button>
                </div>
            )}

            <div className="flex flex-col gap-4 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                    <span className="text-4xl">➕</span> Blood Stock Entry
                </h1>
                <p className="text-neutral-500 font-medium ml-12">Log new blood units into the inventory system.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/60 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Blood Group */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Blood Group</label>
                    <CustomSelect
                        options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                        value={form.bloodGroup}
                        onChange={v => handleInput('bloodGroup', v)}
                        placeholder="Select Group"
                        icon={Droplet}
                        required
                    />
                </div>

                {/* Component Type */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Component Type</label>
                    <CustomSelect
                        options={['Whole Blood', 'Platelets', 'Plasma', 'RBC']}
                        value={form.componentType}
                        onChange={v => handleInput('componentType', v)}
                        placeholder="Select Component"
                        icon={Droplet}
                        required
                    />
                </div>

                {/* Units */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Units (Bags)</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="number" min="1" max="100"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:bg-white focus:border-primary outline-none transition-all font-bold text-neutral-800"
                            placeholder="e.g. 5"
                            value={form.units}
                            onChange={e => handleInput('units', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Collected Date */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Collected Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="date"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:bg-white focus:border-primary outline-none transition-all font-bold text-neutral-800"
                            value={form.collectedDate}
                            onChange={e => handleInput('collectedDate', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Expiry Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="date"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:bg-white focus:border-primary outline-none transition-all font-bold text-neutral-800"
                            value={form.expiryDate}
                            readOnly
                        />
                    </div>
                </div>

                {/* Storage Location */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Storage Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:bg-white focus:border-primary outline-none transition-all font-bold text-neutral-800"
                            placeholder="e.g. Fridge A-12"
                            value={form.location}
                            onChange={e => handleInput('location', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Source Type */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Source Type</label>
                    <CustomSelect
                        options={['Donor', 'Blood Bank', 'Hospital Transfer']}
                        value={form.sourceType}
                        onChange={v => handleInput('sourceType', v)}
                        placeholder="Select Source"
                        icon={Database}
                        required
                    />
                </div>

                {/* Source Name */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 ml-1">Source Name / ID</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:bg-white focus:border-primary outline-none transition-all font-bold text-neutral-800"
                            placeholder="e.g. John Doe / City Blood Bank"
                            value={form.sourceName}
                            onChange={e => handleInput('sourceName', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-primary to-rose-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'ADD ENTRY'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default BloodStockEntry;
