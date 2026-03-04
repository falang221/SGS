import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Users, CreditCard, UserCheck, TrendingUp, 
  Download, ArrowUpRight, Calendar, Search, Bell, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 shadow-indigo"></div>
      </div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Chargement de votre centre de pilotage...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16"
    >
      
      {/* Header Professionnel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-3 px-3 py-1 bg-indigo-50 rounded-full w-fit">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
             Vue d'ensemble stratégique
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Bonjour, <span className="text-indigo-600">Direction</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Voici les indicateurs clés de votre établissement aujourd'hui.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
           <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                placeholder="Rechercher..." 
                className="pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm w-full lg:w-72 font-medium"
              />
           </div>
           <Button variant="secondary" className="gap-2">
              <Download size={16} />
              <span>Exporter</span>
           </Button>
        </div>
      </div>

      {/* KPI Cards Refactorisées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Élèves Actifs" 
          value={stats?.students || 0} 
          icon={Users} 
          trend="+12%"
          color="indigo"
        />
        <StatCard 
          title="Taux Recouvrement" 
          value={`${stats?.recoveryRate || 0}%`} 
          icon={TrendingUp} 
          trend="En hausse"
          color="emerald"
        />
        <StatCard 
          title="Recettes (FCFA)" 
          value={(stats?.totalPayments || 0).toLocaleString()} 
          icon={CreditCard} 
          trend="Stable"
          color="slate"
        />
        <StatCard 
          title="Personnel" 
          value={stats?.staff || 0} 
          icon={UserCheck} 
          trend="Complet"
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Graphique d'Évolution */}
        <Card className="lg:col-span-8">
          <CardContent className="pt-8">
            <div className="flex justify-between items-start mb-12">
              <div>
                 <h3 className="text-xl font-bold text-slate-900 tracking-tight">Flux des Inscriptions</h3>
                 <p className="text-slate-400 text-xs mt-1">Évolution sur les 6 derniers mois</p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                 {['Semaine', 'Mois'].map(t => (
                   <button key={t} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${t === 'Mois' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
                 ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="v" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Panel Tactique */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="bg-slate-900 text-white border-none shadow-indigo">
              <CardContent className="pt-8 text-center">
                 <h3 className="text-lg font-bold mb-8 flex items-center justify-center gap-2">
                    Objectif Recouvrement
                    <Sparkles className="text-amber-400" size={18} />
                 </h3>
                 <div className="relative inline-flex items-center justify-center">
                    <div className="absolute flex flex-col items-center">
                       <span className="text-5xl font-black">{stats?.recoveryRate || 0}%</span>
                       <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-2">Réalisé</span>
                    </div>
                    <svg className="w-48 h-48 -rotate-90">
                       <circle cx="50%" cy="50%" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                       <circle 
                          cx="50%" cy="50%" r="80" fill="none" stroke="#6366f1" strokeWidth="12" 
                          strokeDasharray="502" 
                          strokeDashoffset={502 - (502 * (stats?.recoveryRate || 0)) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                       />
                    </svg>
                 </div>
                 <p className="text-sm text-slate-400 mt-8 font-medium">
                    Excellent ! Vous êtes en avance de <span className="text-indigo-400 font-bold">+5%</span> sur l'an dernier.
                 </p>
              </CardContent>
           </Card>

           <Card>
              <CardContent className="pt-8">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                  Actions Rapides
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <QuickActionButton icon={Users} label="Élève" color="indigo" />
                   <QuickActionButton icon={Bell} label="Alerte" color="rose" />
                   <QuickActionButton icon={Calendar} label="Planning" color="emerald" />
                   <QuickActionButton icon={ArrowUpRight} label="Audit" color="slate" />
                </div>
              </CardContent>
           </Card>
        </div>

      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <Card className="hover:border-indigo-200 transition-colors group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
             <ArrowUpRight size={10} strokeWidth={3} /> {trend}
          </div>
        </div>
        <div className="mt-6">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionButton = ({ icon: Icon, label, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    slate: 'bg-slate-900 text-white hover:bg-slate-800',
  };

  return (
    <button className={`flex flex-col items-center justify-center py-6 rounded-xl ${colors[color]} transition-all active:scale-95 gap-3`}>
      <Icon size={20} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
};

export default DashboardPage;
