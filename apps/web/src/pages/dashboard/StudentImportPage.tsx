import React, { useState } from 'react';
import { 
  FileSpreadsheet, CheckCircle, AlertCircle, Download, 
  UploadCloud, Sparkles, ShieldCheck, ChevronRight,
  Info, FileText, ArrowRight, Save, Trash2, Database,
  CheckCircle2, XCircle
} from 'lucide-react';
import api from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const StudentImportPage: React.FC = () => {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const onImport = async () => {
    if (!file || !user) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('schoolId', '550e8400-e29b-41d4-a716-446655440000');

    setStatus('uploading');
    try {
      const response = await api.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || "Erreur lors de l'importation");
    }
  };

  const downloadTemplate = () => {
    const csvContent = `prenom,nom,date_naissance,matricule\nAbdou,Ndiaye,2010-05-15,MAT2024001\nFatou,Sow,2011-08-22,MAT2024002`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sgs_modele_import.csv");
    link.click();
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12 pb-24 max-w-5xl mx-auto"
    >
      {/* Header Stratégique */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <div>
          <div className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em] mb-5 bg-brand-50 w-fit px-4 py-2 rounded-full border border-brand-100/50">
             <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></div>
             Outil d'Onboarding &bull; Importation Massive
          </div>
          <h2 className="text-5xl xl:text-6xl font-display font-black text-slate-900 tracking-tight leading-[0.9]">
            Import <span className="text-brand-600 italic font-black">Intelligent</span><span className="text-brand-300">.</span>
          </h2>
          <p className="text-slate-500 font-medium mt-6 text-xl max-w-xl leading-relaxed opacity-80">
            Intégrez des milliers d'élèves en quelques secondes. Notre système valide et sécurise chaque donnée.
          </p>
        </div>
        
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-4 bg-white border border-slate-200/60 px-8 py-5 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest shadow-soft"
        >
          <Download size={18} strokeWidth={2.5} className="text-brand-500" />
          <span>Modèle CSV</span>
        </button>
      </div>

      {/* Upload Zone - Modern & Immersive */}
      <div className="bg-white rounded-premium border border-slate-200/40 shadow-soft overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50/30 rounded-full -mr-64 -mt-64 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        
        <div className="p-12 lg:p-20 flex flex-col items-center justify-center relative z-10">
           <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center text-center space-y-8"
                >
                   <div className="w-32 h-32 rounded-[40px] bg-brand-50 border border-brand-100/50 flex items-center justify-center text-brand-600 shadow-inner-soft group-hover:scale-110 transition-transform duration-500">
                      <UploadCloud size={56} strokeWidth={1.5} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">Sélectionner un fichier</h3>
                      <p className="text-slate-400 font-semibold mt-3 max-w-xs text-sm leading-relaxed">Glissez-déposez votre export CSV ou cliquez pour explorer.</p>
                   </div>
                   <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                </motion.div>
              ) : (
                <motion.div 
                  key="selected"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center space-y-10"
                >
                   <div className="w-full max-w-md p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner-soft flex items-center gap-6 relative group/file">
                      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-indigo group-hover/file:rotate-6 transition-transform">
                         <FileSpreadsheet size={32} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="font-black text-slate-900 text-sm truncate">{file.name}</p>
                         <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mt-1">{(file.size / 1024).toFixed(1)} KB &bull; Prêt</p>
                      </div>
                      <button onClick={reset} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm border border-slate-100 transition-all">
                         <Trash2 size={18} />
                      </button>
                   </div>

                   <div className="flex flex-col items-center gap-6 w-full">
                      {status === 'idle' && (
                        <button 
                          onClick={onImport}
                          className="w-full max-w-xs py-5 bg-brand-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-brand-600 transition-all shadow-heavy hover:shadow-indigo active:scale-95 flex items-center justify-center gap-4"
                        >
                          <Database size={18} strokeWidth={3} />
                          <span>Lancer l'intégration</span>
                        </button>
                      )}

                      {status === 'uploading' && (
                        <div className="flex flex-col items-center gap-4">
                           <div className="relative">
                              <div className="w-16 h-16 border-[5px] border-brand-50 rounded-full"></div>
                              <div className="w-16 h-16 border-[5px] border-brand-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                           </div>
                           <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em] animate-pulse">Validation des entrées...</p>
                        </div>
                      )}

                      {status === 'success' && (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-8 py-5 rounded-2xl shadow-sm"
                        >
                          <CheckCircle2 size={28} className="text-emerald-500" />
                          <div className="text-left">
                             <p className="font-black text-sm uppercase tracking-tight">Succès</p>
                             <p className="text-xs font-bold opacity-80">{message}</p>
                          </div>
                        </motion.div>
                      )}

                      {status === 'error' && (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-5 bg-rose-50 text-rose-700 border border-rose-100 px-8 py-5 rounded-2xl shadow-sm"
                        >
                          <XCircle size={28} className="text-rose-500" />
                          <div className="text-left">
                             <p className="font-black text-sm uppercase tracking-tight">Erreur Critique</p>
                             <p className="text-xs font-bold opacity-80">{message}</p>
                          </div>
                        </motion.div>
                      )}
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* Instructions & Quality Assurance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 bg-white p-10 rounded-premium border border-slate-200/40 shadow-soft">
            <h4 className="font-display font-black text-slate-900 text-xl mb-10 uppercase tracking-tighter flex items-center gap-4">
               <div className="w-1.5 h-6 bg-brand-600 rounded-full"></div>
               Contrôle de Qualité des Données
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <InstructionItem 
                 title="Unicité du Matricule" 
                 text="Chaque élève doit posséder un matricule unique. Si le matricule existe déjà, les informations de l'élève seront fusionnées." 
               />
               <InstructionItem 
                 title="Standard Temporel" 
                 text="La date de naissance doit respecter strictement le format ISO : AAAA-MM-JJ (ex: 2012-05-24)." 
               />
               <InstructionItem 
                 title="Intégrité de l'En-tête" 
                 text="Ne renommez aucune colonne du modèle. La structure doit être conservée pour l'analyse algorithmique." 
               />
               <InstructionItem 
                 title="Mode Transactionnel" 
                 text="En cas d'erreur sur une seule ligne, toute l'importation est annulée pour garantir l'intégrité de la base." 
               />
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <div className="bg-brand-950 p-8 rounded-premium text-white relative overflow-hidden shadow-heavy group h-full flex flex-col justify-between">
               <div className="absolute top-0 right-0 w-48 h-48 bg-brand-600 rounded-full blur-[100px] -mr-24 -mt-24 opacity-40 group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-brand-400 border border-white/10 mb-8">
                     <ShieldCheck size={28} />
                  </div>
                  <h4 className="text-xl font-display font-black tracking-tight mb-4">Isolation Multi-Tenant</h4>
                  <p className="text-slate-400 font-medium text-xs leading-relaxed">Vos données sont strictement confinées à votre établissement. Aucun accès inter-écoles n'est possible.</p>
               </div>
               <button className="mt-10 flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group/btn">
                  En savoir plus
                  <ChevronRight size={16} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

const InstructionItem = ({ title, text }: any) => (
  <div className="space-y-3 group">
     <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-indigo transition-transform group-hover:scale-150"></div>
        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{title}</h5>
     </div>
     <p className="text-xs text-slate-500 font-semibold leading-relaxed ml-5 opacity-80">{text}</p>
  </div>
);

export default StudentImportPage;
