import os

file_path = 'src/components/layout/DashboardLayout.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update aside wrapper
content = content.replace(
'''            <aside
                className={`group/sidebar fixed inset-y-0 left-0 z-40 w-20 hover:w-72 bg-white/80 backdrop-blur-xl border-r border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transform transition-all duration-300 ease-out lg:translate-x-0 overflow-x-hidden ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full'
                    }`}
            >''',
'''            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-xl border-r border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transform transition-transform duration-300 ease-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >'''
)

# 2. Update Brand
content = content.replace(
'''                    {/* Brand */}
                    <div className="h-24 flex items-center gap-3 px-5 border-b border-neutral-100/50 shrink-0">
                        <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-primary to-rose-600 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center text-white transform hover:rotate-12 transition-transform duration-300">
                            <Droplet size={20} className="fill-current" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-neutral-900 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            Blood<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-600">Stock</span>
                        </span>
                    </div>''',
'''                    {/* Brand */}
                    <div className="h-24 flex items-center gap-3 px-8 border-b border-neutral-100/50 shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-rose-600 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center text-white transform hover:rotate-12 transition-transform duration-300">
                            <Droplet size={20} className="fill-current" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-neutral-900">
                            Blood<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-600">Stock</span>
                        </span>
                    </div>'''
)

# 3. Update Section Headers
content = content.replace(
'''                                    <div key={`section-${index}`} className="px-2 pt-5 pb-2 text-[10px] text-center group-hover/sidebar:text-left group-hover/sidebar:px-4 font-bold uppercase tracking-widest text-neutral-400 transition-all duration-300">
                                        <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">{link.section}</span>
                                        <span className="block group-hover/sidebar:hidden border-b border-neutral-200 mt-2 mx-2" />
                                    </div>''',
'''                                    <div key={`section-${index}`} className="px-4 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                        {link.section}
                                    </div>'''
)

# 4. Update NavLink
content = content.replace(
'''                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => `group relative flex items-center gap-3.5 px-3 py-3 rounded-2xl mx-1 text-sm font-bold transition-all duration-300 overflow-hidden ${isActive
                                        ? 'text-white shadow-lg shadow-primary/25 translate-x-1 group-hover/sidebar:translate-x-2'
                                        : 'text-neutral-500 hover:text-primary hover:bg-white/60 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:translate-x-0.5 group-hover/sidebar:hover:translate-x-1'
                                        }`}
                                    end
                                >''',
'''                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${isActive
                                        ? 'text-white shadow-lg shadow-primary/25 translate-x-2'
                                        : 'text-neutral-500 hover:text-primary hover:bg-white/60 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:translate-x-1'
                                        }`}
                                    end
                                >'''
)

content = content.replace(
'''                                            <span className="tracking-wide flex-1 truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">{link.label}</span>''',
'''                                            <span className="tracking-wide flex-1 truncate">{link.label}</span>'''
)

content = content.replace(
'''                                            {link.badge && (
                                                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ${isActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700 group-hover:bg-rose-200'}`}>
                                                    {link.badge}
                                                </span>
                                            )}''',
'''                                            {link.badge && (
                                                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm ${isActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700 group-hover:bg-rose-200'}`}>
                                                    {link.badge}
                                                </span>
                                            )}'''
)

# 5. Update Profile
content = content.replace(
'''                    {/* User Profile */}
                    <div className="p-2 group-hover/sidebar:p-4 border border-transparent group-hover/sidebar:border-white/60 group-hover/sidebar:border-t-neutral-100/50 backdrop-blur-md group-hover/sidebar:bg-white/40 m-2 group-hover/sidebar:m-3 rounded-2xl group-hover/sidebar:shadow-[0_2px_8px_rgba(0,0,0,0.04)] shrink-0 transition-all duration-300 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 border-2 border-white shadow-inner flex items-center justify-center text-neutral-500">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                <div className="text-sm font-bold text-neutral-900 truncate">{user?.name || 'User'}</div>
                                <div className="text-[10px] font-medium text-neutral-400 capitalize bg-neutral-100 px-2 py-0.5 rounded-full w-fit mt-0.5">
                                    {user?.role} Access
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-rows-[0fr] group-hover/sidebar:grid-rows-[1fr] transition-[grid-template-rows] duration-300">
                            <div className="overflow-hidden">
                                <button
                                    onClick={handleLogout}
                                    className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-all duration-300 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg"
                                >
                                    <LogOut size={14} /> <span className="whitespace-nowrap">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>''',
'''                    {/* User Profile */}
                    <div className="p-4 border-t border-neutral-100/50 backdrop-blur-md bg-white/40 m-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-white/60 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 border-2 border-white shadow-inner flex items-center justify-center text-neutral-500">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-neutral-900 truncate">{user?.name || 'User'}</div>
                                <div className="text-[10px] font-medium text-neutral-400 capitalize bg-neutral-100 px-2 py-0.5 rounded-full w-fit mt-0.5">
                                    {user?.role} Access
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-all duration-300 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>'''
)

# 6. Update Main Content Margin
content = content.replace(
'''            {/* Main Content */}
            <main className="flex-1 lg:ml-20 flex flex-col min-h-screen relative z-0 transition-all duration-300">''',
'''            {/* Main Content */}
            <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative z-0">'''
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("DashboardLayout sidebar reverted successfully.")
