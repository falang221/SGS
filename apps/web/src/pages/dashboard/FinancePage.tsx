import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Wallet, Search, Filter, Plus, Send, CheckCircle2, Clock,
  TrendingUp, Sparkles, Hash, Calendar, Download, Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';

const FinancePage: React.FC = () => {
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
    }
  });

  if (isLoading) return <FinanceSkeleton />;

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
             <Receipt size={12} />
             Gestion Financière & Recouvrement
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Trésorerie <span className="text-indigo-600">Live</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Suivi des encaissements et gestion des impayés en temps réel.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <Button 
            variant="outline" 
            onClick={() => sendRemindersMutation.mutate()}
            loading={sendRemindersMutation.isPending}
            className="gap-2"
           >
              <Send size={16} />
              <span>Relancer Impayés</span>
           </Button>
           <Button className="gap-2 shadow-indigo">
              <Plus size={16} />
              <span>Nouveau Règlement</span>
           </Button>
        </div>
      </div>

      {/* KPI Cards Refactorisées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceStatCard 
          label="Total Encaissé" 
          value={`${(stats?.collected || 0).toLocaleString()} FCFA`}
          trend="+12%"
          icon={Wallet}
          color="indigo"
        />
        <FinanceStatCard 
          label="Reste à Recouvrer" 
          value={`${(stats?.pending || 0).toLocaleString()} FCFA`}
          trend="Action requise"
          icon={Receipt}
          color="rose"
          isWarning
        />
        <FinanceStatCard 
          label="Recouvrement Global" 
          value={`${stats?.recoveryRate || 0}%`}
          trend="Objectif 90%"
          icon={TrendingUp}
          color="slate"
          progress={stats?.recoveryRate}
        />
      </div>

      {/* Journal des Recettes */}
      <Card className="overflow-hidden border-slate-200 shadow-soft">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Journal des Recettes</h3>
              <p className="text-slate-400 text-xs font-medium">Historique des 50 dernières transactions</p>
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                  placeholder="Rechercher..." 
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium w-full md:w-64 focus:ring-2 focus:ring-indigo-500"
                 />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10"><Filter size={16} /></Button>
              <Button variant="outline" size="icon" className="h-10 w-10"><Download size={16} /></Button>
           </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Élève & Matricule</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats?.recentTransactions?.map((tx: any) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-900">Amadou Sow</p> {/* Note: Il faudrait inclure le nom de l'élève via Prisma */}
                    <Badge variant="outline" className="mt-1 gap-1 border-none text-slate-400">
                      <Hash size={10} /> {tx.id.substring(0, 8)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar size={12} />
                    {new Date(tx.createdAt).toLocaleString('fr-FR')}
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant="default" className="bg-slate-100 text-slate-600 border-none font-black">
                      {tx.method.replace('_', ' ')}
                   </Badge>
                </TableCell>
                <TableCell>
                  <p className="font-black text-slate-900 text-base tracking-tighter">
                    {Number(tx.amount).toLocaleString()} <span className="text-[10px] text-slate-400 ml-1">FCFA</span>
                  </p>
                </TableCell>
                <TableCell className="text-right">
                   <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'warning'} className="gap-1.5 py-1 px-3">
                      {tx.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {tx.status === 'COMPLETED' ? 'Confirmé' : 'En attente'}
                   </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Receipt className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-900 font-bold">Aucune transaction enregistrée</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

const FinanceStatCard = ({ label, value, trend, icon: Icon, color, isWarning, progress }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-600 text-white',
    rose: 'bg-rose-500 text-white',
    slate: 'bg-slate-900 text-white',
  };

  return (
    <Card className="hover:shadow-md transition-shadow group overflow-hidden border-slate-200">
      <CardContent className="p-8">
        <div className="flex justify-between items-start">
          <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform shadow-lg`}>
            <Icon size={28} />
          </div>
          <Badge variant={isWarning ? 'danger' : 'success'} className="py-1 px-3">
             {trend}
          </Badge>
        </div>
        <div className="mt-8">
          <h4 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${isWarning ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
            {label}
          </p>
        </div>
        {progress !== undefined && (
          <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-indigo-600"
             />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FinanceSkeleton = () => (
  <div className="space-y-8 animate-pulse pb-16">
    <div className="flex justify-between items-center">
      <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
      <div className="flex gap-3">
        <div className="h-12 w-40 bg-slate-100 rounded-xl"></div>
        <div className="h-12 w-48 bg-indigo-50 rounded-xl"></div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-6">
       {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl"></div>)}
    </div>
    <div className="h-[400px] w-full bg-slate-100 rounded-2xl border border-slate-200"></div>
  </div>
);

export default FinancePage;
