import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Droplet, Calendar, Archive, AlertCircle, Building2, User, FileText, ArrowRightLeft, TrendingDown, X, Plus, Minus, Mail, Phone, Download } from 'lucide-react';

const BatchManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('incoming');
    const [batches, setBatches] = useState([]);
    const [outgoingBatches, setOutgoingBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [showUseUnitModal, setShowUseUnitModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [useUnitForm, setUseUnitForm] = useState({
        quantity: 1,
        patientId: '',
        referenceId: ''
    });

    const fetchBatches = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const data = await hospitalAPI.getBatches(user.id);
            setBatches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch batches", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOutgoingBatches = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const data = await hospitalAPI.getOutgoingBatches(user.id);
            setOutgoingBatches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch outgoing batches", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'incoming') {
            fetchBatches();
        } else {
            fetchOutgoingBatches();
        }
    }, [user, activeTab]);

    const openUseUnitModal = (batch) => {
        setSelectedBatch(batch);
        setUseUnitForm({
            quantity: 1,
            patientId: '',
            referenceId: '',
            ward: '',
            doctorName: '',
            issueDateTime: new Date().toISOString().slice(0, 16) // Auto-set current datetime
        });
        setShowUseUnitModal(true);
    };

    const handleUseUnitSubmit = async () => {
        if (!selectedBatch) return;

        const batchId = selectedBatch._id || selectedBatch.id;
        const { quantity, patientId, referenceId, ward, doctorName, issueDateTime } = useUnitForm;

        // Validation
        if (quantity < 1) {
            alert("Quantity must be at least 1");
            return;
        }
        if (quantity > selectedBatch.units) {
            alert(`Only ${selectedBatch.units} units available in this batch`);
            return;
        }

        try {
            const res = await hospitalAPI.useBatchUnit(
                batchId,
                user.id,
                quantity,
                patientId || null,
                referenceId || null,
                ward || null,
                doctorName || null,
                issueDateTime
            );

            setBatches(prev => prev.map(b =>
                (b._id === batchId || b.id === batchId)
                    ? { ...b, units: res.remaining }
                    : b
            ).filter(b => b.units > 0));

            setShowUseUnitModal(false);

            // Show success message with any warnings
            let message = `Successfully used ${quantity} unit(s)`;
            if (res.warning) {
                message += `\n\n⚠️ ${res.warning}`;
            }
            alert(message);

            // Refresh outgoing batches if on that tab
            if (activeTab === 'outgoing') {
                fetchOutgoingBatches();
            }
        } catch (error) {
            // Enhanced error handling
            const errorMessage = error.response?.data?.error || error.message || "Failed to use unit";

            // Check for specific error types
            if (errorMessage.includes("expired")) {
                alert(`❌ Batch Expired\n\n${errorMessage}\n\nPlease use a different batch.`);
            } else if (errorMessage.includes("Insufficient units")) {
                alert(`❌ ${errorMessage}\n\nPlease refresh the page and try again.`);
            } else if (errorMessage.includes("depleted") || errorMessage.includes("discarded")) {
                alert(`❌ ${errorMessage}\n\nThis batch is no longer available.`);
            } else {
                alert(`❌ Error: ${errorMessage}`);
            }

            // Refresh batches to get updated data
            fetchBatches();
        }
    };

    const handleDiscardUnit = async (batchId) => {
        if (!window.confirm("Are you sure you want to discard this unit? This cannot be undone.")) return;
        try {
            const res = await hospitalAPI.discardBatchUnit(batchId, user.id, 1);
            setBatches(prev => prev.map(b =>
                b._id === batchId || b.id === batchId
                    ? { ...b, units: res.remaining }
                    : b
            ).filter(b => b.units > 0));
        } catch (error) {
            alert("Failed to discard unit");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Archive className="text-rose-600" size={32} /> Batch Management
                </h1>
                <p className="text-slate-500 font-medium ml-11">Track blood batches, usage, and transfers with full traceability.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-100 px-2 mt-4">
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`pb-4 px-2 font-semibold transition-all flex items-center gap-2 ${activeTab === 'incoming'
                        ? 'border-b-2 border-rose-600 text-rose-700'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Download size={18} /> Incoming Batches
                </button>
                <button
                    onClick={() => setActiveTab('outgoing')}
                    className={`pb-4 px-2 font-semibold transition-all flex items-center gap-2 ${activeTab === 'outgoing'
                        ? 'border-b-2 border-rose-600 text-rose-700'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <ArrowRightLeft size={18} /> Outgoing Batches
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-neutral-400 font-bold">Loading batches...</div>
            ) : activeTab === 'incoming' ? (
                <IncomingBatchesView
                    batches={batches}
                    onUseUnit={openUseUnitModal}
                    onDiscardUnit={handleDiscardUnit}
                />
            ) : (
                <OutgoingBatchesView
                    batches={outgoingBatches}
                />
            )}

            {/* Use Unit Modal */}
            {showUseUnitModal && (
                <UseUnitModal
                    batch={selectedBatch}
                    form={useUnitForm}
                    setForm={setUseUnitForm}
                    onSubmit={handleUseUnitSubmit}
                    onClose={() => setShowUseUnitModal(false)}
                />
            )}
        </div>
    );
};

