import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Baby, GraduationCap, CreditCard, Clock, 
  ArrowRight, ShieldCheck, Sparkles, ChevronRight, 
  CheckCircle, FileText, Layout, MapPin, Calendar,
  BellRing, TrendingUp, Info, Wallet, Receipt,
  CheckCircle2, XCircle
} from 'lucide-react';
import { clsx } from 'clsx';

const ParentDashboard: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data: children, isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const { data } = await api.get('/parent/children');
      if (data && data.length > 0 && !selectedChildId) {
        setSelectedChildId(data[0].id);
      }
      return data;
    }
  });

  const { data: grades } = useQuery({
    queryKey: ['parent-grades', selectedChildId],
    queryFn: async () => {
      const { data } = await api.get(`/parent/grades/${selectedChildId}`);
      return data;
    },
    enabled: !!selectedChildId
  });

  if (isLoading) return <ParentSkeleton />;

  const activeChild = children?.find((c: any) => c.id === selectedChildId);

  return (
    <div className="space-y-12 pb-24 animate-fadeIn">
      {/* Header Strategique Famille */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <div>
          <div className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em] mb-5 bg-brand-50 w-fit px-4 py-2 rounded-full border border-brand-100/50">
             <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></div>
             Espace Famille &bull; Accès Sécurisé
          </div>
          <h2 className="text-5xl xl:text-7xl font-display font-black text-slate-900 tracking-tight leading-[0.9]">
            Bienvenue, <span className="text-brand-600 italic font-black">Parent</span><span className="text-brand-300">.</span>
          </h2>
          <p className="text-slate-500 font-medium mt-6 text-xl max-w-xl leading-relaxed opacity-80">
            Suivez le parcours académique de vos enfants et gérez vos engagements en toute sérénité.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200/40 shadow-soft">
           <div className="w-12 h-12 rounded-xl bg-brand-950 flex items-center justify-center text-white">
              <ShieldCheck size={24} />
           </div>
           <div className="pr-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dernière Connexion</p>
              <p className="text-sm font-black text-slate-900">Aujourd'hui, 14:32</p>
           </div>
        </div>
      </div>

      {/* Child Selector - Modern Horizontal Scroll */}
      <div className="space-y-8">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Séléction de l'élève</h3>
            <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-4 py-2 rounded-full border border-brand-100/50 uppercase tracking-widest">{children?.length || 0} Inscrits</span>
         </div>
         
         <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {children?.map((child: any) => (
               <button 
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={clsx(
                     "relative flex items-center gap-6 p-6 pr-12 rounded-3xl border-2 transition-all duration-500 shrink-0 group overflow-hidden min-w-[280px] hover:-translate-y-2 active:scale-95",
                     selectedChildId === child.id 
                        ? "bg-white border-brand-600 shadow-heavy" 
                        : "bg-white border-slate-100 hover:border-brand-200 shadow-soft"
                  )}
               >
                  <div className={clsx(
                     "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-sm",
                     selectedChildId === child.id ? "bg-brand-600 text-white rotate-6" : "bg-slate-50 text-slate-400 group-hover:text-brand-500"
                  )}>
                     <Baby size={32} strokeWidth={2.5} />
                  </div>
                  <div className="text-left relative z-10">
                     <h4 className={clsx("font-display font-black text-xl tracking-tight transition-colors", selectedChildId === child.id ? "text-slate-900" : "text-slate-500")}>
                        {child.firstName}
                     </h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{child.enrollments[0]?.class?.name || 'Effectif'}</p>
                  </div>
                  {selectedChildId === child.id && (
                     <div className="absolute top-4 right-4 w-2 h-2 bg-brand-600 rounded-full" />
                  )}
               </button>
            ))}
         </div>
      </div>

      {/* Main Content Grid */}
      {selectedChildId && (
            <div key={selectedChildId} className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fadeIn">
               {/* Column 1: Performance & Grades */}
               <div className="lg:col-span-8 space-y-12">
                  <div className="bg-white p-10 lg:p-14 rounded-premium border border-slate-200/40 shadow-soft relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50/30 rounded-full -mr-64 -mt-64 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                     
                     <div className="flex items-center justify-between mb-16 relative z-10">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 border border-brand-100/50 shadow-sm">
                              <GraduationCap size={32} />
                           </div>
                           <div>
                              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">Performances Live</h3>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Derniers résultats de {activeChild?.firstName}</p>
                           </div>
                        </div>
                        <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-brand-600 transition-all border border-transparent hover:border-brand-100 shadow-sm">
                           <TrendingUp size={24} strokeWidth={2.5} />
                        </button>
                     </div>

                     <div className="space-y-6 relative z-10">
                        {grades?.map((grade: any, idx: number) => {
                           const isGood = Number(grade.value) >= 10;
                           return (
                              <div
                                 key={grade.id}
                                 className="flex items-center justify-between p-8 rounded-3xl bg-slate-50/40 hover:bg-white border border-transparent hover:border-brand-100/20 hover:shadow-soft transition-all group cursor-default animate-fadeIn"
                              >
                                 <div className="flex items-center gap-8">
                                    <div className={clsx(
                                       "w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3",
                                       isGood ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
                                    )}>
                                       {grade.value}
                                    </div>
                                    <div>
                                       <p className="font-display font-black text-slate-900 text-2xl leading-none tracking-tighter">{grade.subjectId}</p>
                                       <div className="flex items-center gap-4 mt-4">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{grade.type}</span>
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                          <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">{grade.period}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end gap-3">
                                    <span className="text-[10px] font-black bg-white px-4 py-2 rounded-xl border border-slate-100 text-slate-600 uppercase tracking-widest shadow-sm">Coef. {grade.coeff}</span>
                                    <div className="flex gap-1.5">
                                       {[1, 2, 3, 4, 5].map((i) => (
                                         <div
                                           key={i}
                                           className={`w-1.5 h-1.5 rounded-full ${isGood ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                           style={{ opacity: i / 5 }}
                                         />
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                        {(!grades || grades.length === 0) && (
                           <div className="text-center py-24 bg-slate-50/20 rounded-premium border border-dashed border-slate-200">
                              <FileText size={48} strokeWidth={1} className="text-slate-200 mx-auto mb-8" />
                              <h4 className="text-xl font-display font-black text-slate-900 tracking-tight">Publication imminente</h4>
                              <p className="text-slate-400 font-bold mt-2 text-sm">Les notes du semestre 1 seront publiées prochainement.</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Daily Feed Panel */}
                  <div className="bg-brand-950 p-10 lg:p-14 rounded-premium text-white relative overflow-hidden shadow-heavy group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full blur-[110px] -mr-24 -mt-24 opacity-30 group-hover:scale-150 transition-transform duration-1000"></div>
                     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center text-brand-400 border border-white/10 backdrop-blur-md">
                              <BellRing size={32} className="animate-bounce" />
                           </div>
                           <div>
                              <h4 className="text-2xl font-display font-black tracking-tight mb-2">Fil d'actualité Direct</h4>
                              <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                                 {activeChild?.firstName} est <span className="text-emerald-400 font-black">Présent(e)</span> ce jour. Arrivée enregistrée à 07:55.
                              </p>
                           </div>
                        </div>
                        <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Consulter historique</button>
                     </div>
                  </div>
               </div>

               {/* Column 2: Finance & Sidebar */}
               <div className="lg:col-span-4 space-y-12">
                  <div className="bg-white p-12 rounded-premium border border-slate-200/40 shadow-soft relative overflow-hidden group">
                     <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-50 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000 opacity-50"></div>
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-12">
                           <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 border border-brand-100/50 shadow-sm"><Wallet size={28} /></div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Situation Scolarité</p>
                              <p className="text-sm font-black text-slate-900">Mensualités & Frais</p>
                           </div>
                        </div>

                        <p className="text-slate-400 text-[10px] font-black mb-4 uppercase tracking-[0.3em]">Solde à régulariser</p>
                        <h4 className="text-6xl font-display font-black mb-12 tracking-tighter leading-none text-slate-900">
                           75.0<span className="text-3xl text-slate-300">k</span> <span className="text-2xl text-brand-600 block mt-2 tracking-normal font-medium uppercase tracking-widest">FCFA</span>
                        </h4>

                        <div className="space-y-4">
                           <button className="w-full flex items-center justify-center gap-4 py-6 rounded-2xl bg-brand-950 text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-600 transition-all shadow-heavy hover:shadow-indigo active:scale-95">
                              Payer par Wave
                           </button>
                           <button className="w-full flex items-center justify-center gap-4 py-6 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200/60 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-all active:scale-95">
                              Orange Money
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-premium border border-slate-200/40 shadow-soft relative overflow-hidden">
                     <div className="flex items-center justify-between mb-10">
                        <h4 className="font-display font-black text-slate-900 text-xl tracking-tight uppercase tracking-widest">Derniers Reçus</h4>
                        <button className="text-[9px] font-black text-brand-600 uppercase tracking-widest hover:underline underline-offset-4">Voir Tout</button>
                     </div>
                     <div className="space-y-8">
                        <SimpleHistoryItem icon={CheckCircle2} title="Mensualité Janvier" date="15 Fév 2025" amount="35 000 F" success />
                        <SimpleHistoryItem icon={CheckCircle2} title="Assurance Élite" date="Année 2024-25" amount="15 000 F" success />
                        <SimpleHistoryItem icon={Clock} title="Frais Cantine" date="Mars 2025" amount="12 500 F" />
                     </div>
                  </div>

                  <div className="bg-emerald-50/50 p-8 rounded-premium border border-emerald-100 flex items-center gap-6 group hover:bg-emerald-50 transition-colors">
                     <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={28} />
                     </div>
                     <div>
                        <h4 className="font-display font-black text-slate-900 text-sm tracking-tight uppercase tracking-widest">Dossier Validé</h4>
                        <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-tighter">Assurance & Visite Médicale OK</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
    </div>
  );
};

const SimpleHistoryItem = ({ icon: Icon, title, date, amount, success }: any) => (
   <div className="flex items-center justify-between group cursor-default">
      <div className="flex items-center gap-5">
         <div className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
            success ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
         )}>
            <Icon size={22} strokeWidth={2.5} />
         </div>
         <div>
            <p className="text-sm font-black text-slate-900 leading-none tracking-tight group-hover:text-brand-600 transition-colors">{title}</p>
            <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">{date}</p>
         </div>
      </div>
      <span className="font-black text-slate-900 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{amount}</span>
   </div>
);

const ParentSkeleton = () => (
  <div className="space-y-12 animate-pulse pb-24">
    <div className="flex justify-between items-end">
      <div className="space-y-4">
        <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
        <div className="h-6 w-96 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="h-16 w-48 bg-slate-100 rounded-2xl"></div>
    </div>
    <div className="h-32 w-full bg-slate-100 rounded-3xl"></div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
       <div className="lg:col-span-8 h-[600px] bg-white rounded-premium border border-slate-100"></div>
       <div className="lg:col-span-4 space-y-12">
          <div className="h-80 bg-brand-50 rounded-premium opacity-20"></div>
          <div className="h-64 bg-white rounded-premium border border-slate-100"></div>
       </div>
    </div>
  </div>
);

export default ParentDashboard;
