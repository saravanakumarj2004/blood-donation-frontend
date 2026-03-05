import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';

const HospitalAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchAppointments = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const data = await hospitalAPI.getAppointments(user.id);
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
            setError("Failed to load appointments. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user?.id]);

    const handleStatusUpdate = async (id, status, donorId, reason = null) => {
        try {
            await hospitalAPI.updateAppointment({
                id,
                status,
                reason,
                hospitalId: user.id
            });
            fetchAppointments();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update status.");
        }
    };

    const handleRejectClick = (id) => {
        setRejectingId(id);
        setRejectionReason('');
    };

    const confirmReject = (apt) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        handleStatusUpdate(apt.id, 'Rejected', apt.donorId, rejectionReason);
        setRejectingId(null);
        setRejectionReason('');
    };

    const cancelReject = () => {
        setRejectingId(null);
        setRejectionReason('');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Calendar className="text-blue-600" size={32} />
                    Manage Appointments
                </h2>
                <p className="text-slate-500 font-medium ml-11">View and process upcoming donor appointments.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center text-slate-500 animate-pulse font-medium">Loading appointments...</div>
                ) : error ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-rose-500">
                        <XCircle size={40} className="mb-4" />
                        <h3 className="text-xl font-bold">{error}</h3>
                        <button onClick={fetchAppointments} className="mt-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg font-semibold hover:bg-rose-100 transition-colors">Retry</button>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-dashed border-slate-300">
                            <Calendar size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Found</h3>
                        <p className="text-slate-500 font-medium">No donors have scheduled visits yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Donor Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">
                                                    {new Date(apt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                                    <Clock size={14} className="text-blue-500" />
                                                    {apt.time ? new Date(`2000-01-01T${apt.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                                    <User size={18} />
                                                </div>
                                                <span className="font-bold text-slate-900">{apt.donorName || 'Donor'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-700">{apt.reason}</span>
                                            <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                                                {apt.units || 1} Units
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    apt.status === 'Cancelled' || apt.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {rejectingId === apt.id ? (
                                                <div className="flex items-center justify-end gap-2 animate-fade-in-up">
                                                    <input
                                                        type="text"
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="Reason..."
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all w-48"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => confirmReject(apt)} className="p-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button onClick={cancelReject} className="p-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    {(apt.status === 'Scheduled' || apt.status === 'Pending') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'Accepted', apt.donorId)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-lg hover:bg-emerald-100 transition-colors"
                                                            >
                                                                <CheckCircle size={14} /> Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClick(apt.id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg hover:bg-rose-100 transition-colors"
                                                            >
                                                                <XCircle size={14} /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {apt.status === 'Accepted' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'Completed', apt.donorId)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                                                            >
                                                                <CheckCircle size={14} /> Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'Cancelled', apt.donorId)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors"
                                                            >
                                                                <XCircle size={14} /> Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalAppointments;
