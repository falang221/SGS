import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Search, UserPlus, FileDown, MoreHorizontal, 
  Camera, Mail, Calendar, Hash, Filter, ArrowUpDown,
  GraduationCap, MapPin, X, ChevronRight, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Badge } from '../../shared/ui/components/Badge';
import { Avatar } from '../../shared/ui/components/Avatar';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';

const StudentListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Simulation d'un schoolId (à récupérer dynamiquement normalement)
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/students/school/${schoolId}`);
      return data;
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ studentId, file }: { studentId: string, file: File }) => {
      const formData = new FormData();
      formData.append('photo', file);
      return api.post(`/students/${studentId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
    }
  });

  const handlePhotoUpload = (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadPhotoMutation.mutate({ studentId, file: e.target.files[0] });
    }
  };

  const filteredStudents = students?.filter((s: any) => 
    `${s.firstName} ${s.lastName} ${s.matricule}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <StudentListSkeleton />;

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
             <GraduationCap size={12} />
             Gestion des effectifs
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Annuaire <span className="text-indigo-600">Élèves</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Consultez et gérez les dossiers de tous les élèves inscrits.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <Link to="/dashboard/students/import">
             <Button variant="outline" className="gap-2">
                <FileDown size={16} />
                <span>Import CSV</span>
             </Button>
           </Link>
           <Button className="gap-2 shadow-indigo">
              <UserPlus size={16} />
              <span>Nouvel Élève</span>
           </Button>
        </div>
      </div>

      {/* Barre de recherche & Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, matricule..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="md" className="gap-2">
             <Filter size={16} />
             Filtres
           </Button>
           <Button variant="outline" size="md" className="gap-2">
             <ArrowUpDown size={16} />
             Trier
           </Button>
        </div>
      </div>

      {/* Table Professionnelle */}
      <Card className="overflow-hidden border-slate-200 shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Identité</TableHead>
              <TableHead>Matricule & Naissance</TableHead>
              <TableHead>Classe Actuelle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents?.map((student: any) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                       <Avatar 
                        src={student.photoUrl} 
                        fallback={`${student.firstName[0]}${student.lastName[0]}`} 
                        className="h-12 w-12 rounded-xl group-hover/avatar:ring-2 ring-indigo-500 ring-offset-2 transition-all"
                       />
                       <label className="absolute -bottom-1 -right-1 h-6 w-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                          <Camera size={12} />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(student.id, e)} />
                       </label>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Élève</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="info" className="gap-1 border-none bg-indigo-50 text-indigo-700">
                      <Hash size={10} /> {student.matricule}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Calendar size={12} />
                      {new Date(student.birthDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-700">{student.enrollments?.[0]?.class?.name || 'Non inscrit'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.enrollments?.[0]?.yearId || 'N/A'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Actif</Badge>
                </TableCell>
                <TableCell className="text-right">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl"
                   >
                      <MoreHorizontal size={18} />
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredStudents?.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Search className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-900 font-bold">Aucun résultat</p>
            <p className="text-slate-400 text-sm mt-1">Essayez d'ajuster vos critères de recherche.</p>
          </div>
        )}
      </Card>

      {/* Modal Détail Élève */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
            >
               <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <Avatar 
                      src={selectedStudent.photoUrl} 
                      fallback={`${selectedStudent.firstName[0]}${selectedStudent.lastName[0]}`}
                      className="h-20 w-20 border-2 border-white/10"
                    />
                    <div>
                       <h3 className="text-2xl font-black">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                       <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mt-1">Matricule: {selectedStudent.matricule}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="text-white/40 hover:text-white transition-colors">
                     <X size={24} />
                  </button>
               </div>
               
               <div className="p-8">
                  <div className="grid grid-cols-2 gap-8">
                     <DetailRow icon={Calendar} label="Date de Naissance" value={new Date(selectedStudent.birthDate).toLocaleDateString('fr-FR')} />
                     <DetailRow icon={MapPin} label="Ville / Adresse" value="Dakar, Sénégal" />
                     <DetailRow icon={User} label="Parent / Tuteur" value={selectedStudent.parent?.firstName || 'M. Diop (Père)'} />
                     <DetailRow icon={GraduationCap} label="Année Scolaire" value="2024-2025" />
                  </div>

                  <div className="mt-12 flex gap-4">
                     <Button className="flex-1 py-6 gap-2">
                        Modifier le profil
                        <ChevronRight size={16} />
                     </Button>
                     <Button variant="outline" className="flex-1 py-6">
                        Voir les notes
                     </Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DetailRow = ({ icon: Icon, label, value }: any) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      <Icon size={14} className="text-indigo-500" />
      {label}
    </div>
    <p className="font-bold text-slate-900">{value}</p>
  </div>
);

const StudentListSkeleton = () => (
  <div className="space-y-8 animate-pulse pb-16">
    <div className="flex justify-between items-center">
      <div className="space-y-3">
        <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-12 w-32 bg-slate-100 rounded-xl"></div>
        <div className="h-12 w-40 bg-indigo-50 rounded-xl"></div>
      </div>
    </div>
    <div className="h-14 w-full bg-slate-50 rounded-xl"></div>
    <div className="h-[500px] w-full bg-slate-100 rounded-2xl"></div>
  </div>
);

export default StudentListPage;
