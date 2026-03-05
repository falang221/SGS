import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Search, UserPlus, FileDown, MoreHorizontal, 
  Hash, GraduationCap,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { Card } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { Avatar } from '../../shared/ui/components/Avatar';
import { Skeleton } from '../../shared/ui/components/Skeleton';
import { Sheet } from '../../shared/ui/components/Sheet';
import { Input } from '../../shared/ui/components/Input';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';

const StudentListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // État du formulaire
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    matricule: '',
    birthDate: ''
  });

  // Récupération de l'école (On prend la première école du tenant pour l'instant)
  const { data: schools } = useQuery({
    queryKey: ['my-schools', user?.tenantId],
    queryFn: async () => {
      const { data } = await api.get(`/school/tenant/${user?.tenantId}`);
      return data;
    },
    enabled: !!user?.tenantId
  });

  const currentSchoolId = schools?.[0]?.id;

  // 1. Liste des élèves
  const { data: students, isLoading } = useQuery({
    queryKey: ['students', currentSchoolId],
    enabled: !!currentSchoolId,
    queryFn: async () => {
      const { data } = await api.get(`/students/school/${currentSchoolId}`);
      return data;
    }
  });

  // 2. Mutation de création
  const createStudentMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/students/create', { ...payload, schoolId: currentSchoolId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', currentSchoolId] });
      setIsAddSheetOpen(false);
      setNewStudent({ firstName: '', lastName: '', matricule: '', birthDate: '' });
      alert('Élève inscrit avec succès !');
    }
  });

  const filteredStudents = students?.filter((s: any) => 
    `${s.firstName} ${s.lastName} ${s.matricule}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && currentSchoolId) return <StudentListSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            Effectif <span className="text-brand-600">Scolaire</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            {schools?.[0]?.name || 'Chargement de l\'établissement...'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <Link to="/dashboard/students/import">
             <Button variant="outline" size="sm" className="gap-2">
                <FileDown size={16} />
                <span>Import CSV</span>
             </Button>
           </Link>
           <Button size="sm" className="gap-2 shadow-indigo" onClick={() => setIsAddSheetOpen(true)}>
              <UserPlus size={16} />
              <span>Nouvel Élève</span>
           </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, matricule..." 
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/20 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-none shadow-soft">
        {!currentSchoolId ? (
           <div className="py-24 text-center">
              <p className="text-slate-400 font-medium animate-pulse">Initialisation de l'espace école...</p>
           </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Identité</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents?.map((student: any) => (
                <TableRow key={student.id} className="group cursor-pointer" onClick={() => setSelectedStudent(student)}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar fallback={`${student.firstName[0]}${student.lastName[0]}`} className="h-10 w-10 border-2 border-white shadow-soft" />
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Né(e) le {new Date(student.birthDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" className="gap-1 border-none bg-brand-50 text-brand-700 font-black">
                      {student.matricule}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-700">{student.enrollments?.[0]?.class?.name || 'Non inscrit'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="px-3">Actif</Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                     <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl">
                        <MoreHorizontal size={18} />
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {filteredStudents?.length === 0 && currentSchoolId && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <GraduationCap className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-900 font-black text-lg">Aucun élève trouvé</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto font-medium">Commencez par inscrire votre premier élève.</p>
          </div>
        )}
      </Card>

      {/* Sheet: Ajouter un Élève */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Inscription Élève"
        description="Enregistrez un nouveau dossier académique"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddSheetOpen(false)}>Annuler</Button>
            <Button 
              className="flex-1 shadow-indigo" 
              loading={createStudentMutation.isPending}
              onClick={() => createStudentMutation.mutate(newStudent)}
            >
              Valider Inscription
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
           <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex gap-4">
              <Sparkles size={24} className="text-brand-600 shrink-0" />
              <p className="text-xs text-brand-800 font-medium leading-relaxed">
                Le matricule sera utilisé pour l'accès parent et le suivi financier.
              </p>
           </div>
           <Input label="Prénom" placeholder="ex: Amadou" value={newStudent.firstName} onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})} />
           <Input label="Nom" placeholder="ex: DIOP" value={newStudent.lastName} onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})} />
           <Input label="Matricule Unique" placeholder="ex: MAT-2024-001" leftIcon={<Hash size={16} />} value={newStudent.matricule} onChange={(e) => setNewStudent({...newStudent, matricule: e.target.value})} />
           <Input label="Date de Naissance" type="date" value={newStudent.birthDate} onChange={(e) => setNewStudent({...newStudent, birthDate: e.target.value})} />
        </div>
      </Sheet>

      {/* Sheet: Détail Élève */}
      <Sheet isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Dossier Élève">
        {selectedStudent && (
          <div className="space-y-6">
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Avatar fallback={selectedStudent.firstName} className="h-16 w-16" />
                <div>
                   <h3 className="text-xl font-black">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                   <Badge variant="info" className="mt-1">{selectedStudent.matricule}</Badge>
                </div>
             </div>
             {/* ... plus de détails ... */}
          </div>
        )}
      </Sheet>
    </div>
  );
};

const StudentListSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
    <div className="h-[500px] w-full bg-slate-100 rounded-2xl"></div>
  </div>
);

export default StudentListPage;
