import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Building2, Plus, Search, ShieldCheck, Globe, 
  ChevronRight, MoreVertical, Users,
  Sparkles, School as SchoolIcon,
  Mail, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { Skeleton } from '../../shared/ui/components/Skeleton';
import { Sheet } from '../../shared/ui/components/Sheet';
import { Input } from '../../shared/ui/components/Input';
import { Select } from '../../shared/ui/components/Select';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';

const TenantsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'FREE',
    adminEmail: '',
    adminPassword: ''
  });

  // 1. Fetch all tenants
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await api.get('/tenants');
      return data;
    }
  });

  const createTenantMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/tenants/create', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsAddSheetOpen(false);
      setFormData({ name: '', slug: '', plan: 'FREE', adminEmail: '', adminPassword: '' });
      alert('Établissement créé avec succès ! Le directeur a été notifié.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.adminEmail) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    createTenantMutation.mutate(formData);
  };

  const filteredTenants = tenants?.filter((t: any) => 
    `${t.name} ${t.slug}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <TenantsSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-100/50">
             <ShieldCheck size={14} className="text-brand-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Administration Système &bull; Multi-Tenant</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Gestion des <span className="text-brand-600 italic">Établissements</span><span className="text-brand-300">.</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Supervisez les groupes scolaires et gérez les abonnements SaaS.
          </p>
        </div>
        
        <Button size="sm" className="gap-2 shadow-indigo h-11 px-5" onClick={() => setIsAddSheetOpen(true)}>
          <Plus size={16} />
          <span>Ajouter un Groupe</span>
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Groupes Actifs" value={tenants?.length || 0} icon={Building2} trend="SaaS Global" color="brand" unit="Groupes" />
        <StatCard label="Écoles Total" value={tenants?.reduce((acc: number, t: any) => acc + t._count.schools, 0) || 0} icon={SchoolIcon} trend="+3 ce mois" color="emerald" unit="Établissements" />
        <StatCard label="Utilisateurs Total" value={tenants?.reduce((acc: number, t: any) => acc + t._count.users, 0) || 0} icon={Users} trend="Croissance" color="violet" unit="Comptes" />
      </div>

      {/* Main List */}
      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 pb-6">
           <div>
              <CardTitle className="text-lg font-black">Répertoire des Clients</CardTitle>
              <p className="text-xs text-slate-400 font-medium mt-1">Liste exhaustive des tenants enregistrés</p>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                placeholder="Rechercher un groupe..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium w-64 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
           </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Groupe Scolaire</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Écoles</TableHead>
              <TableHead>Utilisateurs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants?.map((tenant: any) => (
              <TableRow key={tenant.id} className="group transition-all">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                       {tenant.name.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{tenant.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                         <Globe size={10} /> {tenant.slug}.sgs.sn
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant={tenant.plan === 'ENTERPRISE' ? 'info' : 'secondary'} className="font-black text-[9px] uppercase tracking-tighter">
                      {tenant.plan}
                   </Badge>
                </TableCell>
                <TableCell>
                   <p className="text-sm font-bold text-slate-700">{tenant._count.schools} écoles</p>
                </TableCell>
                <TableCell>
                   <p className="text-sm font-bold text-slate-700">{tenant._count.users} comptes</p>
                </TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-slate-600">
                      <MoreVertical size={16} />
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Tenant Sheet */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Nouveau Groupe Scolaire"
        description="Configuration d'un nouveau client SaaS"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddSheetOpen(false)}>Annuler</Button>
            <Button 
              className="flex-1 shadow-indigo" 
              onClick={handleSubmit}
              loading={createTenantMutation.isPending}
            >
              Créer Établissement
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
           <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex gap-4">
              <Sparkles size={24} className="text-brand-600 shrink-0" />
              <p className="text-xs text-brand-800 font-medium leading-relaxed">
                La création d'un groupe génère automatiquement un **Administrateur Principal** et une base de données isolée.
              </p>
           </div>
           <Input 
             label="Nom du Groupe / École" 
             placeholder="ex: Institut Sainte Marie" 
             value={formData.name}
             onChange={(e) => setFormData({...formData, name: e.target.value})}
           />
           <Input 
             label="Sous-domaine (Slug)" 
             placeholder="ex: ism-dakar" 
             leftIcon={<Globe size={16} />} 
             value={formData.slug}
             onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
           />
           <Select 
             label="Plan d'Abonnement" 
             options={[
               { label: 'Gratuit (Free)', value: 'FREE' },
               { label: 'Basique', value: 'BASIC' },
               { label: 'Premium', value: 'PREMIUM' },
               { label: 'Entreprise', value: 'ENTERPRISE' }
             ]} 
             value={formData.plan}
             onChange={(e) => setFormData({...formData, plan: e.target.value})}
           />
           <div className="h-px bg-slate-100 my-4" />
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Compte Directeur (Premier Accès)</h4>
           <Input 
             label="Email de l'Administrateur" 
             placeholder="directeur@ecole.sn" 
             leftIcon={<Mail size={16} />}
             value={formData.adminEmail}
             onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
           />
           <Input 
             label="Mot de passe provisoire" 
             type="password" 
             placeholder="••••••••" 
             leftIcon={<Lock size={16} />}
             value={formData.adminPassword}
             onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
           />
        </div>
      </Sheet>

    </div>
  );
};

const StatCard = ({ label, value, trend, icon: Icon, color, unit }: any) => {
  const colors: any = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
    violet: 'bg-violet-50 text-violet-600 border-violet-100/50',
  };
  const accent: any = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
  };

  return (
    <Card className="border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden">
      <CardContent className="p-8">
        <div className="flex justify-between items-start">
          <div className={`p-4 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={28} />
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black border-none bg-slate-100 text-slate-500">
             {trend}
          </Badge>
        </div>
        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">
              {value}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase">{unit}</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
            <span className={`w-1 h-1 rounded-full ${accent[color] || accent.brand}`} />
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const TenantsSkeleton = () => (
  <div className="space-y-10 animate-pulse">
    <div className="flex justify-between items-end">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-12 w-40" />
    </div>
    <div className="grid grid-cols-3 gap-6">
       {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
    </div>
    <Skeleton className="h-[500px] w-full rounded-2xl" />
  </div>
);

export default TenantsPage;
