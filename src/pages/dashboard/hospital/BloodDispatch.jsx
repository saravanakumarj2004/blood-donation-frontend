import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../../services/api';
import { Truck, Package, Calendar, User, CheckCircle, AlertTriangle } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import { useAuth } from '../../../hooks/useAuth';

const BloodDispatch = () => {
    const { user } = useAuth();
    // State for dispatches
    const [pendingDispatches, setPendingDispatches] = useState([]);

    useEffect(() => {
        const fetchDispatches = async () => {
            if (!user?.id) return;
            try {
                // Fetch requests where I am the responder (Hospital) and status is 'Accepted' (Ready to Dispatch)
                // We reuse getRequests which we know returns requests related to the user.
                const allRequests = await hospitalAPI.getRequests(user.id);
                // Filter: Incoming requests (I am responder) that I have accepted.
                const pending = allRequests.filter(r => !r.isOutgoing && r.status === 'Accepted');
                setPendingDispatches(pending);
            } catch (e) {
                console.error("Failed to fetch dispatches", e);
            }
        };
        fetchDispatches();
    }, [user]);

    const [selectedReq, setSelectedReq] = useState(null);
    const [form, setForm] = useState({
        dispatchDate: '',
        transportMode: '',
        dispatchedBy: '',
        trackingId: ''
    });
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await hospitalAPI.dispatchBlood({
                reqId: selectedReq.id || selectedReq._id,
                hospitalId: user.id, // SENDER ID
                ...form
            });
            setFeedback({ type: 'success', message: 'Dispatch Logged Successfully!' });
            setPendingDispatches(prev => prev.filter(p => p.id !== selectedReq.id));
            setSelectedReq(null);
            setForm({ dispatchDate: '', transportMode: '', dispatchedBy: '', trackingId: '' });
        } catch (error) {
            setFeedback({ type: 'error', message: 'Failed to log dispatch.' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            {feedback && (
                <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border bg-white ${feedback.type === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'}`}>
                    {feedback.type === 'success' ? <CheckCircle className="text-emerald-500" size={20} /> : <AlertTriangle className="text-rose-500" size={20} />}
                    <span className="font-semibold text-sm">{feedback.message}</span>
                </div>
            )}

            <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Truck className="text-rose-600" size={32} /> Blood Dispatch
                </h1>
                <p className="text-slate-500 font-medium ml-11">Manage logistics and shipment of blood units.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* List of Pending Dispatches */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Pending Dispatches</h3>
                    {pendingDispatches.map(req => (
                        <div
                            key={req.id}
                            onClick={() => setSelectedReq(req)}
                            className={`p-5 rounded-xl border cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${selectedReq?.id === req.id ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-500' : 'bg-white border-slate-100 hover:border-rose-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900">{req.hospital}</h4>
                                    <span className="text-xs font-semibold text-slate-500">Req ID: #{req.id || req._id}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-sm font-bold border border-rose-200">{req.bloodGroup}</span>
                                    <div className="mt-2 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{req.units} Units</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {pendingDispatches.length === 0 && (
                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <Truck className="mx-auto text-slate-300 mb-3" size={32} />
                            <p className="text-slate-500 font-semibold text-sm">No pending dispatches</p>
                        </div>
                    )}
                </div>

                {/* Dispatch Form */}
                <div>
                    <div className={`bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 transition-opacity ${!selectedReq ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Package className="text-rose-600" size={24} /> Dispatch Details
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Dispatch Date & Time</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input type="datetime-local" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                                        value={form.dispatchDate} onChange={e => setForm({ ...form, dispatchDate: e.target.value })} required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Mode of Transport</label>
                                <CustomSelect
                                    options={['Hospital Ambulance', 'Courier Service', 'Air Lift', 'Cold Chain Transport']}
                                    value={form.transportMode}
                                    onChange={v => setForm({ ...form, transportMode: v })}
                                    placeholder="Select Mode" icon={Truck} required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Dispatched By</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                                        placeholder="Staff Name / ID"
                                        value={form.dispatchedBy} onChange={e => setForm({ ...form, dispatchedBy: e.target.value })} required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tracking / Vehicle Number</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                                        placeholder="e.g. TN-01-AB-1234"
                                        value={form.trackingId} onChange={e => setForm({ ...form, trackingId: e.target.value })} required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 mt-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 text-sm">
                                <CheckCircle size={18} /> Confirm Dispatch
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodDispatch;
