import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity, Sparkles, FileText, Download } from 'lucide-react';
import { adminAPI } from '../../../services/api';

const Reports = () => {
    // Mock Data for AI Prediction (simulating backend response)
    const [predictionData, setPredictionData] = useState([]);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        // Simulating data fetch / computation
        const mockData = [
            { name: 'Jan', actual: 4000, predicted: 4100 },
            { name: 'Feb', actual: 3000, predicted: 3200 },
            { name: 'Mar', actual: 2000, predicted: 2400 },
            { name: 'Apr', actual: 2780, predicted: 2600 },
            { name: 'May', actual: 1890, predicted: 2100 },
            { name: 'Jun', actual: 2390, predicted: 2500 },
            { name: 'Jul', actual: 3490, predicted: 3200 }, // Current (approx)
            { name: 'Aug', actual: null, predicted: 4300 }, // Future
            { name: 'Sep', actual: null, predicted: 4500 },
        ];

        const mockInsights = [
            {
                id: 1,
                type: 'warning',
                title: 'High Probability of O+ Shortage',
                desc: 'Based on seasonal trends and current usage, O+ reserves may fall below critical levels in 14 days.',
                confidence: 92
            },
            {
                id: 2,
                type: 'good',
                title: 'Stable Supply for A-',
                desc: 'Donation rates for A- match predicted demand perfectly. No action required.',
                confidence: 98
            },
            {
                id: 3,
                type: 'info',
                title: 'Surge Expected in August',
                desc: 'Historical data indicates a 20% spike in trauma cases next month. Prepare inventory.',
                confidence: 85
            }
        ];

        setPredictionData(mockData);
        setInsights(mockInsights);
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/50 text-violet-700 text-xs font-black uppercase tracking-wider mb-3 border border-violet-200">
                        <Sparkles size={14} className="animate-pulse" /> Beta Feature
                    </div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center gap-3">
                        <Brain className="text-violet-600" size={42} /> AI Demand Analytics
                    </h2>
                    <p className="text-neutral-500 font-medium mt-2 max-w-xl text-lg">
                        Predictive insights powered by historical usage patterns to prevent shortages before they happen.
                    </p>
                </div>
            </div>

            {/* AI Concept & Workflow - "Glass" Card */}
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* Main Prediction Chart */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                                    <TrendingUp className="text-indigo-500" size={24} />
                                    Demand Forecast
                                </h3>
                                <p className="text-sm text-neutral-400">Actual Usage vs. AI Predicted Requirements</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Actual
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                                    <span className="w-3 h-3 rounded-full bg-violet-300 border-2 border-dashed border-violet-500"></span> Predicted
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorActual)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="predicted"
                                        stroke="#8b5cf6"
                                        strokeDasharray="5 5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPredicted)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Concept Explanation */}
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Sparkles className="text-yellow-400" /> How It Works
                                </h3>
                                <p className="text-neutral-400 leading-relaxed text-sm">
                                    Our module uses a <strong className="text-white">time-series forecasting model</strong> to analyze years of historical blood request logs. It identifies seasonal spikes (e.g., holidays, dengue season) and usage trends per blood group.
                                </p>
                                <div className="flex gap-4 pt-2">
                                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                        <span className="text-xs text-neutral-300 font-bold">Historical Data</span>
                                    </div>
                                    <span className="text-neutral-500">→</span>
                                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-blink" />
                                        <span className="text-xs text-neutral-300 font-bold">Pattern Recognition</span>
                                    </div>
                                    <span className="text-neutral-500">→</span>
                                    <div className="flex items-center gap-2 bg-amber-500/20 rounded-lg px-3 py-2 border border-amber-500/30">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                                        <span className="text-xs text-amber-200 font-bold">Smart Prediction</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <h4 className="text-white font-bold text-sm mb-3">Model Accuracy</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-neutral-400 mb-1">
                                            <span>Training Data</span>
                                            <span>5 Years</span>
                                        </div>
                                        <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-neutral-400 mb-1">
                                            <span>Confidence Score</span>
                                            <span className="text-green-400">94%</span>
                                        </div>
                                        <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[94%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: AI Insights */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-lg shadow-neutral-100 border border-neutral-100 h-full">
                        <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-rose-500" /> Computed Insights
                        </h3>

                        <div className="space-y-4">
                            {insights.map(insight => (
                                <div
                                    key={insight.id}
                                    className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] cursor-default
                                        ${insight.type === 'warning' ? 'bg-red-50 border-red-100' :
                                            insight.type === 'good' ? 'bg-emerald-50 border-emerald-100' :
                                                'bg-blue-50 border-blue-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-2 rounded-xl 
                                            ${insight.type === 'warning' ? 'bg-red-100' :
                                                insight.type === 'good' ? 'bg-emerald-100' :
                                                    'bg-blue-100'}`}>
                                            {insight.type === 'warning' ? <AlertTriangle size={18} className="text-red-600" /> :
                                                insight.type === 'good' ? <CheckCircle size={18} className="text-emerald-600" /> :
                                                    <Brain size={18} className="text-blue-600" />}
                                        </div>
                                        <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase
                                            ${insight.type === 'warning' ? 'bg-red-200 text-red-700' :
                                                insight.type === 'good' ? 'bg-emerald-200 text-emerald-700' :
                                                    'bg-blue-200 text-blue-700'}`}>
                                            {insight.confidence}% Conf.
                                        </span>
                                    </div>
                                    <h4 className={`font-bold text-sm mb-1
                                        ${insight.type === 'warning' ? 'text-red-900' :
                                            insight.type === 'good' ? 'text-emerald-900' :
                                                'text-blue-900'}`}>
                                        {insight.title}
                                    </h4>
                                    <p className={`text-xs leading-relaxed font-medium
                                        ${insight.type === 'warning' ? 'text-red-700/80' :
                                            insight.type === 'good' ? 'text-emerald-700/80' :
                                                'text-blue-700/80'}`}>
                                        {insight.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                            <p className="text-xs text-neutral-400 mt-3 font-medium">
                                Last analysis calculated: Just now
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
