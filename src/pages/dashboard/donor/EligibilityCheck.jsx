import React, { useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Scale, Activity, Pill } from 'lucide-react';

const EligibilityCheck = () => {
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        lastDonation: '',
        weight: '',
        illness: false,
        medication: false
    });

    const checkStatus = (e) => {
        e.preventDefault();
        const daysSince = form.lastDonation ? (new Date() - new Date(form.lastDonation)) / (1000 * 60 * 60 * 24) : 999;

        if (form.weight < 50) {
            setResult({ status: 'fail', msg: 'Minimum weight of 50kg is required.' });
        } else if (daysSince < 90) {
            setResult({ status: 'fail', msg: `You donated ${Math.floor(daysSince)} days ago. Minimum wait is 90 days.` });
        } else if (form.illness || form.medication) {
            setResult({ status: 'fail', msg: 'Please consult a doctor regarding your illness/medication.' });
        } else {
            setResult({ status: 'pass', msg: 'You are eligible to donate! 🎉' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    Am I Eligible?
                </h1>
                <p className="text-neutral-500 font-medium">Quick health check before you donate.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/60">
                <form onSubmit={checkStatus} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Last Donation Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                                type="date"
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                value={form.lastDonation}
                                onChange={e => setForm({ ...form, lastDonation: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Current Weight (kg)</label>
                        <div className="relative">
                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                                type="number"
                                placeholder="e.g. 65"
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                value={form.weight}
                                onChange={e => setForm({ ...form, weight: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 cursor-pointer hover:bg-white transition-colors">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${form.illness ? 'bg-red-500 border-red-500 text-white' : 'border-neutral-300'}`}>
                                {form.illness && <CheckCircle size={14} />}
                            </div>
                            <input type="checkbox" className="hidden" checked={form.illness} onChange={e => setForm({ ...form, illness: e.target.checked })} />
                            <div className="flex-1">
                                <div className="font-bold text-neutral-800 flex items-center gap-2"><Activity size={16} className="text-red-500" /> Any Acute Illness?</div>
                                <div className="text-xs font-bold text-neutral-400 ml-6">Flu, Infection, Fever within 2 weeks</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 cursor-pointer hover:bg-white transition-colors">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${form.medication ? 'bg-red-500 border-red-500 text-white' : 'border-neutral-300'}`}>
                                {form.medication && <CheckCircle size={14} />}
                            </div>
                            <input type="checkbox" className="hidden" checked={form.medication} onChange={e => setForm({ ...form, medication: e.target.checked })} />
                            <div className="flex-1">
                                <div className="font-bold text-neutral-800 flex items-center gap-2"><Pill size={16} className="text-blue-500" /> Taking Medication?</div>
                                <div className="text-xs font-bold text-neutral-400 ml-6">Antibiotics, Steroids, etc.</div>
                            </div>
                        </label>
                    </div>

                    <button type="submit" className="w-full py-4 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all">
                        Check Eligibility
                    </button>
                </form>

                {result && (
                    <div className={`mt-6 p-6 rounded-2xl flex items-start gap-4 animate-scale-in ${result.status === 'pass' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
                        }`}>
                        {result.status === 'pass' ? <CheckCircle size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
                        <div>
                            <h3 className="font-black text-lg">{result.status === 'pass' ? 'Eligible!' : 'Not Eligible'}</h3>
                            <p className="font-medium text-sm mt-1 opacity-90">{result.msg}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EligibilityCheck;
