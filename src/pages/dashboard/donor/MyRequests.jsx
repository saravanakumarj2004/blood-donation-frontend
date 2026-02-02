import React, { useState, useEffect } from 'react';
import { donorAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { Clock, MapPin, User, CheckCircle, Phone, Navigation, AlertTriangle, Truck } from 'lucide-react';

const MyRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;
            try {
                const data = await donorAPI.getMyRequests(user.id);
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch my requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
            case 'Dispatched': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Expired': return 'bg-neutral-100 text-neutral-500 border-neutral-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const [showConfirmModal, setShowConfirmModal] = useState(null); // stores reqId
    const [showCancelModal, setShowCancelModal] = useState(null); // stores reqId to cancel
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message: '' }

    const handleConfirmClick = (reqId) => {
        setShowConfirmModal(reqId);
    };

    const handleConfirmAction = async () => {
        if (!showConfirmModal) return;
        const reqId = showConfirmModal;
        setProcessingId(reqId);
        setShowConfirmModal(null);

        try {
            await donorAPI.completeRequest(reqId);
            // Refresh list
            const data = await donorAPI.getMyRequests(user.id);
            setRequests(data);
            setToast({ type: 'success', message: 'Donation verified successfully! History updated.' });
        } catch (e) {
            console.error("Failed to complete", e);
            const errorMsg = e.response?.data?.error || e.message || "Unknown Error";
            setToast({ type: 'error', message: `Failed: ${errorMsg}` });
        } finally {
            setProcessingId(null);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleCancelClick = (reqId) => {
        setShowCancelModal(reqId);
    };

    const handleCancelAction = async () => {
        if (!showCancelModal) return;
        const reqId = showCancelModal;
        setProcessingId(reqId);
        setShowCancelModal(null);

        try {
            await donorAPI.cancelRequest(reqId, user.id);
            setToast({ type: 'success', message: 'Request cancelled successfully.' });
            // Refresh list
            const data = await donorAPI.getMyRequests(user.id);
            setRequests(data);
        } catch (e) {
            console.error("Failed to cancel", e);
            const errorMsg = e.response?.data?.msg || e.message || "Unknown Error";
            setToast({ type: 'error', message: `Failed: ${errorMsg}` });
        } finally {
            setProcessingId(null);
            setTimeout(() => setToast(null), 3000);
        }
    };


    // Helper for safe date parsing
    const safeDate = (dateStr) => {
        if (!dateStr) return new Date();
        const cleanStr = (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+'))
            ? dateStr + 'Z'
            : dateStr;
        return new Date(cleanStr);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={32} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-neutral-900">Confirm Donation?</h3>
                            <p className="text-neutral-500 font-medium mt-2">
                                Please confirm that you have received the blood units from the donor. This will update the donor's history and verification stats.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                className="py-3 font-bold text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-105 transition-all"
                            >
                                Yes, Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Cancellation Modal */}
            {
                showCancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-neutral-900">Cancel Request?</h3>
                                <p className="text-neutral-500 font-medium mt-2">
                                    Are you sure you want to cancel this request? If a donor was already notified or on the way, they will be alerted.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowCancelModal(null)}
                                    className="py-3 font-bold text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors"
                                >
                                    Keep It
                                </button>
                                <button
                                    onClick={handleCancelAction}
                                    className="py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-105 transition-all"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 flex items-center gap-3">
                        <span className="text-4xl">📋</span> My Requests
                    </h1>
                    <p className="text-neutral-500 font-medium ml-12">Track status of your blood requests.</p>
                </div>
                <button
                    onClick={() => { setLoading(true); const fetchRequests = async () => { try { const data = await donorAPI.getMyRequests(user.id); setRequests(data); } catch (e) { console.error(e); } finally { setLoading(false); } }; fetchRequests(); }}
                    className="p-3 bg-white text-neutral-600 rounded-xl shadow-sm hover:shadow-md hover:text-red-600 transition-all"
                    title="Refresh Status"
                >
                    <Clock size={24} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {
                loading ? (
                    <div className="text-center py-20 text-neutral-400 font-bold">Loading your requests...</div>
                ) : (
                    <div className="grid gap-6">
                        {requests.length === 0 ? (
                            <div className="p-12 text-center bg-white/60 rounded-[2rem] border-2 border-dashed border-neutral-200">
                                <p className="text-neutral-500 font-bold text-lg">No requests made yet.</p>
                                <button className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors">
                                    Create New Request
                                </button>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/60 flex flex-col gap-6 relative overflow-hidden">
                                    {(req.status === 'Accepted' || req.status === 'Dispatched') && (
                                        <div className={`absolute top-0 right-0 p-4 rounded-bl-[2rem] font-bold flex items-center gap-2 ${req.status === 'Dispatched' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-green-500/10 text-green-600'
                                            }`}>
                                            {req.status === 'Dispatched' ? <><Truck size={20} /> On the Way!</> : <><CheckCircle size={20} /> Request Accepted!</>}
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex flex-col items-center justify-center shrink-0 border border-red-100 shadow-inner">
                                            <span className="text-2xl font-black">{req.bloodGroup}</span>
                                            <span className="text-xs font-bold uppercase">{req.units} Units</span>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(req.status)}`}>
                                                    {req.status}
                                                </span>
                                                <span className="text-neutral-400 text-sm font-medium flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {(() => {
                                                        try {
                                                            const d = safeDate(req.createdAt || req.date);
                                                            if (isNaN(d.getTime())) return "Check Details";
                                                            const now = new Date();
                                                            const isToday = d.toDateString() === now.toDateString();
                                                            return isToday
                                                                ? `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                                : d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                                        } catch (e) { return "Recent"; }
                                                    })()}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-black text-neutral-900">{req.hospitalName}</h3>
                                                <p className="text-neutral-500 font-medium flex items-center gap-1">
                                                    <MapPin size={16} /> {req.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Donor Tracking Stats for Active/Rejected Requests */}
                                    {(req.status === 'Active' || req.status === 'Rejected') && (
                                        <div className="mt-4 p-5 bg-gradient-to-br from-neutral-50 to-white rounded-2xl border border-neutral-200 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <User size={16} className="text-neutral-600" />
                                                <h4 className="font-bold text-neutral-700 text-sm uppercase tracking-wide">Donor Tracking</h4>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-black text-sm">{req.notifiedDonorCount || 0}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-blue-600 uppercase">Notified</p>
                                                </div>
                                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                                                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                                                        <span className="text-red-600 font-black text-sm">{req.rejectedCount || 0}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-red-600 uppercase">Rejected</p>
                                                </div>
                                                <div className={`p-4 rounded-xl border text-center ${req.status === 'Active' ? 'bg-yellow-50 border-yellow-100' : 'bg-neutral-50 border-neutral-200'
                                                    }`}>
                                                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${req.status === 'Active' ? 'bg-yellow-100' : 'bg-neutral-100'
                                                        }`}>
                                                        {req.status === 'Active' ? (
                                                            <Clock size={14} className="text-yellow-600" />
                                                        ) : (
                                                            <AlertTriangle size={14} className="text-neutral-500" />
                                                        )}
                                                    </div>
                                                    <p className={`text-xs font-bold uppercase ${req.status === 'Active' ? 'text-yellow-600' : 'text-neutral-500'
                                                        }`}>{req.status}</p>
                                                </div>
                                            </div>
                                            {req.status === 'Rejected' && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                                                    <AlertTriangle size={16} className="text-red-600 shrink-0" />
                                                    <p className="text-xs text-red-700 font-medium">
                                                        All notified donors were unable to help at this time. Consider creating a new request or contacting hospitals directly.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                            )}

                        {/* Cancel Button for Active/Pending/Accepted */}
                        {(req.status === 'Active' || req.status === 'Pending' || req.status === 'Accepted') && (
                            <div className="mt-4 pt-4 border-t border-dashed border-neutral-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelClick(req.id);
                                    }}
                                    disabled={processingId === req.id}
                                    className="w-full py-3 text-red-500 font-bold border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    {processingId === req.id ? <Clock size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                                    Cancel Request
                                </button>
                            </div>
                        )}

                        {/* Acceptance Details Section */}
                        {(req.status === 'Accepted' || req.status === 'Dispatched') && (req.acceptedDonorName || req.responderName) && (
                            <div className="mt-4 p-6 bg-green-50 rounded-2xl border border-green-100 space-y-4 animate-scale-in">
                                <h4 className="font-bold text-green-800 flex items-center gap-2">
                                    <User size={20} /> Donor Details (Coming to Help)
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase">Name</p>
                                            <p className="font-bold text-neutral-800">{req.acceptedDonorName || req.responderName || 'Unknown Donor'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase">Phone</p>
                                            <p className="font-bold text-neutral-800">{req.acceptedDonorPhone || req.responderPhone || 'Hidden'}</p>
                                        </div>
                                    </div>

                                    {(req.acceptedDonorLocation || req.responderLocation) && (
                                        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <Navigation size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-neutral-400 uppercase">Live Location</p>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${req.acceptedDonorLocation || req.responderLocation}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-bold text-blue-600 hover:underline break-all"
                                                >
                                                    Open in Maps ({req.acceptedDonorLocation || req.responderLocation})
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dispatch Note */}
                                    {req.status === 'Dispatched' && (
                                        <div className="md:col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
                                            <Truck className="text-indigo-600" />
                                            <div>
                                                <p className="font-bold text-indigo-900">Vehicle Dispatched</p>
                                                <p className="text-xs text-indigo-700">The hospital has dispatched the units. They should arrive shortly.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="md:col-span-2 pt-2">
                                        <button
                                            disabled={processingId === req.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleConfirmClick(req.id);
                                            }}
                                            className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${processingId === req.id
                                                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none'
                                                : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700 hover:shadow-xl'
                                                }`}
                                        >
                                            {processingId === req.id ? (
                                                <><Clock size={20} className="animate-spin" /> Processing...</>
                                            ) : (
                                                <><CheckCircle size={20} /> Confirm Donation Received</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
        </div >
    );
};

export default MyRequests;
