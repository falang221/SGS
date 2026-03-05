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
import { useAuthStore } from '../../shared/store/useAuthStore';
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

const HRPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // État du formulaire
  const [newStaff, setNewStaff] = useState({
    email: '',
    role: '',
    contractType: 'CDI',
    salary: 0,
    systemRole: 'ENSEIGNANT'
  });

  // 1. Récupération de l'école
  const { data: schools } = useQuery({
    queryKey: ['my-schools-hr', user?.tenantId],
    queryFn: async () => {
      const { data } = await api.get(`/school/tenant/${user?.tenantId}`);
      return data;
    },
    enabled: !!user?.tenantId
  });

  const currentSchoolId = schools?.[0]?.id;

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
      return api.post('/hr/create', { ...payload, schoolId: currentSchoolId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', currentSchoolId] });
      setIsAddSheetOpen(false);
      setNewStaff({ email: '', role: '', contractType: 'CDI', salary: 0, systemRole: 'ENSEIGNANT' });
      alert('Collaborateur recruté avec succès ! Ses accès ont été générés.');
    }
  });

  const filteredStaff = staff?.filter((s: any) => 
    `${s.user.email} ${s.role}`.toLowerCase().includes(searchTerm.toLowerCase())
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
            {schools?.[0]?.name || 'Gestion RH...'}
          </p>
        </div>
        <Button size="sm" className="gap-2 shadow-indigo h-11 px-5" onClick={() => setIsAddSheetOpen(true)}>
          <UserPlus size={16} />
          <span>Nouveau Collaborateur</span>
        </Button>
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
                    <Avatar fallback={member.user.email} className="h-10 w-10 border-2 border-white shadow-soft" />
                    <div>
                      <p className="font-bold text-slate-900">{member.user.email.split('@')[0]}</p>
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
              onClick={() => createStaffMutation.mutate(newStaff)}
            >
              Enregistrer Contrat
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
           <Input label="Email Professionnel" placeholder="nom@ecole.sn" value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} />
           <Input label="Poste" placeholder="ex: Enseignant SVT" value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})} />
           <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Contrat" 
                options={[{label:'CDI', value:'CDI'}, {label:'CDD', value:'CDD'}]} 
                value={newStaff.contractType} 
                onChange={(e) => setNewStaff({...newStaff, contractType: e.target.value})} 
              />
              <Input label="Salaire" type="number" value={newStaff.salary} onChange={(e) => setNewStaff({...newStaff, salary: Number(e.target.value)})} />
           </div>
           <Select 
             label="Rôle Système" 
             options={[{label:'Enseignant', value:'ENSEIGNANT'}, {label:'Comptable', value:'COMPTABLE'}]} 
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
