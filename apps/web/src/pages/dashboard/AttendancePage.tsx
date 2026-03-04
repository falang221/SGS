import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Check, X, Clock, Save, Users, Calendar, 
  Search, Sparkles, UserCheck, BellRing, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Select } from '../../shared/ui/components/Select';
import { Avatar } from '../../shared/ui/components/Avatar';
import { Badge } from '../../shared/ui/components/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../shared/ui/components/Table';

const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  // 1. Récupération des Classes
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/academic/classes/${schoolId}`);
      return data;
    }
  });

  // 2. Récupération des Élèves
  const { data: students, isLoading } = useQuery({
    queryKey: ['students-attendance', selectedClass],
    enabled: !!selectedClass,
    queryFn: async () => {
      const { data } = await api.get(`/students/school/${schoolId}`); // Idéalement filtré par classe en backend
      return data;
    }
  });

  // 3. Stats du jour
  const { data: dailyStats } = useQuery({
    queryKey: ['attendance-stats', schoolId],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/stats/${schoolId}`);
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload: any[]) => {
      return api.post('/attendance/bulk', payload);
    },
    onSuccess: () => {
      setAttendanceData({});
      queryClient.invalidateQueries({ queryKey: ['attendance-stats', schoolId] });
      // Toast Succès
    }
  });

  const handleStatusChange = (enrollmentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [enrollmentId]: status }));
  };

  const filteredStudents = students?.filter((s: any) => 
    `${s.firstName} ${s.lastName} ${s.matricule}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = () => {
    if (!students) return;
    const payload = filteredStudents.map((s: any) => ({
      enrollmentId: s.enrollments[0]?.id,
      status: attendanceData[s.enrollments[0]?.id] || 'PRESENT',
      date: new Date().toISOString()
    })).filter((p: any) => p.enrollmentId);
    mutation.mutate(payload);
  };

  if (isLoading && selectedClass) return <AttendanceSkeleton />;

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
             <UserCheck size={12} />
             Pointage Journalier
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Appel en <span className="text-indigo-600">Direct</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
           <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-center border-r border-slate-100 pr-6">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Présents</p>
                 <p className="text-xl font-black text-emerald-600">{dailyStats?.PRESENT || 0}</p>
              </div>
              <div className="text-center">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Absents</p>
                 <p className="text-xl font-black text-rose-600">{dailyStats?.ABSENT || 0}</p>
              </div>
           </div>
           <Button className="gap-2 shadow-indigo" onClick={onSubmit} loading={mutation.isPending}>
              <Save size={16} />
              <span>Valider l'Appel</span>
           </Button>
        </div>
      </div>

      {/* Info Panel Alerte */}
      <Card className="bg-slate-900 border-none shadow-heavy overflow-hidden">
        <CardContent className="p-6 flex items-start gap-6">
           <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
              <BellRing size={24} className="animate-bounce" />
           </div>
           <div>
              <h4 className="text-white font-bold flex items-center gap-2">
                Alerte Parent Automatique
                <Sparkles className="text-amber-400" size={14} />
              </h4>
              <p className="text-slate-400 text-sm mt-1">
                Toute absence marquée déclenchera l'envoi d'une notification instantanée aux parents.
              </p>
           </div>
        </CardContent>
      </Card>

      {/* Barre de Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
           <Select 
             label="Classe" 
             options={classes?.map((c: any) => ({ label: c.name, value: c.id })) || []} 
             value={selectedClass}
             onChange={(e) => setSelectedClass(e.target.value)}
           />
        </div>
        <div className="relative flex-1 group mt-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par nom..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {!selectedClass ? (
        <Card className="border-dashed border-2 py-20 text-center">
           <CardContent>
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                 <Users size={32} />
              </div>
              <p className="text-slate-900 font-bold text-lg">Prêt pour l'appel ?</p>
              <p className="text-slate-400 text-sm mt-1">Sélectionnez une classe pour commencer le pointage.</p>
           </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200 shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Élève</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead className="text-center">Statut de Présence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents?.map((student: any) => {
                const enrollmentId = student.enrollments[0]?.id;
                const currentStatus = attendanceData[enrollmentId] || 'PRESENT';

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={`${student.firstName[0]}${student.lastName[0]}`} className="h-9 w-9" />
                        <p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="border-none text-slate-400">
                          <Hash size={10} className="mr-1" /> {student.matricule}
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <AttendanceButton 
                          active={currentStatus === 'PRESENT'} 
                          onClick={() => handleStatusChange(enrollmentId, 'PRESENT')}
                          icon={Check} color="emerald" label="Présent"
                        />
                        <AttendanceButton 
                          active={currentStatus === 'ABSENT'} 
                          onClick={() => handleStatusChange(enrollmentId, 'ABSENT')}
                          icon={X} color="rose" label="Absent"
                        />
                        <AttendanceButton 
                          active={currentStatus === 'LATE'} 
                          onClick={() => handleStatusChange(enrollmentId, 'LATE')}
                          icon={Clock} color="amber" label="Retard"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </motion.div>
  );
};

const AttendanceButton = ({ active, onClick, icon: Icon, color, label }: any) => {
  const colors: any = {
    emerald: active ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-emerald-50 text-emerald-600 opacity-40 hover:opacity-100',
    rose: active ? 'bg-rose-600 text-white shadow-lg scale-105' : 'bg-rose-50 text-rose-600 opacity-40 hover:opacity-100',
    amber: active ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-amber-50 text-amber-600 opacity-40 hover:opacity-100',
  };

  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${colors[color]}`}
    >
      <Icon size={14} strokeWidth={3} />
      <span className="hidden sm:block">{label}</span>
    </button>
  );
};

const AttendanceSkeleton = () => (
  <div className="space-y-8 animate-pulse pb-16">
    <div className="flex justify-between items-center">
      <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
      <div className="h-12 w-48 bg-slate-100 rounded-xl"></div>
    </div>
    <div className="h-24 w-full bg-slate-100 rounded-2xl"></div>
    <div className="h-[500px] w-full bg-slate-100 rounded-2xl"></div>
  </div>
);

export default AttendancePage;
