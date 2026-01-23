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
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-black text-neutral-900 flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Calendar size={32} />
                    </div>
                    Manage Appointments
                </h2>
                <p className="text-neutral-500 mt-2 text-lg font-medium ml-1">View and process upcoming donor appointments.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center text-neutral-500 animate-pulse font-medium">Loading appointments...</div>
                ) : error ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-red-500">
                        <XCircle size={40} className="mb-4" />
                        <h3 className="text-xl font-bold">{error}</h3>
                        <button onClick={fetchAppointments} className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">Retry</button>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-neutral-200">
                            <Calendar size={40} className="text-neutral-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">No Appointments Found</h3>
                        <p className="text-neutral-400 font-medium">No donors have scheduled visits yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50/50 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-8 py-6">Date & Time</th>
                                    <th className="px-8 py-6">Donor Name</th>
                                    <th className="px-8 py-6">Type</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100/50">
                                {appointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-neutral-900 text-lg">
                                                    {new Date(apt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-sm text-neutral-500 font-medium flex items-center gap-1.5 mt-1">
                                                    <Clock size={14} className="text-primary/60" />
                                                    {apt.time ? new Date(`2000-01-01T${apt.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
                                                    <User size={18} />
                                                </div>
                                                <span className="font-bold text-neutral-700">{apt.donorName || 'Donor'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-medium text-neutral-600">{apt.reason}</span>
                                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/5 text-primary rounded-md text-xs font-bold">
                                                {apt.units || 1} Units
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-sm ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100' :
                                                apt.status === 'Cancelled' || apt.status === 'Rejected' ? 'bg-red-50 text-error border-red-100 shadow-red-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {rejectingId === apt.id ? (
                                                <div className="flex items-center justify-end gap-2 animate-fade-in-up">
                                                    <input
                                                        type="text"
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="Reason..."
                                                        className="px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all w-48"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => confirmReject(apt)} className="p-2 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button onClick={cancelReject} className="p-2 bg-neutral-100 text-neutral-500 rounded-xl hover:bg-neutral-200 transition-colors">
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-x-2">
                                                    {(apt.status === 'Scheduled' || apt.status === 'Pending') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'Accepted', apt.donorId)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 hover:scale-105 transition-all"
                                                            >
                                                                <CheckCircle size={16} /> Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClick(apt.id)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-error font-bold text-xs rounded-xl hover:bg-red-100 hover:scale-105 transition-all"
                                                            >
                                                                <XCircle size={16} /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {apt.status === 'Accepted' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'Completed', apt.donorId)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 hover:scale-105 transition-all"
                                                            >
                                                                <CheckCircle size={16} /> Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'Cancelled', apt.donorId)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 text-neutral-600 font-bold text-xs rounded-xl hover:bg-neutral-200 hover:scale-105 transition-all"
                                                            >
                                                                <XCircle size={16} /> Cancel
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
        </div >
    );
};

export default HospitalAppointments;
