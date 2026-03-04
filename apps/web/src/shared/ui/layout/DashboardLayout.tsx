import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, 
  CreditCard, UserCheck, Settings, LogOut, Menu, X, ChevronRight,
  Calendar, Briefcase
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import NotificationCenter from '../notifications/NotificationCenter';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE'] },
    { name: 'Élèves & Inscriptions', href: '/dashboard/students', icon: Users, roles: ['DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE'] },
    { name: 'Emploi du Temps', href: '/dashboard/timetable', icon: Calendar, roles: ['DIRECTEUR', 'ENSEIGNANT', 'STUDENT', 'PARENT'] },
    { name: 'Appel & Présences', href: '/dashboard/attendance', icon: UserCheck, roles: ['DIRECTEUR', 'ENSEIGNANT'] },
    { name: 'Notes & Bulletins', href: '/dashboard/grades', icon: BookOpen, roles: ['DIRECTEUR', 'ENSEIGNANT', 'PARENT', 'STUDENT'] },
    { name: 'Comptabilité', href: '/dashboard/finance', icon: CreditCard, roles: ['DIRECTEUR', 'COMPTABLE', 'PARENT'] },
    { name: 'Ressources Humaines', href: '/dashboard/hr', icon: Briefcase, roles: ['DIRECTEUR', 'SUPER_ADMIN'] },
    { name: 'Configuration', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'DIRECTEUR'] },
  ];

  const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));
  const activeItem = filteredNav.find(item => location.pathname === item.href || location.pathname.startsWith(item.href + '/'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-indigo-500/20">
      {/* Sidebar - Modern Midnight Design */}
      <aside className={twMerge(
        "bg-slate-950 text-slate-400 w-72 fixed h-full flex flex-col transition-all duration-500 z-50 border-r border-white/5 shadow-heavy",
        !isSidebarOpen && "-translate-x-full xl:translate-x-0 xl:w-24"
      )}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-indigo transition-transform hover:scale-105">S</div>
            <span className={clsx("font-black text-xl text-white tracking-tighter whitespace-nowrap transition-all duration-500", !isSidebarOpen && "xl:opacity-0 xl:translate-x-4")}>
              SGS<span className="text-indigo-500">.</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="xl:hidden text-slate-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
          {filteredNav.map((item) => {
            const isActive = activeItem?.href === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={twMerge(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative duration-300",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-indigo translate-x-1" 
                    : "hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={clsx("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400")} />
                <span className={clsx("font-semibold text-sm whitespace-nowrap transition-all duration-500 text-inherit tracking-tight", !isSidebarOpen && "xl:opacity-0 xl:translate-x-4 xl:w-0")}>
                  {item.name}
                </span>
                {isActive && (
                   <div className="absolute left-0 w-1 h-6 bg-white rounded-full -ml-1 shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 shrink-0 border-t border-white/5 bg-black/20">
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3.5 w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all group">
            <LogOut size={22} className="shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={clsx("font-bold text-sm whitespace-nowrap transition-all duration-500", !isSidebarOpen && "xl:opacity-0 xl:translate-x-4 xl:w-0")}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={twMerge("flex-1 flex flex-col min-h-screen transition-all duration-500", isSidebarOpen ? "xl:ml-72" : "ml-0 xl:ml-24")}>
        {/* Header - Advanced Glassmorphism */}
        <header className="bg-white/70 backdrop-blur-xl h-20 border-b border-slate-200/60 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-40 transition-all">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="p-2.5 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-90 shadow-sm border border-slate-100 bg-white"
              >
                <Menu size={22} />
              </button>
              <div className="hidden sm:flex items-center gap-3 text-sm font-semibold text-slate-400">
                 <span className="hover:text-slate-600 transition-colors cursor-default">SGS Sénégal</span>
                 <ChevronRight size={16} className="text-slate-300" />
                 <span className="text-slate-900 font-black tracking-tight">{activeItem?.name || 'Dashboard'}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-4 sm:gap-6">
              <div className="px-4 py-2 bg-slate-100/80 rounded-xl text-[11px] font-black text-slate-500 uppercase tracking-widest hidden lg:block border border-slate-200/50">
                Année 2024-2025
              </div>
              
              <NotificationCenter />
              
              <div className="flex items-center gap-4 pl-2 sm:pl-4 group cursor-pointer">
                 <div className="text-right hidden sm:block transition-transform group-hover:-translate-x-1">
                    <p className="text-sm font-black text-slate-900 leading-none">{user?.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">{user?.role}</p>
                 </div>
                 <div className="relative">
                    <button className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-700 font-black text-sm shadow-sm group-hover:shadow-indigo group-hover:scale-105 transition-all duration-300">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </button>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                 </div>
              </div>
           </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 p-6 sm:p-12 animate-slow-fade">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
        
        {/* Footer - Minimalist */}
        <footer className="py-8 px-12 border-t border-slate-100 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
             SGS • Système de Gestion Scolaire &copy; 2026
           </p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