// Use Unit Modal Component
const UseUnitModal = ({ batch, form, setForm, onSubmit, onClose }) => {
    const maxUnits = batch?.units || 1;

    const incrementQuantity = () => {
        if (form.quantity < maxUnits) {
            setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }));
        }
    };

    const decrementQuantity = () => {
        if (form.quantity > 1) {
            setForm(prev => ({ ...prev, quantity: prev.quantity - 1 }));
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 relative animate-scale-in my-8 border border-slate-100">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <X size={20} className="text-slate-400 hover:text-slate-600" />
                </button>

                {/* Header */}
                <div className="mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Droplet className="text-rose-600" size={24} />
                        Use Blood Unit
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Batch #{String(batch?._id || batch?.id).slice(-6)} • {batch?.bloodGroup}
                    </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    {/* Quantity Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Quantity <span className="text-rose-600">*</span>
                        </label>
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <button
                                type="button"
                                onClick={decrementQuantity}
                                className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                                disabled={form.quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <div className="flex-1 text-center">
                                <div className="text-3xl font-bold text-slate-800">{form.quantity}</div>
                                <div className="text-xs font-medium text-slate-500">of {maxUnits} available</div>
                            </div>
                            <button
                                type="button"
                                onClick={incrementQuantity}
                                className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                                disabled={form.quantity >= maxUnits}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Patient ID / IP-OP No */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                <User size={14} className="text-slate-400" /> Patient ID / IP-OP No
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., IP12345 or OP67890"
                                value={form.patientId}
                                onChange={(e) => setForm(prev => ({ ...prev, patientId: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all text-sm"
                            />
                        </div>

                        {/* Reference/Case ID */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                <FileText size={14} className="text-slate-400" /> Reference/Case ID
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., CASE-789"
                                value={form.referenceId}
                                onChange={(e) => setForm(prev => ({ ...prev, referenceId: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Date & Time of Issue (Auto-detected) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" /> Date & Time of Issue
                        </label>
                        <input
                            type="datetime-local"
                            value={form.issueDateTime}
                            onChange={(e) => setForm(prev => ({ ...prev, issueDateTime: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-medium text-sm text-slate-700"
                        />
                        <p className="text-xs text-slate-500 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle size={12} className="text-rose-500" /> Auto-detected current date & time
                        </p>
                    </div>

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Ward / Department */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                <Building2 size={14} className="text-slate-400" /> Ward / Department
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., ICU, Emergency"
                                value={form.ward}
                                onChange={(e) => setForm(prev => ({ ...prev, ward: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all text-sm"
                            />
                        </div>

                        {/* Doctor Name */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                <User size={14} className="text-slate-400" /> Doctor Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Dr. John Smith"
                                value={form.doctorName}
                                onChange={(e) => setForm(prev => ({ ...prev, doctorName: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-2.5 bg-white border border-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="flex-1 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2"
                    >
                        <Droplet size={18} className="fill-current" />
                        Use {form.quantity} Unit{form.quantity > 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Incoming Batches Component (Active Stock)
const IncomingBatchesView = ({ batches = [], onUseUnit, onDiscardUnit }) => {
    if (!batches || batches.length === 0) {
        return (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mt-4">
                <p className="text-slate-500 font-semibold">No active batches found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 mt-6">
            {Object.entries(
                batches
                    .sort((a, b) => new Date(a.collectedDate || Date.now()) - new Date(b.collectedDate || Date.now()))
                    .reduce((groups, batch) => {
                        const group = batch.bloodGroup || 'Unknown';
                        if (!groups[group]) groups[group] = [];
                        groups[group].push(batch);
                        return groups;
                    }, {})
            ).map(([group, groupBatches]) => (
                <div key={group} className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-2">
                        <span className={`px-3 py-1 rounded-md text-sm border ${String(group).includes('+') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                            {group}
                        </span>
                        <span className="text-sm text-slate-500 font-semibold">
                            {groupBatches.length} Batch{groupBatches.length !== 1 ? 'es' : ''}
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupBatches.map(batch => (
                            <div key={batch._id || batch.id} className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold bg-slate-50 border border-slate-100 text-slate-700">
                                            {batch.bloodGroup}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">{batch.componentType || 'Whole Blood'}</h3>
                                            <p className="text-xs font-semibold text-slate-500">Batch #{String(batch._id || batch.id).slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${batch.source === 'transfer' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                        {batch.source === 'transfer' ? 'Transfer' : 'Active'}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> Collected</span>
                                        <span className="font-bold text-slate-700">{new Date(batch.collectedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} className="text-slate-400" /> Expires</span>
                                        <span className="font-bold text-rose-600">{new Date(batch.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    {batch.donorDetails?.name ? (
                                        <div className="space-y-1.5 pt-2.5 border-t border-slate-100 mt-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-semibold flex items-center gap-1.5"><User size={12} className="text-slate-400" /> Donor</span>
                                                <span className="font-bold text-slate-700">{batch.donorDetails.name}</span>
                                            </div>
                                            {batch.donorDetails.phone && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> Phone</span>
                                                    <a href={`tel:${batch.donorDetails.phone}`} className="font-semibold text-rose-600 hover:underline">{batch.donorDetails.phone}</a>
                                                </div>
                                            )}
                                            {batch.donorDetails.email && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> Email</span>
                                                    <span className="font-semibold text-slate-600 truncate max-w-[150px]" title={batch.donorDetails.email}>{batch.donorDetails.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : batch.fromHospitalId ? (
                                        <div className="flex justify-between text-xs pt-2.5 border-t border-slate-100 mt-2">
                                            <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Building2 size={12} className="text-slate-400" /> From</span>
                                            <span className="font-bold text-indigo-700">{batch.sourceName || "Hospital Transfer"}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between text-xs pt-2.5 border-t border-slate-100 mt-2">
                                            <span className="text-slate-500 font-semibold flex items-center gap-1.5"><User size={12} className="text-slate-400" /> Source</span>
                                            <span className="font-bold text-slate-700">{batch.sourceName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                <div className="mt-auto pt-4 flex items-center gap-3 border-t border-slate-100">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Available</p>
                                        <p className="text-2xl font-bold text-slate-800">{batch.units} <span className="text-xs font-semibold text-slate-500">Units</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onDiscardUnit(batch._id || batch.id)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                                            title="Discard damaged or expired unit"
                                        >
                                            <Archive size={18} />
                                        </button>
                                        <button
                                            onClick={() => onUseUnit(batch)}
                                            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-sm rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-rose-700 transition-colors flex items-center gap-2"
                                        >
                                            <Droplet size={16} className="fill-current" /> Use Unit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Outgoing Batches Component (Patient Usage & Transfers) - REDESIGNED
const OutgoingBatchesView = ({ batches = [] }) => {
    const [expandedBatch, setExpandedBatch] = useState(null);

    if (!batches || batches.length === 0) {
        return (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 mt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4">
                    <TrendingDown size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-semibold text-lg">No outgoing batches recorded yet.</p>
                <p className="text-slate-400 text-sm mt-1">Patient usage and transfers will appear here</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {batches.map(batch => {
                const isPatientUsage = batch.type === 'patient_usage';
                const isExpanded = expandedBatch === (batch._id || batch.id);

                return (
                    <div
                        key={batch._id || batch.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
                    >
                        {/* Decorative Top Line */}
                        <div className={`h-1 w-full ${isPatientUsage ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                            {/* Header Row */}
                            <div className="flex items-start justify-between mb-5 border-b border-slate-100 pb-4">
                                {/* Icon & Type */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isPatientUsage
                                        ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                        : 'bg-rose-50 border-rose-100 text-rose-600'
                                        }`}>
                                        {isPatientUsage ? <User size={20} /> : <Building2 size={20} />}
                                    </div>
                                    <div>
                                        <h3 className={`text-base font-bold ${isPatientUsage ? 'text-indigo-700' : 'text-rose-700'
                                            }`}>
                                            {isPatientUsage ? 'Patient Usage' : 'Hospital Transfer'}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                            <Calendar size={12} className="text-slate-400" />
                                            {new Date(batch.issuedAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Quantity Badge */}
                                <div className="text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border ${isPatientUsage
                                        ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                                        : 'bg-rose-50 border-rose-100 text-rose-700'
                                        }`}>
                                        <Droplet size={14} />
                                        <span className="text-lg">{batch.quantity}</span>
                                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Unit{batch.quantity > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="mt-1.5">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-100 text-slate-600 bg-slate-50">
                                            {batch.bloodGroup}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {isPatientUsage ? (
                                    <>
                                        {batch.patientId && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-wider">
                                                    <User size={12} /> Patient ID
                                                </p>
                                                <p className="font-semibold text-slate-800 text-sm truncate">{batch.patientId}</p>
                                            </div>
                                        )}
                                        {batch.referenceId && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-wider">
                                                    <FileText size={12} /> Reference ID
                                                </p>
                                                <p className="font-semibold text-slate-800 text-sm truncate">{batch.referenceId}</p>
                                            </div>
                                        )}
                                        {batch.ward && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-wider">
                                                    <Building2 size={12} /> Ward
                                                </p>
                                                <p className="font-semibold text-slate-800 text-sm truncate">{batch.ward}</p>
                                            </div>
                                        )}
                                        {batch.doctorName && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                                                    Doctor
                                                </p>
                                                <p className="font-semibold text-slate-800 text-sm truncate">{batch.doctorName}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-wider">
                                                <Building2 size={12} /> Receiving Hospital
                                            </p>
                                            <p className="font-semibold text-slate-800 text-sm truncate">{batch.receivingHospitalId}</p>
                                        </div>
                                        {batch.dispatchDetails?.tracker && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-wider">
                                                    <Archive size={12} /> Tracking ID
                                                </p>
                                                <p className="font-semibold text-slate-800 text-sm truncate">{batch.dispatchDetails.tracker}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Source Batches (Traceability) */}
                            {batch.sourceBatchIds && batch.sourceBatchIds.length > 0 && (
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => setExpandedBatch(isExpanded ? null : (batch._id || batch.id))}
                                        className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-between transition-colors border text-sm font-semibold ${isExpanded
                                            ? 'bg-slate-50 border-slate-100 text-slate-700'
                                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Archive size={14} className="text-slate-400" />
                                            Source Batches ({batch.sourceBatchIds.length})
                                        </span>
                                        <span className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-2 space-y-1 animate-fade-in">
                                            {batch.sourceBatchIds.map((source, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Batch ID</p>
                                                            <p className="font-bold text-slate-700 text-xs">#{String(source.batchId || source).slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Units Used</p>
                                                        <p className="text-base font-bold text-slate-800">{source.unitsUsed}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BatchManagement;
