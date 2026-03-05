import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Calendar, Clock, MapPin, User, ChevronRight, 
  LayoutGrid, List, Download, Info, Plus, GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Select } from '../../shared/ui/components/Select';
import { Badge } from '../../shared/ui/components/Badge';
import { useCurrentSchool } from '../../shared/hooks/useCurrentSchool';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`);

const TimetablePage: React.FC = () => {
  const { currentSchool, currentSchoolId, isLoading: isSchoolLoading } = useCurrentSchool();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 1. Récupération des Classes
  const { data: classes } = useQuery({
    queryKey: ['classes', currentSchoolId],
    enabled: !!currentSchoolId,
    queryFn: async () => {
      const { data } = await api.get(`/academic/classes/${currentSchoolId}`);
      return data;
    }
  });

  // 2. Récupération de l'Emploi du Temps
  const { data: timetable, isLoading } = useQuery({
    queryKey: ['timetable', selectedClass],
    enabled: !!selectedClass,
    queryFn: async () => {
      const { data } = await api.get(`/academic/timetable/class/${selectedClass}`);
      return data;
    },
  });

  const timetableByDay = useMemo(
    () =>
      DAYS.map((day, dayIndex) => ({
        day,
        entries: ((timetable as any[] | undefined) ?? [])
          .filter((entry) => entry.dayOfWeek === dayIndex)
          .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
      })),
    [timetable],
  );

  if ((isLoading && selectedClass) || isSchoolLoading) return <TimetableSkeleton />;

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header Professionnel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-3 px-3 py-1 bg-indigo-50 rounded-full w-fit">
             <Calendar size={12} />
             Planification Hebdomadaire
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Emploi du <span className="text-indigo-600">Temps</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Organisez les cours et optimisez l'occupation des salles.
          </p>
          {currentSchool?.name ? (
            <p className="text-slate-400 text-sm font-semibold mt-1">Établissement: {currentSchool.name}</p>
          ) : null}
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List size={18} />
              </button>
           </div>
           <Button variant="outline" className="gap-2">
              <Download size={16} />
              <span>Exporter</span>
           </Button>
           <Button className="gap-2 shadow-indigo">
              <Plus size={16} />
              <span>Ajouter</span>
           </Button>
        </div>
      </div>

      {/* Selecteur de Classe */}
      <div className="max-w-xs">
         <Select 
           label="Sélectionner une classe" 
           options={classes?.map((c: any) => ({ label: c.name, value: c.id })) || []} 
           value={selectedClass}
           onChange={(e) => setSelectedClass(e.target.value)}
         />
      </div>

      {!selectedClass ? (
        <Card className="border-dashed border-2 py-20 text-center">
           <CardContent>
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                 <GraduationCap size={32} />
              </div>
              <p className="text-slate-900 font-bold text-lg">Choisissez une classe</p>
              <p className="text-slate-400 text-sm mt-1">Sélectionnez une classe ci-dessus pour afficher son emploi du temps.</p>
           </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <Card className="overflow-hidden border-slate-200 shadow-soft">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header Jours */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center border-r border-slate-100">Heure</div>
                {DAYS.map(day => (
                  <div key={day} className="p-4 border-r border-slate-100 last:border-r-0 text-[10px] font-black text-slate-900 text-center uppercase tracking-widest bg-white/40">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille de temps */}
              <div className="relative">
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0 min-h-[120px]">
                    <div className="p-4 border-r border-slate-100 text-[10px] text-slate-400 font-bold flex items-start justify-center bg-slate-50/20">
                       <div className="flex flex-col items-center gap-1">
                          <Clock size={14} className="text-indigo-300" />
                          {hour}
                       </div>
                    </div>
                    
                    {DAYS.map((_, dIndex) => {
                      const entry = timetable?.find((e: any) => e.dayOfWeek === dIndex && e.startTime.startsWith(hour.split(':')[0]));
                      return (
                        <div key={dIndex} className="p-2 border-r border-slate-100 last:border-r-0 relative hover:bg-indigo-50/20 transition-colors">
                          {entry ? (
                            <div className="h-full w-full bg-white border border-indigo-100 rounded-xl p-3 flex flex-col justify-between shadow-sm hover:shadow-indigo transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden">
                               <div className="relative z-10">
                                  <div className="flex items-center gap-1.5 mb-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></div>
                                     <p className="text-[10px] font-black text-indigo-700 uppercase tracking-tight truncate">{entry.subject.name}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
                                     <MapPin size={10} className="text-slate-300" />
                                     <span className="truncate">{entry.room || 'S. Polyvalente'}</span>
                                  </div>
                               </div>

                               <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-slate-50 mt-2">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                     <User size={12} />
                                  </div>
                                  <p className="text-[9px] font-bold text-slate-900 truncate tracking-tight">Prof. Diouf</p>
                               </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {timetableByDay.map(({ day, entries }) => (
            <Card key={day} className="border-slate-200 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-900">{day}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
                    {entries.length} créneau{entries.length > 1 ? 'x' : ''}
                  </Badge>
                </div>
                {entries.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium">Aucun cours planifié.</p>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry: any) => (
                      <div
                        key={entry.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900">{entry.subject?.name || 'Matière'}</p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            {entry.startTime} - {entry.endTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400" />
                            {entry.room || 'Salle non définie'}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" />
                            Prof. Diouf
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Légende */}
      <div className="flex flex-col md:flex-row gap-6">
         <div className="flex-1 flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
               Cours théoriques
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
               Sport & Culture
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
               Laboratoire / TP
            </div>
         </div>
         
         <Card className="flex-1 bg-slate-950 border-none shadow-heavy">
            <CardContent className="p-6 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400">
                     <Info size={20} />
                  </div>
                  <div className="text-white">
                     <h4 className="font-bold text-sm">Aide à la planification</h4>
                     <p className="text-slate-400 text-xs mt-0.5">Vérifiez les conflits de salle.</p>
                  </div>
               </div>
               <ChevronRight className="text-white/40" size={20} />
            </CardContent>
         </Card>
      </div>
    </div>
  );
};

const TimetableSkeleton = () => (
  <div className="space-y-8 animate-pulse pb-16">
    <div className="flex justify-between items-center">
      <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
      <div className="flex gap-3">
        <div className="h-12 w-48 bg-slate-100 rounded-xl"></div>
        <div className="h-12 w-32 bg-indigo-50 rounded-xl"></div>
      </div>
    </div>
    <div className="h-[600px] w-full bg-slate-100 rounded-2xl border border-slate-200"></div>
  </div>
);

export default TimetablePage;
