import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Wallet, Search, Plus, Send, CheckCircle2,
  TrendingUp, Calendar, Download, Receipt,
  PieChart as PieIcon, ArrowUpRight, CreditCard,
  ChevronRight, Smartphone, Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { Skeleton } from '../../shared/ui/components/Skeleton';
import { Avatar } from '../../shared/ui/components/Avatar';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';

const FinancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['finance-stats'],
    queryFn: async () => {
      const { data } = await api.get('/finance/stats');
      return data;
    }
  });

  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      return api.post('/finance/reminders', { schoolId });
    },
    onSuccess: () => {
      alert('Rappels de paiement envoyés avec succès aux parents concernés.');
    }
  });

  if (isLoading) return <FinanceSkeleton />;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#64748b'];
  const chartData = stats?.byMethod?.map((m: any) => ({
    name: m.method.replace('_', ' '),
    value: m.total
  })) || [];

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-100/50">
             <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Direction Financière &bull; Temps Réel</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Pilotage de la <span className="text-brand-600 italic">Trésorerie</span><span className="text-brand-300">.</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Suivi analytique des encaissements et optimisation du recouvrement.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <Button 
            variant="outline" 
            size="sm"
            onClick={() => sendRemindersMutation.mutate()}
            loading={sendRemindersMutation.isPending}
            className="gap-2 h-11 px-5"
           >
              <Send size={16} />
              <span>Relancer les impayés</span>
           </Button>
           <Button size="sm" className="gap-2 shadow-indigo h-11 px-5">
              <Plus size={16} />
              <span>Nouveau Règlement</span>
           </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Recettes Collectées" 
          value={stats?.collected || 0} 
          icon={Wallet} 
          trend="+15.4%" 
          trendType="up"
          color="brand"
          unit="FCFA"
        />
        <StatCard 
          label="Reste à Recouvrer" 
          value={stats?.pending || 0} 
          icon={Receipt} 
          trend="Attention" 
          trendType="warning"
          color="rose"
          unit="FCFA"
        />
        <StatCard 
          label="Taux de Recouvrement" 
          value={stats?.recoveryRate || 0} 
          icon={TrendingUp} 
          trend="Objectif 95%" 
          trendType="neutral"
          color="emerald"
          unit="%"
          progress={stats?.recoveryRate}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Transactions Table */}
        <div className="xl:col-span-8">
          <Card className="border-none shadow-soft overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 pb-6">
               <div>
                  <CardTitle className="text-lg font-black">Flux de Trésorerie</CardTitle>
                  <p className="text-xs text-slate-400 font-medium mt-1">Dernières transactions confirmées</p>
               </div>
               <div className="flex gap-2">
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      placeholder="Rechercher..." 
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium w-48 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl"><Download size={14} /></Button>
               </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Élève</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Référence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentTransactions?.map((tx: any) => (
                  <TableRow key={tx.id} className="group transition-all">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={tx.studentName} className="h-9 w-9 text-[10px]" />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{tx.studentName}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Élève Inscrit</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <MethodIcon method={tx.method} />
                          <span className="text-xs font-bold text-slate-600">{tx.method.replace('_', ' ')}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-black text-slate-900 tracking-tight">
                        {tx.amount.toLocaleString()} <span className="text-[10px] text-slate-400 ml-0.5">FCFA</span>
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Calendar size={12} className="text-slate-300" />
                        {new Date(tx.date).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">{tx.ref || 'MANUAL'}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
              <div className="py-32 text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <Receipt size={32} className="text-slate-200" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900">Aucune transaction</h3>
                 <p className="text-slate-400 font-medium mt-2">Le journal des recettes est vide pour le moment.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Analytics Panel */}
        <div className="xl:col-span-4 space-y-8">
           <Card className="border-none shadow-soft overflow-hidden">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <PieIcon size={16} className="text-brand-600" />
                    Répartition par Méthode
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="h-[280px] w-full">
                    <PaymentMethodDonut data={chartData} colors={COLORS} />
                 </div>
                 <div className="space-y-3 mt-4">
                    {chartData.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-xs font-bold text-slate-600">{item.name}</span>
                         </div>
                         <span className="text-xs font-black text-slate-900">{item.value.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="bg-[#0F172A] p-8 rounded-[2rem] text-white relative overflow-hidden shadow-heavy group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Smartphone size={80} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="px-2 py-1 bg-brand-500/20 rounded text-[9px] font-black uppercase tracking-widest text-brand-400 border border-brand-500/20">Active</div>
                    <span className="text-[10px] font-bold text-slate-400">Passerelle Digitale</span>
                 </div>
                 <h4 className="text-lg font-black tracking-tight mb-4">Mobile Money</h4>
                 <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                   72% des parents utilisent désormais Wave ou Orange Money pour le règlement de la scolarité.
                 </p>
                 <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 uppercase font-black text-[10px] tracking-widest py-4 gap-2">
                    Configurer les APIs
                    <ChevronRight size={14} />
                 </Button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, trendType, icon: Icon, color, unit, progress }: any) => {
  const colors: any = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100/50',
    rose: 'bg-rose-50 text-rose-600 border-rose-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
  };
  const accent: any = {
    brand: 'bg-brand-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
  };

  const trendColors: any = {
    up: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-rose-50 text-rose-600',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <Card className="border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden">
      <CardContent className="p-8">
        <div className="flex justify-between items-start">
          <div className={`p-4 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={28} />
          </div>
          <Badge variant="default" className={`px-3 py-1 text-[10px] font-black border-none ${trendColors[trendType]}`}>
             {trendType === 'up' && <ArrowUpRight size={12} className="inline mr-1" />}
             {trendType === 'warning' && <AlertCircle size={12} className="inline mr-1" />}
             {trend}
          </Badge>
        </div>
        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">
              <Counter value={value} />
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase">{unit}</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
            <span className={`w-1 h-1 rounded-full ${accent[color] || accent.brand}`} />
            {label}
          </p>
        </div>
        {progress !== undefined && (
          <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
             <div
              style={{ width: `${progress}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
             />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MethodIcon = ({ method }: { method: string }) => {
  if (method === 'WAVE' || method === 'ORANGE_MONEY') return <Smartphone size={14} className="text-blue-500" />;
  if (method === 'CASH') return <Banknote size={14} className="text-emerald-500" />;
  return <CreditCard size={14} className="text-slate-400" />;
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

type MethodPoint = {
  name: string;
  value: number;
};

const PaymentMethodDonut: React.FC<{ data: MethodPoint[]; colors: string[] }> = ({ data, colors }) => {
  const total = data.reduce((acc, item) => acc + Number(item.value || 0), 0);

  if (!data.length || total <= 0) {
    return (
      <div className="h-full rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Aucune donnée
      </div>
    );
  }

  let current = 0;
  const segments = data.map((item, index) => {
    const start = current;
    const ratio = Number(item.value) / total;
    const end = start + ratio * 100;
    current = end;
    const color = colors[index % colors.length];
    return `${color} ${start}% ${end}%`;
  });

  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative w-[220px] h-[220px]">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${segments.join(', ')})` }}
          aria-label="Répartition des paiements par méthode"
        />
        <div className="absolute inset-[28px] rounded-full bg-white border border-slate-100 shadow-inner flex flex-col items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</span>
          <span className="text-lg font-black text-slate-900 leading-none mt-1">{total.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">FCFA</span>
        </div>
      </div>
    </div>
  );
};

const FinanceSkeleton = () => (
  <div className="space-y-10 animate-pulse pb-16">
    <div className="flex justify-between items-end">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-6">
       {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
    </div>
    <div className="grid grid-cols-12 gap-8">
       <Skeleton className="col-span-8 h-[500px] rounded-2xl" />
       <Skeleton className="col-span-4 h-[500px] rounded-2xl" />
    </div>
  </div>
);

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default FinancePage;
