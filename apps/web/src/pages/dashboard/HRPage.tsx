import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Users, UserPlus, Search, Filter, MoreHorizontal, Mail, 
  Award, ChevronRight, Hash, FileText, Briefcase, DollarSign,
  TrendingUp, PieChart as PieIcon, Phone, MapPin, Calendar,
  CreditCard, CheckCircle2, ShieldCheck, Trash2, Edit, Sparkles,
  Lock, MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { Avatar } from '../../shared/ui/components/Avatar';
import { Skeleton } from '../../shared/ui/components/Skeleton';
import { Sheet } from '../../shared/ui/components/Sheet';
import { Input } from '../../shared/ui/components/Input';
import { Select } from '../../shared/ui/components/Select';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';
import { useCurrentSchool } from '../../shared/hooks/useCurrentSchool';

import { useToastStore } from '../../shared/store/useToastStore';

const HRPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const { currentSchool, currentSchoolId } = useCurrentSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // État du formulaire
  const [newStaff, setNewStaff] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    contractType: 'CDI',
    salary: 0,
    systemRole: 'ENSEIGNANT'
  });

  // 2. Fetch Staff List
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff', currentSchoolId],
    enabled: !!currentSchoolId,
    queryFn: async () => {
      const { data } = await api.get(`/hr/school/${currentSchoolId}`);
      return data;
    }
  });

  // 3. Mutation de création
  const createStaffMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!currentSchoolId) {
        throw new Error('Aucun établissement actif');
      }

      const normalizedPayload = {
        ...payload,
        email: payload.email.trim().toLowerCase(),
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        role: payload.role.trim(),
        salary: Number(payload.salary) || 0,
      };

      if (normalizedPayload.salary < 0) {
        throw new Error('Le salaire ne peut pas être négatif');
      }

      return api.post('/hr/create', { ...normalizedPayload, schoolId: currentSchoolId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', currentSchoolId] });
      setIsAddSheetOpen(false);
      setNewStaff({ 
        email: '', 
        firstName: '', 
        lastName: '', 
        role: '', 
        contractType: 'CDI', 
        salary: 0, 
        systemRole: 'ENSEIGNANT' 
      });
      addToast('Collaborateur recruté avec succès ! Ses accès ont été générés.', 'success');
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Erreur lors du recrutement', 'error');
    }
  });

  const filteredStaff = staff?.filter((s: any) => 
    `${s.user.firstName} ${s.user.lastName} ${s.user.email} ${s.role}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && currentSchoolId) return <HRSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Registre du <span className="text-brand-600 italic">Personnel</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {currentSchool?.name || 'Gestion RH...'}
          </p>
        </div>
        <Button size="sm" className="gap-2 shadow-indigo h-11 px-5" onClick={() => setIsAddSheetOpen(true)}>
          <UserPlus size={16} />
          <span>Nouveau Collaborateur</span>
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un collaborateur (nom, email, poste)..." 
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-none shadow-soft focus:ring-4 focus:ring-brand-500/10 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Collaborateur</TableHead>
              <TableHead>Poste & Contrat</TableHead>
              <TableHead>Salaire Net</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff?.map((member: any) => (
              <TableRow key={member.id} className="group cursor-pointer" onClick={() => setSelectedStaff(member)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar fallback={member.user.firstName || member.user.email} className="h-10 w-10 border-2 border-white shadow-soft text-xs" />
                    <div>
                      <p className="font-bold text-slate-900">
                        {member.user.firstName && member.user.lastName 
                          ? `${member.user.firstName} ${member.user.lastName}` 
                          : member.user.email.split('@')[0]}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{member.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   <p className="text-xs font-bold text-slate-700">{member.role}</p>
                   <Badge variant="outline" className="mt-1 lowercase text-[9px]">{member.contractType}</Badge>
                </TableCell>
                <TableCell>
                  <p className="font-black text-slate-900 tracking-tight">{(Number(member.salary) || 0).toLocaleString()} F</p>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300"><MoreVertical size={16} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Staff Sheet */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Recruter"
        description="Enregistrement nouveau collaborateur"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddSheetOpen(false)}>Annuler</Button>
            <Button 
              className="flex-1 shadow-indigo" 
              loading={createStaffMutation.isPending}
              onClick={() => {
                const firstName = newStaff.firstName.trim();
                const lastName = newStaff.lastName.trim();
                const email = newStaff.email.trim();
                const role = newStaff.role.trim();

                if (!firstName || !lastName || !email || !role) {
                  addToast('Veuillez remplir tous les champs obligatoires', 'warning');
                  return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  addToast('Adresse email invalide', 'warning');
                  return;
                }
                if ((Number(newStaff.salary) || 0) < 0) {
                  addToast('Le salaire ne peut pas être négatif', 'warning');
                  return;
                }
                createStaffMutation.mutate({
                  ...newStaff,
                  firstName,
                  lastName,
                  email,
                  role,
                });
              }}
            >
              Enregistrer Contrat
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" placeholder="ex: Moussa" value={newStaff.firstName} onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})} />
              <Input label="Nom" placeholder="ex: Diop" value={newStaff.lastName} onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})} />
           </div>
           <Input label="Email Professionnel" placeholder="nom@ecole.sn" value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} />
           <Input label="Poste" placeholder="ex: Enseignant SVT" value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})} />
           <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Contrat" 
                options={[
                  {label:'CDI', value:'CDI'}, 
                  {label:'CDD', value:'CDD'},
                  {label:'Prestataire', value:'PRESTATAIRE'},
                  {label:'Stagiaire', value:'STAGIAIRE'}
                ]} 
                value={newStaff.contractType} 
                onChange={(e) => setNewStaff({...newStaff, contractType: e.target.value})} 
              />
              <Input label="Salaire" type="number" value={newStaff.salary} onChange={(e) => setNewStaff({...newStaff, salary: Number(e.target.value)})} />
           </div>
           <Select 
             label="Rôle Système" 
             options={[
               {label:'Enseignant', value:'ENSEIGNANT'}, 
               {label:'Comptable', value:'COMPTABLE'},
               {label:'Directeur', value:'DIRECTEUR'}
             ]} 
             value={newStaff.systemRole} 
             onChange={(e) => setNewStaff({...newStaff, systemRole: e.target.value as any})} 
           />
        </div>
      </Sheet>
    </div>
  );
};

const HRSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
    <Skeleton className="h-[500px] w-full rounded-2xl" />
  </div>
);

export default HRPage;
