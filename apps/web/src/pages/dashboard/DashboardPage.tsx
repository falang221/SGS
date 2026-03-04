import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  Users, CreditCard, UserCheck, TrendingUp, 
  Download, ArrowUpRight, Calendar, Search, Bell, Sparkles,
  MoreVertical, Filter, Activity, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { Skeleton } from '../../shared/ui/components/Skeleton';
import { Avatar } from '../../shared/ui/components/Avatar';

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    }
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      
      {/* Upper Section: Welcome & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-100/50">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
             </span>
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Live Analytics</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Pilotage <span className="text-brand-600">Stratégique</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Tableau de bord de direction • Année Scolaire 2024-2025
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Filter size={16} />
              <span>Filtres</span>
           </Button>
           <Button variant="primary" size="sm" className="gap-2 shadow-indigo">
              <Download size={16} />
              <span>Rapport Mensuel</span>
           </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Élèves Inscrits" 
          value={stats?.students || 0} 
          icon={GraduationCap} 
          trend="+5.2%"
          trendType="success"
          color="brand"
        />
        <StatCard 
          title="Recouvrement" 
          value={`${stats?.recoveryRate || 0}%`} 
          icon={TrendingUp} 
          trend="+12%"
          trendType="success"
          color="emerald"
        />
        <StatCard 
          title="Chiffre d'Affaires" 
          value={(stats?.totalPayments || 0).toLocaleString()} 
          icon={CreditCard} 
          trend="Stable"
          trendType="neutral"
          color="slate"
        />
        <StatCard 
          title="Effectif RH" 
          value={stats?.staff || 0} 
          icon={UserCheck} 
          trend="Complet"
          trendType="neutral"
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Chart Section */}
        <Card className="lg:col-span-8 overflow-hidden border-none shadow-soft bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-black">Inscriptions Mensuelles</CardTitle>
              <p className="text-xs text-slate-400 font-medium mt-1">Analyse comparative des nouveaux flux</p>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} className="text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData || []} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="n" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9', radius: 8}}
                    contentStyle={{
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                  />
                  <Bar 
                    dataKey="v" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 4, 4]} 
                    maxBarSize={45}
                  >
                    { (stats?.chartData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fillOpacity={index === (stats?.chartData?.length - 1) ? 1 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tactical & Progress Section */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="bg-[#0F172A] text-white border-none shadow-indigo relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={120} />
              </div>
              <CardContent className="pt-10 text-center relative z-10">
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center justify-center gap-2">
                    Recouvrement Annuel
                 </h3>
                 
                 <div className="relative inline-flex items-center justify-center">
                    <div className="absolute flex flex-col items-center">
                       <motion.span 
                         initial={{ scale: 0.5, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="text-5xl font-black tracking-tighter"
                       >
                         {stats?.recoveryRate || 0}%
                       </motion.span>
                       <Badge variant="info" className="mt-4 bg-brand-500/20 text-brand-400 border-none">
                         En avance de +2%
                       </Badge>
                    </div>
                    <svg className="w-52 h-52 -rotate-90">
                       <circle cx="50%" cy="50%" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                       <motion.circle 
                          initial={{ strokeDashoffset: 565 }}
                          animate={{ strokeDashoffset: 565 - (565 * (stats?.recoveryRate || 0)) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          cx="50%" cy="50%" r="90" fill="none" stroke="#3b82f6" strokeWidth="14" 
                          strokeDasharray="565" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                       />
                    </svg>
                 </div>
                 
                 <p className="text-xs text-slate-400 mt-10 font-bold uppercase tracking-widest leading-loose">
                    Performance Exceptionnelle<br/>
                    <span className="text-slate-500">Dernière mise à jour: Aujourd'hui</span>
                 </p>
              </CardContent>
           </Card>

           <Card className="border-none shadow-soft">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Activity size={16} className="text-brand-600" />
                  Activités Récentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { user: 'Admin', action: 'Nouveau bulletin généré', time: 'Il y a 2 min', color: 'brand' },
                  { user: 'Comptable', action: 'Paiement Wave reçu', time: 'Il y a 15 min', color: 'emerald' },
                  { user: 'Directeur', action: 'Emploi du temps modifié', time: 'Il y a 1h', color: 'violet' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <Avatar fallback={act.user} className="h-8 w-8 text-[10px]" />
                    <div className="flex-1 border-b border-slate-50 pb-3 group-last:border-none">
                      <p className="text-xs font-bold text-slate-900 leading-none">{act.user}</p>
                      <p className="text-[11px] text-slate-500 mt-1.5">{act.action}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase mt-2 tracking-tighter">{act.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest py-3">
                  Voir tout l'audit
                </Button>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendType, color }: any) => {
  const colorMap: any = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
    slate: 'bg-slate-50 text-slate-600 border-slate-200/50',
    violet: 'bg-violet-50 text-violet-600 border-violet-100/50',
  };

  const badgeVariant = trendType === 'success' ? 'success' : trendType === 'danger' ? 'destructive' : 'secondary';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl border ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={22} />
            </div>
            <Badge variant={badgeVariant} className="px-2 py-0.5 text-[9px] font-black">
               {trend}
            </Badge>
          </div>
          <div className="mt-8">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                {typeof value === 'number' ? <Counter value={value} /> : value}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2.5">
              {title}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <>{count.toLocaleString()}</>;
};

const DashboardSkeleton = () => (
  <div className="space-y-10 animate-slow-fade">
    <div className="flex justify-between items-end">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
    <div className="grid grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-12 gap-8">
       <Skeleton className="col-span-8 h-[500px] rounded-xl" />
       <div className="col-span-4 space-y-8">
         <Skeleton className="h-[300px] rounded-xl" />
         <Skeleton className="h-[200px] rounded-xl" />
       </div>
    </div>
  </div>
);

export default DashboardPage;
