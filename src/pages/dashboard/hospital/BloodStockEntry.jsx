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
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border bg-white animate-slide-in-right ${feedback.type === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-rose-500" />}
                    <span className="font-semibold text-sm">{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} className="ml-2 hover:bg-slate-100 p-1 rounded-full"><AlertTriangle className="opacity-0" size={16} /></button>
                </div>
            )}

            <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Database className="text-rose-600" size={32} /> Blood Stock Entry
                </h1>
                <p className="text-slate-500 font-medium ml-11">Log new blood units into the inventory system.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Blood Group */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Blood Group</label>
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
                    <label className="text-sm font-bold text-slate-700 ml-1">Component Type</label>
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
                    <label className="text-sm font-bold text-slate-700 ml-1">Units (Bags)</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="number" min="1" max="100"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                            placeholder="e.g. 5"
                            value={form.units}
                            onChange={e => handleInput('units', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Collected Date */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Collected Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                            value={form.collectedDate}
                            onChange={e => handleInput('collectedDate', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Expiry Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                            value={form.expiryDate}
                            readOnly
                        />
                    </div>
                </div>

                {/* Storage Location */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Storage Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                            placeholder="e.g. Fridge A-12"
                            value={form.location}
                            onChange={e => handleInput('location', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Source Type */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Source Type</label>
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
                    <label className="text-sm font-bold text-slate-700 ml-1">Source Name / ID</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                            placeholder="e.g. John Doe / City Blood Bank"
                            value={form.sourceName}
                            onChange={e => handleInput('sourceName', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-base rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'ADD ENTRY'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default BloodStockEntry;
