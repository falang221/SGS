import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  BookOpen, Calculator, FileText, Save, Search, 
  GraduationCap, Award, TrendingUp, Sparkles, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Select } from '../../shared/ui/components/Select';
import { Badge } from '../../shared/ui/components/Badge';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';
import { Avatar } from '../../shared/ui/components/Avatar';

const GradesPage: React.FC = () => {
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestre 1');
  const [selectedType, setSelectedType] = useState('Devoir');
  const [grades, setGrades] = useState<Record<string, number>>({});

  // 1. Récupération des Classes
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/academic/classes/${schoolId}`);
      return data;
    }
  });

  // 2. Récupération des Matières
  const { data: subjects } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/academic/subjects/${schoolId}`);
      return data;
    }
  });

  // 3. Récupération des élèves de la classe
  const { data: students, isLoading } = useQuery({
    queryKey: ['students-grades', selectedClass],
    enabled: !!selectedClass,
    queryFn: async () => {
      const { data } = await api.get(`/students/school/${schoolId}`); // Idéalement filter par classe
      return data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/grades/submit', payload);
    },
    onSuccess: () => {
      // Toast Succès
    }
  });

  const handleGradeChange = (enrollmentId: string, value: string) => {
    const val = parseFloat(value);
    if (!isNaN(val) && val >= 0 && val <= 20) {
      setGrades(prev => ({ ...prev, [enrollmentId]: val }));
    } else if (value === '') {
       setGrades(prev => {
         const newGrades = { ...prev };
         delete newGrades[enrollmentId];
         return newGrades;
       });
    }
  };

  const saveGrades = () => {
    Object.entries(grades).forEach(([enrollmentId, value]) => {
      submitMutation.mutate({
        enrollmentId,
        subjectId: selectedSubject,
        value,
        coeff: 1, // À récupérer de la matière
        period: selectedPeriod,
        type: selectedType
      });
    });
  };

  if (isLoading) return <GradesSkeleton />;

  const currentAverage = Object.values(grades).length > 0 
    ? (Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length).toFixed(2)
    : "---";

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
             <Award size={12} />
             Gestion Pédagogique
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Saisie des <span className="text-indigo-600">Notes</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Évaluez vos élèves et suivez les performances de la classe.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <Button variant="outline" className="gap-2">
              <FileText size={16} />
              <span>Bulletins</span>
           </Button>
           <Button className="gap-2 shadow-indigo" onClick={saveGrades} loading={submitMutation.isPending}>
              <Save size={16} />
              <span>Enregistrer</span>
           </Button>
        </div>
      </div>

      {/* Selecteurs de Contexte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Select 
           label="Classe" 
           options={classes?.map((c: any) => ({ label: c.name, value: c.id })) || []} 
           value={selectedClass}
           onChange={(e) => setSelectedClass(e.target.value)}
         />
         <Select 
           label="Matière" 
           options={subjects?.map((s: any) => ({ label: s.name, value: s.id })) || []} 
           value={selectedSubject}
           onChange={(e) => setSelectedSubject(e.target.value)}
         />
         <Select 
           label="Période" 
           options={[
             { label: 'Trimestre 1', value: 'Trimestre 1' },
             { label: 'Trimestre 2', value: 'Trimestre 2' },
             { label: 'Trimestre 3', value: 'Trimestre 3' }
           ]} 
           value={selectedPeriod}
           onChange={(e) => setSelectedPeriod(e.target.value)}
         />
         <div className="bg-indigo-600 p-4 rounded-xl text-white shadow-indigo flex flex-col justify-center">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">Moyenne Session</p>
            <div className="flex items-baseline gap-1 mt-1">
               <span className="text-2xl font-black">{currentAverage}</span>
               <span className="text-[10px] font-bold opacity-60">/ 20</span>
            </div>
         </div>
      </div>

      {/* Grid de Saisie */}
      <Card className="overflow-hidden border-slate-200 shadow-soft">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <Calculator size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-900">Registre d'Évaluation</h3>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Sparkles size={12} className="text-amber-500 animate-pulse" />
              Saisie en cours
           </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Élève</TableHead>
              <TableHead>Matricule</TableHead>
              <TableHead className="text-center">Note ( / 20 )</TableHead>
              <TableHead className="text-right">Appréciation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student: any) => {
              const enrollmentId = student.enrollments[0]?.id;
              const currentGrade = grades[enrollmentId];
              
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar 
                        fallback={`${student.firstName[0]}${student.lastName[0]}`} 
                        className="h-9 w-9"
                      />
                      <p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="border-none text-slate-400">
                        {student.matricule}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="flex justify-center">
                        <input 
                          type="number" min="0" max="20" step="0.25" placeholder="--"
                          onChange={(e) => handleGradeChange(enrollmentId, e.target.value)}
                          className={`w-16 text-center py-2 rounded-lg font-black text-base outline-none transition-all border-2 ${
                            currentGrade !== undefined 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                              : "bg-slate-50 border-transparent text-slate-400 focus:bg-white focus:border-indigo-100"
                          }`}
                        />
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                     {currentGrade !== undefined ? (
                        <Badge variant={currentGrade >= 10 ? 'success' : 'danger'}>
                           {currentGrade >= 15 ? 'Excellent' : currentGrade >= 10 ? 'Admis' : 'Insuffisant'}
                        </Badge>
                     ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Attente...</span>
                     )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Info Panel */}
      <Card className="bg-slate-900 border-none shadow-heavy overflow-hidden">
        <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10">
                 <TrendingUp size={32} />
              </div>
              <div className="text-white">
                 <h4 className="text-xl font-bold tracking-tight">Analyse de Performance</h4>
                 <p className="text-slate-400 text-sm mt-1 max-w-md">
                   Les parents recevront une notification automatique dès que vous aurez cliqué sur "Enregistrer".
                 </p>
              </div>
           </div>
           <div className="flex gap-3">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Analyse Classe</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo">Partager Rapport</Button>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const GradesSkeleton = () => (
  <div className="space-y-8 animate-pulse pb-16">
    <div className="flex justify-between items-center">
      <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
      <div className="h-12 w-48 bg-indigo-50 rounded-xl"></div>
    </div>
    <div className="grid grid-cols-4 gap-6">
       {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>)}
    </div>
    <div className="h-[500px] w-full bg-slate-100 rounded-2xl"></div>
  </div>
);

export default GradesPage;
