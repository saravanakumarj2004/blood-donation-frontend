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
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {feedback && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    <span className="font-bold">{feedback.message}</span>
                </div>
            )}

            <div className="flex flex-col gap-4 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
                    <span className="text-4xl">🚚</span> Blood Transfer / Dispatch
                </h1>
                <p className="text-neutral-500 font-medium ml-12">Manage logistics and shipment of blood units.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* List of Pending Dispatches */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-neutral-800">Pending Dispatches</h3>
                    {pendingDispatches.map(req => (
                        <div
                            key={req.id}
                            onClick={() => setSelectedReq(req)}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all ${selectedReq?.id === req.id ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-neutral-100 hover:border-blue-200'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-neutral-900">{req.hospital}</h4>
                                    <span className="text-sm font-bold text-neutral-400">Req ID: #{req.id}</span>
                                </div>
                                <div className="text-right">
                                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-black border border-red-100">{req.bloodGroup}</span>
                                    <div className="mt-1 text-sm font-bold text-neutral-600">{req.units} Units</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {pendingDispatches.length === 0 && <div className="p-8 text-center text-neutral-400 bg-white/50 rounded-2xl border border-dashed border-neutral-200">No pending dispatches</div>}
                </div>

                {/* Dispatch Form */}
                <div>
                    <div className={`bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/60 ${!selectedReq ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="text-xl font-bold text-neutral-900 mb-6">Dispatch Details</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Dispatch Date & Time</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                    <input type="datetime-local" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50/50 border border-neutral-200 font-bold outline-none"
                                        value={form.dispatchDate} onChange={e => setForm({ ...form, dispatchDate: e.target.value })} required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Mode of Transport</label>
                                <CustomSelect
                                    options={['Hospital Ambulance', 'Courier Service', 'Air Lift', 'Cold Chain Transport']}
                                    value={form.transportMode}
                                    onChange={v => setForm({ ...form, transportMode: v })}
                                    placeholder="Select Mode" icon={Truck} required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Dispatched By</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                    <input type="text" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50/50 border border-neutral-200 font-bold outline-none"
                                        placeholder="Staff Name / ID"
                                        value={form.dispatchedBy} onChange={e => setForm({ ...form, dispatchedBy: e.target.value })} required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Tracking / Vehicle Number</label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                    <input type="text" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50/50 border border-neutral-200 font-bold outline-none"
                                        placeholder="e.g. TN-01-AB-1234"
                                        value={form.trackingId} onChange={e => setForm({ ...form, trackingId: e.target.value })} required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 mt-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                <CheckCircle size={20} /> Confirm Dispatch
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodDispatch;
