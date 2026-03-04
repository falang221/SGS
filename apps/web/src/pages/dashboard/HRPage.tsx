import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Users, UserPlus, Search, Filter, MoreHorizontal, Mail, 
  Award, ChevronRight, Hash, FileText, Briefcase, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { Avatar } from '../../shared/ui/components/Avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../shared/ui/components/Table';

const HRPage: React.FC = () => {
  const queryClient = useQueryClient();
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';
  const [searchTerm, setSearchTerm] = useState('');

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/hr/school/${schoolId}`);
      return data;
    }
  });

  const { data: hrStats } = useQuery({
    queryKey: ['hr-stats', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/hr/stats/${schoolId}`);
      return data;
    }
  });

  const payrollMutation = useMutation({
    mutationFn: async () => {
      return api.post('/hr/payroll', { schoolId, month: 3, year: 2026 });
    }
  });

  const filteredStaff = staff?.filter((s: any) => 
    `${s.user.email} ${s.role}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <HRSkeleton />;

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
             <Briefcase size={12} />
             Gestion du Capital Humain
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Registre <span className="text-indigo-600">Staff</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Pilotez vos équipes et gérez la masse salariale.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => payrollMutation.mutate()}
            loading={payrollMutation.isPending}
           >
              <FileText size={16} />
              <span>Générer Paie</span>
           </Button>
           <Button className="gap-2 shadow-indigo">
              <UserPlus size={16} />
              <span>Nouveau Collaborateur</span>
           </Button>
        </div>
      </div>

      {/* KPI Cards Refactorisées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HRStatCard 
          label="Effectif Total" 
          value={hrStats?.count || 0}
          trend="Stable"
          icon={Users}
          color="indigo"
        />
        <HRStatCard 
          label="Masse Salariale / Mois" 
          value={`${(hrStats?.monthlyPayroll || 0).toLocaleString()} F`}
          trend="+2.1%"
          icon={DollarSign}
          color="emerald"
        />
        <HRStatCard 
          label="Taux de Rétention" 
          value={`${hrStats?.retentionRate || 0}%`}
          trend="Optimal"
          icon={Award}
          color="violet"
        />
      </div>

      {/* Barre de recherche & Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email, poste..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
          />
        </div>
        <Button variant="outline" size="md" className="gap-2">
           <Filter size={16} />
           Filtres
        </Button>
      </div>

      {/* Staff Table Professionnelle */}
      <Card className="overflow-hidden border-slate-200 shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Collaborateur</TableHead>
              <TableHead>Poste & Type</TableHead>
              <TableHead>Rémunération</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff?.map((member: any) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar fallback={member.user.email} className="h-10 w-10" />
                    <div>
                      <p className="font-bold text-slate-900">{member.user.email.split('@')[0]}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                         <Mail size={10} /> {member.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-700">{member.role}</p>
                    <Badge variant="outline" className="mt-1 border-slate-200 bg-slate-50 text-slate-500 lowercase">
                       {member.contractType || 'CDI'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-black text-slate-900 text-sm tracking-tight">
                    {(Number(member.salary) || 0).toLocaleString()} F
                    <span className="text-[10px] text-slate-400 ml-1 font-bold">/ mois</span>
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="success" className="gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    En poste
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" className="hover:bg-indigo-50 rounded-xl">
                      <MoreHorizontal size={18} />
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
};

const HRStatCard = ({ label, value, trend, icon: Icon, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <Card className="hover:border-indigo-200 transition-colors group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          <Badge variant="success" className="py-1 px-3">
             {trend}
          </Badge>
        </div>
        <div className="mt-6">
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const HRSkeleton = () => (
  <div className="space-y-8 animate-pulse pb-16">
    <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
    <div className="grid grid-cols-3 gap-6">
       {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl"></div>)}
    </div>
    <div className="h-[500px] w-full bg-slate-100 rounded-2xl border border-slate-200"></div>
  </div>
);

export default HRPage;
