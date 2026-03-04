import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, 
  CreditCard, UserCheck, Settings, LogOut, Menu, X, ChevronRight,
  Calendar, Briefcase, Bell, Search, Command, Building2, ShieldCheck,
  Server, Cpu
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import NotificationCenter from '../notifications/NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../components/Avatar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    // Section Super Admin
    { name: 'Établissements', href: '/dashboard/tenants', icon: Building2, roles: ['SUPER_ADMIN'] },
    { name: 'Réglages Plateforme', href: '/dashboard/platform-settings', icon: Server, roles: ['SUPER_ADMIN'] },
    
    // Section École
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE'] },
    { name: 'Élèves & Inscriptions', href: '/dashboard/students', icon: Users, roles: ['DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE'] },
    { name: 'Emploi du Temps', href: '/dashboard/timetable', icon: Calendar, roles: ['DIRECTEUR', 'ENSEIGNANT', 'STUDENT', 'PARENT'] },
    { name: 'Appel & Présences', href: '/dashboard/attendance', icon: UserCheck, roles: ['DIRECTEUR', 'ENSEIGNANT'] },
    { name: 'Notes & Bulletins', href: '/dashboard/grades', icon: BookOpen, roles: ['DIRECTEUR', 'ENSEIGNANT', 'PARENT', 'STUDENT'] },
    { name: 'Comptabilité', href: '/dashboard/finance', icon: CreditCard, roles: ['DIRECTEUR', 'COMPTABLE', 'PARENT'] },
    { name: 'Ressources Humaines', href: '/dashboard/hr', icon: Briefcase, roles: ['DIRECTEUR', 'SUPER_ADMIN'] },
    { name: 'Réglages École', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'DIRECTEUR'] },
  ];

  const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));
  const activeItem = filteredNav.find(item => location.pathname === item.href || location.pathname.startsWith(item.href + '/'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <aside 
        className={twMerge(
          "hidden xl:flex flex-col bg-[#0F172A] text-slate-400 fixed h-full z-50 transition-all duration-300 ease-in-out border-r border-white/5",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black shadow-indigo flex-shrink-0">
              S
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display font-black text-xl text-white tracking-tighter"
              >
                SGS<span className="text-brand-500">.</span>
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
          {filteredNav.map((item) => {
            const isActive = activeItem?.href === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative duration-200",
                  isActive 
                    ? "bg-brand-600 text-white shadow-indigo" 
                    : "hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "shrink-0 transition-transform duration-200 group-hover:scale-110", 
                    isActive ? "text-white" : "text-slate-400 group-hover:text-brand-400"
                  )} 
                />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-semibold text-sm whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && isSidebarOpen && (
                  <div className="absolute left-0 w-1 h-5 bg-white rounded-full -ml-0.5" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 shrink-0 border-t border-white/5 bg-slate-900/50">
          <button 
            onClick={handleLogout} 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all group",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-semibold text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] xl:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-[#0F172A] z-[70] flex flex-col xl:hidden shadow-heavy"
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black">S</div>
                <span className="font-display font-black text-xl text-white tracking-tighter">SGS.</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-2 hover:bg-white/5 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-1">
              {filteredNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    location.pathname === item.href ? "bg-brand-600 text-white shadow-indigo" : "text-slate-400 hover:bg-white/5"
                  )}
                >
                  <item.icon size={20} />
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className={twMerge(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        isSidebarOpen ? "xl:ml-72" : "xl:ml-20"
      )}>
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Menu size={20} />
              </button>
              
              <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200 group focus-within:ring-2 focus-within:ring-brand-500/20 transition-all w-64 lg:w-96">
                <Search size={16} className="text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                />
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-400 font-bold">
                  <Command size={10} /> K
                </div>
              </div>
           </div>
           
           <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative lg:hidden">
                <Search size={20} />
              </button>

              <NotificationCenter />
              
              <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
              
              <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none truncate max-w-[150px]">
                      {user?.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider mt-1">
                      {user?.role === 'SUPER_ADMIN' ? 'Admin Système' : user?.role}
                    </p>
                 </div>
                 <Avatar 
                   src={null} 
                   fallback={user?.email?.[0].toUpperCase() || 'U'} 
                   className="h-9 w-9 border-2 border-white shadow-soft ring-1 ring-slate-200" 
                 />
              </div>
           </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 md:p-10">
          <div className="max-w-7xl mx-auto">
             <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 {children}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
        
        <footer className="py-6 px-8 border-t border-slate-200 text-center bg-white/50">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             SGS • Système de Gestion Scolaire &copy; 2026 • Dakar, Sénégal
           </p>
        </footer>
      </main>
    </div>
  );
};

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default DashboardLayout;
