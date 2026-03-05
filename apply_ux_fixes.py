import os

file_path = 'src/pages/dashboard/hospital/HospitalDashboard.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Breadcrumb
content = content.replace(
'''                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
                            <span className="hover:text-white cursor-pointer transition-colors">Overview</span>
                            <span className="text-neutral-600">/</span>
                            <span className="text-neutral-300">Dashboard</span>
                        </div>''',
'''                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
                            <span className="text-neutral-300">Dashboard</span>
                        </div>'''
)

# 2. Stat card icon background
content = content.replace(
'''<div className={`p-3 rounded-xl ${stat.isAlert ? 'bg-white text-rose-600 border-rose-100' : `${t.light} ${t.text} ${t.border}`} border shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>''',
'''<div className={`p-3 rounded-xl ${stat.isAlert ? 'bg-rose-100/80 text-rose-600 border-rose-200' : `${t.light} ${t.text} ${t.border}`} border shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>'''
)

# 3. Low Stock Alerts card footer
content = content.replace(
'''                                        {/* Structured Action Footer */}
                                        <div className={`${stat.isAlert ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-50 border-t border-slate-100 text-slate-600'} px-5 py-3.5 flex justify-between items-center group-hover:bg-opacity-90 transition-colors`}>
                                            <span className="text-xs font-bold">View detailed report</span>
                                            <ArrowRight size={15} className={`${stat.isAlert ? 'text-white/70 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'} transition-colors group-hover:translate-x-0.5`} />
                                        </div>''',
'''                                        {/* Structured Action Footer */}
                                        <div className={`${stat.isAlert ? 'bg-rose-50 border-t border-rose-100 text-rose-700' : 'bg-slate-50 border-t border-slate-100 text-slate-600'} px-5 py-3.5 flex justify-between items-center transition-colors group-hover:bg-slate-100`}>
                                            <span className="text-xs font-bold">View detailed report</span>
                                            <ArrowRight size={15} className={`${stat.isAlert ? 'text-rose-400 group-hover:text-rose-600' : 'text-slate-400 group-hover:text-slate-700'} transition-colors group-hover:translate-x-0.5`} />
                                        </div>'''
)

# 4. Progress Bars
content = content.replace(
'''                                                        {/* UPGRADED CLEAR 5PX PROGRESS BAR */}
                                                        <div className="w-28 h-[5px] bg-slate-100/80 rounded-full mt-2 overflow-hidden ring-1 ring-inset ring-slate-200/50">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${data.status === 'critical' ? 'bg-gradient-to-r from-rose-500 to-rose-600' : data.status === 'low' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                                                                style={{ width: `max(8px, ${Math.min(data.units * 5, 100)}%)` }}
                                                            />
                                                        </div>''',
'''                                                        {/* FULL AVAILABLE WIDTH PROGRESS BAR */}
                                                        <div className="w-full min-w-[120px] max-w-[200px] h-[6px] bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/60 shadow-inner">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${data.status === 'critical' ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.4)]' : data.status === 'low' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                                                                style={{ width: `max(8px, ${Math.min(data.units * 5, 100)}%)` }}
                                                            />
                                                        </div>'''
)

# 5. Manage Button
content = content.replace(
'''                                                            <button
                                                                onClick={() => navigate(`/dashboard/hospital/batches?bloodGroup=${encodeURIComponent(group)}`)}
                                                                className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                                            >
                                                                Manage <ArrowRight size={13} />
                                                            </button>''',
'''                                                            <button
                                                                onClick={() => navigate(`/dashboard/hospital/batches?bloodGroup=${encodeURIComponent(group)}`)}
                                                                className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
                                                            >
                                                                Manage <ArrowRight size={13} className="text-slate-400" />
                                                            </button>'''
)

# 6. Reorder section and pad out Today's digest
td_start = content.find("                                {/* Today's Digest */}")
td_end = content.find("                                {/* Alerts / Stock Health with Donut Visualization */}")

alerts_start = content.find("                                {/* Alerts / Stock Health with Donut Visualization */}")
alerts_end = content.find("                                {/* Quick Actions Removed */}")

if td_start != -1 and alerts_start != -1:
    today_digest_code = content[td_start:td_end]
    alerts_code = content[alerts_start:alerts_end]
    
    # Pad out today's digest
    added_row = '''                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Clock size={16} className="stroke-[2.5px]" /></div>
                                                <span className="text-sm font-bold text-slate-700">Pending Approvals</span>
                                            </div>
                                            <span className="font-black text-slate-900">4</span>
                                        </div>
                                    </div>'''
    today_digest_code = today_digest_code.replace('                                    </div>\n                                </div>\n\n', added_row + '\n                                </div>\n\n')

    # Replace in content by putting alerts before today's digest
    new_sidebar_code = alerts_code + today_digest_code
    
    content = content[:td_start] + new_sidebar_code + content[alerts_end:]


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied refined UX details to dashboard successfully.")
