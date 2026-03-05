import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Check, X, Clock, Save, Users, Calendar, 
  Search, Sparkles, UserCheck, BellRing, Hash,
  AlertTriangle, MoreVertical, Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Select } from '../../shared/ui/components/Select';
import { Avatar } from '../../shared/ui/components/Avatar';
import { Badge } from '../../shared/ui/components/Badge';
import { Skeleton } from '../../shared/ui/components/Skeleton';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../shared/ui/components/Table';
import { useCurrentSchool } from '../../shared/hooks/useCurrentSchool';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

type AttendancePayloadItem = {
  enrollmentId: string;
  status: AttendanceStatus;
  date: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  enrollments: Array<{ id?: string; classId?: string; class?: { id?: string } }>;
};

const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentSchoolId } = useCurrentSchool();
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    setAttendanceData({});
    setSearchTerm('');
  }, [selectedClass]);

  // 1. Fetch Classes
  const { data: classes } = useQuery({
    queryKey: ['classes', currentSchoolId],
    enabled: !!currentSchoolId,
    queryFn: async () => {
      const { data } = await api.get(`/academic/classes/${currentSchoolId}`);
      return data;
    }
  });

  // 2. Fetch Students
  const { data: students, isLoading } = useQuery({
    queryKey: ['students-attendance', selectedClass, currentSchoolId],
    enabled: !!selectedClass && !!currentSchoolId,
    queryFn: async () => {
      const { data } = await api.get(`/students/school/${currentSchoolId}`);
      return data;
    }
  });

  // 3. Daily Stats
  const { data: dailyStats } = useQuery({
    queryKey: ['attendance-stats', currentSchoolId],
    enabled: !!currentSchoolId,
    queryFn: async () => {
      const { data } = await api.get(`/attendance/stats/${currentSchoolId}`);
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload: AttendancePayloadItem[]) => {
      return api.post('/attendance/bulk', payload);
    },
    onSuccess: () => {
      setAttendanceData({});
      queryClient.invalidateQueries({ queryKey: ['attendance-stats', currentSchoolId] });
      alert("L'appel a été validé. Les parents des élèves absents ont été notifiés.");
    }
  });

  const handleStatusChange = (enrollmentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({ ...prev, [enrollmentId]: status }));
  };

  const belongsToSelectedClass = (student: Student): boolean => {
    if (!selectedClass) return true;
    return student.enrollments.some(
      (enrollment) =>
        enrollment.classId === selectedClass || enrollment.class?.id === selectedClass,
    );
  };

  const getEnrollmentIdForClass = (student: Student): string | null => {
    const matchedEnrollment = student.enrollments.find(
      (enrollment) =>
        enrollment.classId === selectedClass || enrollment.class?.id === selectedClass,
    );

    return matchedEnrollment?.id ?? student.enrollments[0]?.id ?? null;
  };

  const studentsInSelectedClass = ((students as Student[] | undefined) ?? []).filter(belongsToSelectedClass);

  const markAllPresent = () => {
    const newData: Record<string, 'PRESENT'> = {};
    studentsInSelectedClass.forEach((s: Student) => {
      const enrollmentId = getEnrollmentIdForClass(s);
      if (enrollmentId) newData[enrollmentId] = 'PRESENT';
    });
    setAttendanceData(newData);
  };

  const filteredStudents = studentsInSelectedClass.filter((s: Student) => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = () => {
    if (studentsInSelectedClass.length === 0) return;
    const payload = studentsInSelectedClass.map((s: Student): AttendancePayloadItem | null => {
      const eid = getEnrollmentIdForClass(s);
      if (!eid) return null;

      return {
        enrollmentId: eid,
        status: attendanceData[eid] || 'PRESENT',
        date: new Date().toISOString()
      };
    }).filter((p: AttendancePayloadItem | null): p is AttendancePayloadItem => Boolean(p));
    
    mutation.mutate(payload);
  };

  if (isLoading && selectedClass) return <AttendanceSkeleton />;

  const absenteeCount = filteredStudents.reduce((count, student) => {
    const enrollmentId = getEnrollmentIdForClass(student);
    if (!enrollmentId) return count;
    return attendanceData[enrollmentId] === 'ABSENT' ? count + 1 : count;
  }, 0);

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-100/50">
             <UserCheck size={14} className="text-brand-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Contrôle de Présence &bull; Session Live</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Registre d'<span className="text-brand-600 italic">Appel</span><span className="text-brand-300">.</span>
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Calendar size={16} className="text-brand-500" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-soft mr-2">
              <div className="text-center border-r border-slate-100 pr-4">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Présents</p>
                 <p className="text-lg font-black text-emerald-600 leading-none mt-1">{dailyStats?.PRESENT || 0}</p>
              </div>
              <div className="text-center">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Absents</p>
                 <p className="text-lg font-black text-rose-600 leading-none mt-1">{dailyStats?.ABSENT || 0}</p>
              </div>
           </div>
           <Button 
             className="gap-2 shadow-indigo h-12 px-6" 
             onClick={onSubmit} 
             loading={mutation.isPending}
             disabled={!selectedClass || filteredStudents.length === 0}
           >
              <Save size={18} />
              <span>Valider la session</span>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Attendance List */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-soft overflow-visible">
              <CardContent className="p-6">
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-72">
                       <Select 
                         label="Sélectionner la classe" 
                         options={classes?.map((c: any) => ({ label: c.name, value: c.id })) || []} 
                         value={selectedClass}
                         onChange={(e) => setSelectedClass(e.target.value)}
                       />
                    </div>
                    <div className="relative flex-1 group pt-5">
                      <Search className="absolute left-4 top-[2.4rem] -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un élève..." 
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/20 transition-all text-sm font-medium h-[46px]"
                      />
                    </div>
                 </div>
              </CardContent>
           </Card>

           {!selectedClass ? (
             <div className="py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                   <Users size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Prêt pour l'appel ?</h3>
                <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto text-sm">Veuillez choisir une classe dans le menu déroulant pour afficher la liste des élèves.</p>
             </div>
           ) : (
             <Card className="border-none shadow-soft overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 py-4">
                   <div className="flex items-center gap-2">
                      <Badge variant="info" className="px-3 py-1 font-black">{filteredStudents?.length || 0} Élèves</Badge>
                      {absenteeCount > 0 && <Badge variant="destructive" className="px-3 py-1 font-black animate-pulse">{absenteeCount} Absents</Badge>}
                   </div>
                   <Button variant="ghost" size="sm" onClick={markAllPresent} className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-50">
                      Tout marquer présent
                   </Button>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px]">Identité</TableHead>
                      <TableHead className="text-center">Pointage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents?.map((student: Student) => {
                      const eid = getEnrollmentIdForClass(student);
                      if (!eid) return null;

                      const status = attendanceData[eid] || 'PRESENT';
                      
                      return (
                        <TableRow key={student.id} className="group hover:bg-slate-50/50">
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Avatar fallback={student.firstName} className="h-10 w-10 border-2 border-white shadow-soft" />
                              <div>
                                <p className="font-bold text-slate-900 leading-none">{student.firstName} {student.lastName}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                   <Hash size={10} /> {student.matricule}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                               <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1 border border-slate-200/50 shadow-inner-soft">
                                  <AttendanceToggle 
                                    active={status === 'PRESENT'} 
                                    onClick={() => handleStatusChange(eid, 'PRESENT')}
                                    variant="success" icon={Check}
                                  />
                                  <AttendanceToggle 
                                    active={status === 'ABSENT'} 
                                    onClick={() => handleStatusChange(eid, 'ABSENT')}
                                    variant="danger" icon={X}
                                  />
                                  <AttendanceToggle 
                                    active={status === 'LATE'} 
                                    onClick={() => handleStatusChange(eid, 'LATE')}
                                    variant="warning" icon={Clock}
                                  />
                               </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-slate-600">
                                <MoreVertical size={16} />
                             </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
             </Card>
           )}
        </div>

        {/* Sidebar Info & Alerts */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="bg-[#0F172A] text-white border-none shadow-heavy overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <BellRing size={80} />
              </div>
              <CardContent className="pt-8 relative z-10">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400 mb-6 border border-white/10">
                    <Sparkles size={24} />
                 </div>
                 <h3 className="text-xl font-black tracking-tight mb-4">Notification Parent</h3>
                 <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                   Notre système envoie automatiquement un SMS et une notification in-app aux parents en cas d'absence non justifiée.
                 </p>
                 <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Passerelle SMS Active</span>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-soft">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-500" />
                    Alertes Critiques
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <p className="text-xs font-bold text-rose-900 leading-none">Absences répétées</p>
                    <p className="text-[10px] text-rose-600 mt-2 font-medium">3 élèves ont plus de 5 absences ce mois-ci. Une intervention de la direction est recommandée.</p>
                    <Button variant="ghost" size="sm" className="mt-4 h-8 text-[9px] font-black uppercase tracking-widest text-rose-700 bg-white/50 hover:bg-white">Voir la liste</Button>
                 </div>
                 <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-xs font-bold text-amber-900 leading-none">Retards fréquents</p>
                    <p className="text-[10px] text-amber-600 mt-2 font-medium">Le taux de retard en Classe de CM2 est en hausse de 12% cette semaine.</p>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 bg-brand-50 border border-brand-100 rounded-3xl flex flex-col items-center text-center">
              <Info size={32} className="text-brand-600 mb-4" />
              <h4 className="text-sm font-black text-brand-900 uppercase tracking-tight">Support Pédagogique</h4>
              <p className="text-[11px] text-brand-700 font-medium mt-2 leading-relaxed">
                Besoin d'aide pour la gestion des justificatifs ? <br/>
                <button className="text-brand-600 font-black underline mt-2">Consulter le manuel</button>
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

type AttendanceToggleProps = {
  active: boolean;
  onClick: () => void;
  variant: 'success' | 'danger' | 'warning';
  icon: React.ComponentType<any>;
};

const AttendanceToggle: React.FC<AttendanceToggleProps> = ({ active, onClick, variant, icon: Icon }) => {
  const variants: Record<AttendanceToggleProps['variant'], string> = {
    success: active ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50',
    danger: active ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
    warning: active ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50',
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90",
        variants[variant]
      )}
    >
      <Icon size={18} strokeWidth={active ? 3 : 2} />
    </button>
  );
};

function cn(...inputs: Array<string | undefined | false | null>) {
  return clsx(inputs);
}

const AttendanceSkeleton = () => (
  <div className="space-y-10 animate-pulse pb-16">
    <div className="flex justify-between items-end">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
    <div className="grid grid-cols-12 gap-8">
       <div className="col-span-8 space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-[500px] w-full rounded-2xl" />
       </div>
       <div className="col-span-4 space-y-8">
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[200px] rounded-2xl" />
       </div>
    </div>
  </div>
);

export default AttendancePage;
