import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  BookOpen, Calculator, FileText, Save, 
  TrendingUp, Sparkles, CheckCircle2, History, Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Select } from '../../shared/ui/components/Select';
import { Badge } from '../../shared/ui/components/Badge';
import { Skeleton } from '../../shared/ui/components/Skeleton';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';
import { Avatar } from '../../shared/ui/components/Avatar';

const GradesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';
  
  // Context state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestre 1');
  const [selectedType, setSelectedType] = useState('DEVOIR');
  
  // Input state
  const [gradeValues, setGradeValues] = useState<Record<string, string>>({});
  const [showRanking, setShowRanking] = useState(false);

  // 1. Fetch Classes
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/academic/classes/${schoolId}`);
      return data;
    }
  });

  // 2. Fetch Subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/academic/subjects/${schoolId}`);
      return data;
    }
  });

  // 3. Fetch Students for the selected class
  const { data: students, isLoading } = useQuery({
    queryKey: ['students-grades', selectedClass],
    enabled: !!selectedClass,
    queryFn: async () => {
      // In a real app, the API should filter by classId
      const { data } = await api.get(`/students/school/${schoolId}`);
      return data;
    }
  });

  // 4. Fetch Class Ranking (Calculated on backend)
  const { data: ranking, isLoading: isRankingLoading } = useQuery({
    queryKey: ['class-ranking', selectedClass, selectedPeriod],
    enabled: !!selectedClass && showRanking,
    queryFn: async () => {
      const { data } = await api.get(`/grades/ranking/${selectedClass}?period=${selectedPeriod}`);
      return data;
    }
  });

  const batchSubmitMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/grades/batch-submit', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-ranking', selectedClass] });
      setGradeValues({});
      alert('Toutes les notes ont été enregistrées et les parents ont été notifiés.');
    }
  });

  const handleGradeInputChange = (enrollmentId: string, value: string) => {
    // Basic validation for UI feedback
    setGradeValues(prev => ({ ...prev, [enrollmentId]: value }));
  };

  const handleSaveAll = () => {
    if (!selectedSubject || !selectedClass) return;

    const gradesToSubmit = Object.entries(gradeValues)
      .filter(([_, val]) => val !== '')
      .map(([enrollmentId, val]) => ({
        enrollmentId,
        value: parseFloat(val),
        coeff: subjects?.find((s: any) => s.id === selectedSubject)?.coefficient || 1
      }));

    if (gradesToSubmit.length === 0) return;

    batchSubmitMutation.mutate({
      subjectId: selectedSubject,
      classId: selectedClass,
      period: selectedPeriod,
      type: selectedType,
      yearId: '2024-2025',
      grades: gradesToSubmit
    });
  };

  const currentSessionStats = useMemo(() => {
    const values = Object.values(gradeValues)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return { avg: 0, count: 0, passRate: 0 };
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const passCount = values.filter(v => v >= 10).length;
    
    return {
      avg: avg.toFixed(2),
      count: values.length,
      passRate: Math.round((passCount / values.length) * 100)
    };
  }, [gradeValues]);

  if (isLoading) return <GradesSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-100/50">
             <Calculator size={14} className="text-brand-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Gestion Académique &bull; Saisie Digitale</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Registre des <span className="text-brand-600 italic">Évaluations</span><span className="text-brand-300">.</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Saisissez les notes et générez les classements en temps réel.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" className="gap-2 hidden sm:flex">
              <History size={16} />
              <span>Historique</span>
           </Button>
           <Button 
             className="gap-2 shadow-indigo" 
             onClick={handleSaveAll} 
             loading={batchSubmitMutation.isPending}
             disabled={Object.keys(gradeValues).length === 0}
           >
              <Save size={16} />
              <span>Enregistrer la session</span>
           </Button>
        </div>
      </div>

      {/* Configuration de la Session */}
      <Card className="border-none shadow-soft overflow-visible">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             <Select 
               label="Établissement / Classe" 
               options={classes?.map((c: any) => ({ label: c.name, value: c.id })) || []} 
               value={selectedClass}
               onChange={(e) => setSelectedClass(e.target.value)}
             />
             <Select 
               label="Matière" 
               options={subjects?.map((s: any) => ({ label: `${s.name} (Coeff ${s.coefficient})`, value: s.id })) || []} 
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
             <Select 
               label="Type d'évaluation" 
               options={[
                 { label: 'Devoir de classe', value: 'DEVOIR' },
                 { label: 'Composition', value: 'COMPOSITION' },
                 { label: 'Test rapide', value: 'TEST' }
               ]} 
               value={selectedType}
               onChange={(e) => setSelectedType(e.target.value)}
             />
          </div>
        </CardContent>
      </Card>

      {/* Live Stats Bar */}
      {currentSessionStats.count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            <div className="bg-brand-600 p-6 rounded-2xl text-white shadow-indigo flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Moyenne Session</p>
                  <p className="text-3xl font-black mt-1 tracking-tighter">{currentSessionStats.avg} <span className="text-xs opacity-50">/ 20</span></p>
               </div>
               <TrendingUp size={32} className="opacity-20" />
            </div>
            <div className="bg-emerald-500 p-6 rounded-2xl text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Taux de Réussite</p>
                  <p className="text-3xl font-black mt-1 tracking-tighter">{currentSessionStats.passRate}%</p>
               </div>
               <CheckCircle2 size={32} className="opacity-20" />
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-heavy flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Saisies effectuées</p>
                  <p className="text-3xl font-black mt-1 tracking-tighter">{currentSessionStats.count} / {students?.length || 0}</p>
               </div>
               <Activity size={32} className="opacity-20" />
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Grade Table */}
        <div className="xl:col-span-8">
          <Card className="border-none shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">Identité Élève</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead className="text-center">Note / 20</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student: any) => {
                  const enrollmentId = student.enrollments[0]?.id;
                  const currentVal = gradeValues[enrollmentId] || '';
                  const numVal = parseFloat(currentVal);
                  
                  return (
                    <TableRow key={student.id} className="group transition-all">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar fallback={student.firstName} className="h-10 w-10" />
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{student.firstName} {student.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Élève Actif</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-100 text-slate-400 font-black">{student.matricule}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <input 
                            type="number" min="0" max="20" step="0.25" placeholder="--"
                            value={currentVal}
                            onChange={(e) => handleGradeInputChange(enrollmentId, e.target.value)}
                            className={`w-20 text-center py-3 rounded-xl font-black text-lg outline-none transition-all border-2 ${
                              currentVal !== '' 
                                ? numVal >= 10 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                                : "bg-slate-50 border-transparent text-slate-400 focus:bg-white focus:border-brand-200"
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {currentVal !== '' ? (
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={numVal >= 10 ? 'success' : 'destructive'} className="font-black text-[9px] uppercase">
                              {numVal >= 16 ? 'Excellent' : numVal >= 12 ? 'Bien' : numVal >= 10 ? 'Passable' : 'Médiocre'}
                            </Badge>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                              Automatique
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest italic animate-pulse">En attente...</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {!selectedClass && (
              <div className="py-32 text-center bg-slate-50/50">
                 <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft border border-slate-100">
                    <BookOpen size={32} className="text-slate-200" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900">Aucune classe sélectionnée</h3>
                 <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto">Veuillez choisir une classe et une matière pour commencer la saisie.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Tactical Panel: Ranking & Insights */}
        <div className="xl:col-span-4 space-y-8">
           <Card className="border-none shadow-soft bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Trophy size={16} className="text-amber-500" />
                    Classement Live
                 </CardTitle>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="text-[10px] font-black uppercase tracking-widest text-brand-600"
                   onClick={() => setShowRanking(!showRanking)}
                 >
                   {showRanking ? 'Masquer' : 'Afficher'}
                 </Button>
              </CardHeader>
              <CardContent className="pt-4">
                 {!showRanking ? (
                   <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400">Le classement est calculé sur l'ensemble des notes de la période.</p>
                   </div>
                 ) : isRankingLoading ? (
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                   </div>
                 ) : (
                   <div className="space-y-3">
                      {ranking?.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                             i === 0 ? 'bg-amber-100 text-amber-700 shadow-sm shadow-amber-500/20' : 
                             i === 1 ? 'bg-slate-100 text-slate-600' :
                             i === 2 ? 'bg-orange-50 text-orange-700' : 'text-slate-400'
                           }`}>
                             {r.rank}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate leading-none">{r.studentName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">Moyenne: {r.average}/20</p>
                           </div>
                           {i === 0 && <Sparkles size={14} className="text-amber-400 animate-pulse" />}
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="bg-[#0F172A] p-8 rounded-3xl text-white relative overflow-hidden shadow-heavy group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <FileText size={80} />
              </div>
              <div className="relative z-10">
                 <h4 className="text-lg font-black tracking-tight mb-4 italic">Génération des Bulletins</h4>
                 <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                   Une fois la saisie terminée, vous pouvez lancer la génération automatique des bulletins PDF pour toute la classe.
                 </p>
                 <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 uppercase font-black text-[10px] tracking-widest py-4">
                    Lancer l'impression massive
                 </Button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const GradesSkeleton = () => (
  <div className="space-y-10 animate-slow-fade">
    <div className="flex justify-between items-end">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
    <Skeleton className="h-24 w-full rounded-2xl" />
    <div className="grid grid-cols-12 gap-8">
       <Skeleton className="col-span-8 h-[600px] rounded-2xl" />
       <Skeleton className="col-span-4 h-[400px] rounded-2xl" />
    </div>
  </div>
);

function Activity(props: any) {
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
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export default GradesPage;
