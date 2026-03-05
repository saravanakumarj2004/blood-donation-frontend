import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Inbox, CheckCircle, XCircle, Clock, Baby, AlertCircle, MapPin, Trash2, Truck } from 'lucide-react';

/**
 * IncomingRequests
 * 
 * Displays requests where responderId === current user.
 * Allows Accept/Reject actions which update localStorage.
 */
const IncomingRequests = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [answeringId, setAnsweringId] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');

    const fetchRequests = async () => {
        if (!user?.id) return;
        try {
            const data = await hospitalAPI.getRequests(user.id);
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch incoming requests", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getIncomingRequests = () => requests.filter(r => !r.isOutgoing);
    const getMyBroadcasts = () => requests.filter(r => r.isOutgoing);

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const [confirmAction, setConfirmAction] = useState(null); // { id, status, message }
    const [feedback, setFeedback] = useState(null); // { type, message }

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const triggerConfirm = (reqId, status, message = null) => {
        setConfirmAction({ reqId, status, message });
    };

    const handleDelete = (reqId) => {
        triggerConfirm(reqId, 'Delete');
    };

    const handleAction = async () => {
        if (!confirmAction) return;
        const { reqId, status, message } = confirmAction;

        try {
            setIsLoading(true);

            if (status === 'Delete') {
                await hospitalAPI.deleteRequest(reqId);
                setRequests(prev => prev.filter(r => r.id !== reqId));
                showFeedback('success', "Broadcast deleted successfully.");
            } else {
                await hospitalAPI.updateRequestStatus({
                    id: reqId,
                    status: status,
                    hospitalId: user.id, // I am the one accepting/rejecting
                    responseMessage: message
                });
                // Optimistic Update
                setRequests(prev => prev.map(req =>
                    req.id === reqId ? { ...req, status: status, responseMessage: message } : req
                ));
            }

            // Cleanup state
            setAnsweringId(null);
            setReplyMessage('');
            setConfirmAction(null);
            fetchRequests(); // Refresh to be sure

            if (status === 'Completed') showFeedback('success', "Receipt/Donation confirmed successfully!");
            else if (status === 'Accepted') showFeedback('success', "Request accepted!");
            else if (status === 'Rejected') showFeedback('info', "Request rejected.");

        } catch (error) {
            console.error("Action failed", error);
            showFeedback('error', "Failed to update status");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper for safe date parsing (Handles Naive ISO from Backend)
    const safeDate = (dateStr) => {
        if (!dateStr) return new Date();
        // If it looks like ISO but has no timezone, assume UTC ('Z') for browser compatibility
        const cleanStr = (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+'))
            ? dateStr + 'Z'
            : dateStr;
        return new Date(cleanStr);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Inbox className="text-rose-600" size={32} /> Incoming Requests
                </h1>
                <p className="text-slate-500 font-medium ml-11">Review and manage blood transfer requests.</p>
            </div>

            {/* TABS */}
            <div className="flex gap-6 border-b border-slate-100 px-2 mt-4">
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`pb-4 px-2 font-semibold transition-all flex items-center gap-2 ${activeTab === 'incoming'
                        ? 'border-b-2 border-rose-600 text-rose-700'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Inbox size={18} /> Incoming Requests (To You)
                </button>
                <button
                    onClick={() => setActiveTab('outgoing')}
                    className={`pb-4 px-2 font-semibold transition-all flex items-center gap-2 ${activeTab === 'outgoing'
                        ? 'border-b-2 border-rose-600 text-rose-700'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <AlertCircle size={18} /> My Sent Requests
                </button>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-slate-400 font-semibold animate-pulse">Loading active requests...</div>
            ) : (
                <div className="space-y-6 mt-6">
                    {/* TAB: MY SENT REQUESTS (Outgoing) */}
                    {activeTab === 'outgoing' && (
                        <div>
                            {getMyBroadcasts().length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                        <Inbox size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">No Sent Requests</h3>
                                    <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">You haven't sent any blood requests recently.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {getMyBroadcasts().map(req => (
                                        <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
                                            <div className="flex items-center gap-6 w-full md:w-auto">
                                                <div className="w-16 h-16 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl flex items-center justify-center font-bold text-xl">
                                                    {req.bloodGroup}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                        To: {req.cities ? req.cities.join(', ') : req.city}
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">{req.urgency}</span>
                                                    </h4>

                                                    {/* Donor Acceptance Status */}
                                                    {req.acceptedBy ? (
                                                        <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
                                                            <CheckCircle size={14} /> Accepted by {req.donorName || 'Responder'}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-500 font-semibold">
                                                            <Clock size={14} /> Waiting for response...
                                                        </div>
                                                    )}

                                                    <div className="text-xs text-slate-500 mt-2 font-semibold flex items-center gap-2">
                                                        <span>{req.units} Units</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span>{safeDate(req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                {(req.status === 'Accepted' || req.status === 'Dispatched') && req.acceptedBy ? (
                                                    <button
                                                        onClick={() => triggerConfirm(req.id, 'Completed')}
                                                        className={`flex-1 md:flex-none px-6 py-2.5 text-white font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex items-center justify-center gap-2 ${req.status === 'Dispatched'
                                                            ? 'bg-indigo-600 hover:bg-indigo-700'
                                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                                            }`}
                                                    >
                                                        <CheckCircle size={16} />
                                                        {req.status === 'Dispatched' ? 'Confirm Receipt' : 'Confirm Donation'}
                                                    </button>
                                                ) : req.status === 'Completed' ? (
                                                    <span className="px-4 py-2 bg-slate-50 text-slate-400 font-bold rounded-lg border border-slate-100 cursor-not-allowed text-sm">Completed</span>
                                                ) : (
                                                    <span className="px-3 py-1.5 border border-rose-200 text-rose-700 font-bold rounded-lg bg-rose-50 text-xs uppercase tracking-wider">
                                                        Active
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="p-2.5 text-slate-400 border border-slate-100 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                                    title="Delete Broadcast"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: INCOMING REQUESTS (From others) */}
                    {activeTab === 'incoming' && (
                        <div>
                            {getIncomingRequests().length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                        <Inbox size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">No Incoming Requests</h3>
                                    <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">You're all caught up! No requests requiring your attention.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {getIncomingRequests().map(req => (
                                        <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow items-start md:items-center justify-between">
                                            <div className="flex items-center gap-6 w-full md:w-auto">
                                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl border ${req.type === 'EMERGENCY_ALERT' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                                                    }`}>
                                                    {req.bloodGroup}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <h4 className="font-bold text-slate-900">{req.hospitalName}</h4>
                                                        {req.type === 'EMERGENCY_ALERT' && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                <AlertCircle size={10} /> Emergency
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mb-2">
                                                        <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                                                            <Baby size={14} className="text-slate-400" /> <span className="text-slate-700">{req.units} Units</span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                                                            <Clock size={14} className="text-slate-400" /> {req.time || safeDate(req.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                                        <MapPin size={12} className="text-slate-400" /> {req.location || 'Location Pending'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                                {/* ACTIVE / PENDING STATE */}
                                                {(req.status === 'Active' || req.status === 'Pending') && answeringId !== req.id && (
                                                    <>
                                                        <button
                                                            onClick={() => setAnsweringId(req.id)}
                                                            className="w-full sm:w-auto px-6 py-2.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                                        >
                                                            Respond
                                                        </button>
                                                    </>
                                                )}

                                                {/* ANSWERING STATE */}
                                                {answeringId === req.id && (
                                                    <div className="flex flex-col gap-3 w-full sm:w-64 animate-fade-in bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <textarea
                                                            autoFocus
                                                            placeholder="Add a message..."
                                                            className="w-full p-2.5 rounded-lg border border-slate-100 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none h-20"
                                                            value={replyMessage}
                                                            onChange={e => setReplyMessage(e.target.value)}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setAnsweringId(null)}
                                                                className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 font-semibold text-xs rounded-md transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => triggerConfirm(req.id, 'Rejected', replyMessage)}
                                                                className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-md text-xs shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => triggerConfirm(req.id, 'Accepted', replyMessage)}
                                                                className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-md hover:from-rose-600 hover:to-rose-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-xs transition-colors"
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ACCEPTED STATE -> DISPATCH ACTION */}
                                                {req.status === 'Accepted' && (
                                                    <div className="flex flex-col items-end gap-2 w-full">
                                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5">
                                                            <CheckCircle size={12} /> Accepted
                                                        </div>
                                                        <button
                                                            onClick={() => navigate('/dashboard/hospital/dispatch')}
                                                            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <Truck size={16} /> Dispatch Now
                                                        </button>
                                                    </div>
                                                )}

                                                {/* DISPATCHED STATE -> WAITING */}
                                                {req.status === 'Dispatched' && (
                                                    <div className="flex flex-col items-end gap-2 w-full">
                                                        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5">
                                                            <Truck size={12} /> Dispatched
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-slate-500">Waiting for receiver confirmation</span>
                                                    </div>
                                                )}

                                                {/* COMPLETED/REJECTED STATE */}
                                                {(req.status === 'Completed' || req.status === 'Rejected') && (
                                                    <span className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider border shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${req.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}>
                                                        {req.status === 'Completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                        {req.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {/* Confirmation Dialog */}
            {confirmAction && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 animate-scale-in">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Are you sure?</h3>
                        <p className="text-slate-500 font-medium text-sm mb-6">
                            {confirmAction.status === 'Completed' ? 'Confirming delivery will update stock levels permanently.' :
                                confirmAction.status === 'Accepted' ? 'This will notify the requesting hospital that you are sending help.' :
                                    confirmAction.status === 'Delete' ? 'Are you sure you want to delete this broadcast? This cannot be undone.' :
                                        'This action cannot be undone.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-2.5 text-slate-600 bg-white border border-slate-100 font-semibold hover:bg-slate-50 rounded-lg transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                className={`flex-1 py-2.5 text-white font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm transition-colors
                                    ${confirmAction.status === 'Rejected' || confirmAction.status === 'Delete' ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700' : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'}`}
                            >
                                {confirmAction.status === 'Delete' ? 'Delete' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Toast */}
            {feedback && (
                <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
                    <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border bg-white ${feedback.type === 'success' ? 'border-emerald-200 text-emerald-800' :
                        feedback.type === 'error' ? 'border-rose-200 text-rose-800' :
                            'border-rose-200 text-rose-800'
                        }`}>
                        {feedback.type === 'success' ? <CheckCircle className="text-emerald-500" size={20} /> :
                            feedback.type === 'error' ? <XCircle className="text-rose-500" size={20} /> :
                                <Inbox className="text-rose-500" size={20} />}
                        <span className="font-semibold text-sm">{feedback.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomingRequests;
