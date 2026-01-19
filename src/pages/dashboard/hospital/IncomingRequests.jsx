import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Inbox, CheckCircle, XCircle, Clock, Baby, AlertCircle, MapPin, Trash2 } from 'lucide-react';

/**
 * IncomingRequests
 * 
 * Displays requests where responderId === current user.
 * Allows Accept/Reject actions which update localStorage.
 */
const IncomingRequests = () => {
    const { user } = useAuth();
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

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative">
            {/* ... Background and Header ... */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-40 right-40 w-[300px] h-[300px] bg-purple-100/50 rounded-full blur-[80px]" />
                <div className="absolute bottom-40 left-20 w-[300px] h-[300px] bg-blue-100/50 rounded-full blur-[80px]" />
            </div>

            <div className="backdrop-blur-md bg-white/40 p-8 rounded-[2.5rem] border border-white/60 shadow-lg shadow-neutral-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <Inbox className="text-primary" size={32} /> Incoming Requests
                    </h2>
                    <p className="text-neutral-500 font-medium mt-2 ml-11">Review and manage blood transfer requests.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-neutral-400 font-medium animate-pulse">Loading active requests...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6 shadow-iner">
                        <Inbox size={40} className="text-neutral-300" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800">No Incoming Requests</h3>
                    <p className="text-neutral-400 mt-2 font-medium max-w-xs mx-auto">You're all caught up! No other hospitals are currently requesting stock from you.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* 1. OUTGOING BROADCASTS (Sent to Donors) */}
                    {getMyBroadcasts().length > 0 && (
                        <div>
                            <h3 className="text-xl font-black text-neutral-800 mb-6 flex items-center gap-2">
                                <span className="p-2 bg-blue-50 rounded-lg text-blue-600">📢</span>
                                My Outgoing Requests
                            </h3>
                            <div className="grid gap-6">
                                {getMyBroadcasts().map(req => (
                                    <div key={req.id} className="bg-gradient-to-r from-blue-50/50 to-white backdrop-blur-xl p-8 rounded-[2rem] border border-blue-100 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-blue-100/50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                                {req.bloodGroup}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                                                    To: {req.cities ? req.cities.join(', ') : req.city}
                                                    <span className="text-xs font-bold px-2 py-1 bg-neutral-100 text-neutral-500 rounded-md uppercase">{req.urgency}</span>
                                                </h4>

                                                {/* Donor Acceptance Status */}
                                                {req.acceptedBy ? (
                                                    <div className="mt-2 flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit animate-pulse">
                                                        <CheckCircle size={16} /> Accepted by {req.donorName || 'Responder'}
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 flex items-center gap-2 text-neutral-400 font-medium text-sm">
                                                        <Clock size={16} /> Waiting for response...
                                                    </div>
                                                )}

                                                <div className="text-sm text-neutral-400 mt-1 font-mono">
                                                    {req.units} Units • {new Date(req.date).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            {req.status === 'Accepted' && req.acceptedBy ? (
                                                <button
                                                    onClick={() => triggerConfirm(req.id, 'Completed')}
                                                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:scale-105 transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle size={18} /> Confirm Receipt/Donation
                                                </button>
                                            ) : req.status === 'Completed' ? (
                                                <span className="px-4 py-2 bg-neutral-100 text-neutral-400 font-bold rounded-lg cursor-not-allowed">Completed</span>
                                            ) : (
                                                <span className="px-4 py-2 border border-blue-200 text-blue-400 font-bold rounded-xl bg-blue-50/50">
                                                    Active
                                                </span>
                                            )}

                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                className="p-3 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Delete Broadcast"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. INCOMING REQUESTS (From other Hospitals) */}
                    {getIncomingRequests().length > 0 && (
                        <div>
                            <h3 className="text-xl font-black text-neutral-800 mb-6 flex items-center gap-2">
                                <span className="p-2 bg-purple-50 rounded-lg text-purple-600">📥</span>
                                Incoming Requests
                            </h3>
                            <div className="space-y-6">
                                {getIncomingRequests().map(req => (
                                    <div key={req.id} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-lg shadow-neutral-100/50 flex flex-col gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                            <div className="flex items-center gap-6 w-full md:w-auto">
                                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:rotate-6 transition-transform duration-300 ${req.type === 'EMERGENCY_ALERT' ? 'bg-gradient-to-br from-red-50 to-red-100 text-error shadow-red-200' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-blue-200'
                                                    }`}>
                                                    {req.bloodGroup}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-black text-xl text-neutral-900">{req.hospitalName}</h4>
                                                        {req.type === 'EMERGENCY_ALERT' && (
                                                            <span className="flex items-center gap-1 text-[10px] font-black text-white bg-error px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                                                                <AlertCircle size={10} /> Emergency
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 font-bold">
                                                        <span className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-lg">
                                                            <Baby size={16} className="text-primary fill-primary/20" /> <span className="text-neutral-700">{req.units} Units</span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-lg">
                                                            <Clock size={16} className="text-neutral-400" /> {req.time || new Date(req.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs font-semibold text-neutral-400 mt-3 flex items-center gap-1.5 ml-1">
                                                        <MapPin size={12} /> {req.location || 'Location Pending'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                                {/* ACTIVE / PENDING STATE */}
                                                {(req.status === 'Active' || req.status === 'Pending') && answeringId !== req.id && (
                                                    <>
                                                        <button
                                                            onClick={() => setAnsweringId(req.id)}
                                                            className="w-full sm:w-auto px-6 py-3 bg-white text-neutral-600 font-bold rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-all shadow-sm"
                                                        >
                                                            Respond
                                                        </button>
                                                    </>
                                                )}

                                                {/* ANSWERING STATE */}
                                                {answeringId === req.id && (
                                                    <div className="flex flex-col gap-3 w-full animate-fade-in">
                                                        <textarea
                                                            autoFocus
                                                            placeholder="Add a message..."
                                                            className="w-full p-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                            value={replyMessage}
                                                            onChange={e => setReplyMessage(e.target.value)}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setAnsweringId(null)}
                                                                className="px-4 py-2 text-neutral-400 hover:text-neutral-600 font-bold text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => triggerConfirm(req.id, 'Rejected', replyMessage)}
                                                                className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 text-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => triggerConfirm(req.id, 'Accepted', replyMessage)}
                                                                className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 text-sm"
                                                            >
                                                                Accept & Send
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ACCEPTED STATE */}
                                                {req.status === 'Accepted' && (
                                                    <div className="flex flex-col items-end gap-3 w-full">
                                                        <div className="px-5 py-2 bg-emerald-50 text-emerald-700 text-sm font-black uppercase tracking-wide rounded-xl flex items-center gap-2 border border-emerald-100">
                                                            <CheckCircle size={16} className="fill-emerald-200" /> Accepted
                                                        </div>
                                                        <button
                                                            onClick={() => triggerConfirm(req.id, 'Completed')}
                                                            className="w-full px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Inbox size={20} /> Confirm Delivery
                                                        </button>
                                                    </div>
                                                )}

                                                {/* COMPLETED/REJECTED STATE */}
                                                {(req.status === 'Completed' || req.status === 'Rejected') && (
                                                    <span className={`px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 uppercase tracking-wide shadow-sm ${req.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-error border border-red-100'
                                                        }`}>
                                                        {req.status === 'Completed' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                                        {req.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Confirmation Dialog */}
            {confirmAction && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-black text-neutral-900 mb-2">Are you sure?</h3>
                        <p className="text-neutral-500 font-medium mb-6">
                            {confirmAction.status === 'Completed' ? 'Confirming delivery will update stock levels permanently.' :
                                confirmAction.status === 'Accepted' ? 'This will notify the requesting hospital that you are sending help.' :
                                    confirmAction.status === 'Delete' ? 'Are you sure you want to delete this broadcast? This cannot be undone.' :
                                        'This action cannot be undone.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-3 text-neutral-600 font-bold hover:bg-neutral-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95
                                    ${confirmAction.status === 'Rejected' || confirmAction.status === 'Delete' ? 'bg-error shadow-red-200' : 'bg-primary shadow-primary/20'}`}
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
                    <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' :
                        feedback.type === 'error' ? 'bg-white border-red-100 text-red-800' :
                            'bg-white border-blue-100 text-blue-800'
                        }`}>
                        {feedback.type === 'success' ? <CheckCircle className="text-emerald-500" size={24} /> :
                            feedback.type === 'error' ? <XCircle className="text-red-500" size={24} /> :
                                <Inbox className="text-blue-500" size={24} />}
                        <span className="font-bold">{feedback.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomingRequests;
