import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Lock, Mail, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../shared/api/client';

const loginSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      // Test de connexion rapide
      await api.get('/health').catch(() => {
        throw new Error('SERVER_UNREACHABLE');
      });

      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      navigate('/dashboard');
    } catch (error: any) {
       console.error('Login Error Detail:', error);
       if (error.message === 'SERVER_UNREACHABLE') {
         alert("Le serveur API est injoignable. Vérifiez qu'il est bien démarré sur le port 3001.");
       } else {
         const errorMsg = error.response?.data?.error || 'Erreur de connexion au serveur.';
         alert(errorMsg === 'Identifiants invalides' ? 'Email ou mot de passe incorrect.' : errorMsg);
       }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-950 overflow-hidden relative font-sans selection:bg-brand-500/30">
      
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-brand-600/20 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[140px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] h-full min-h-[650px] flex flex-col lg:flex-row bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-heavy mx-4">
        
        {/* Left: Branding & Visuals */}
        <div className="w-full lg:w-[50%] p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden bg-brand-950/40">
           <div className="relative z-10">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 mb-16"
              >
                <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-indigo">
                   <GraduationCap size={28} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-display font-black text-white tracking-tighter uppercase tracking-[0.2em]">SGS<span className="text-brand-500">.</span></span>
              </motion.div>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl xl:text-6xl font-display font-black text-white leading-tight tracking-tight mb-8"
              >
                L&apos;excellence <br />
                par la <span className="text-brand-500 italic">Maîtrise</span>.
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-400 text-lg max-w-md font-medium leading-relaxed"
              >
                Le centre de commande éducatif conçu pour les établissements scolaires du Sénégal.
              </motion.p>
           </div>

           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="relative z-10 flex items-center gap-6 mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
           >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <p className="text-white font-black text-xs uppercase tracking-widest">Connexion Sécurisée</p>
                 <p className="text-slate-500 text-[10px] font-bold mt-0.5 uppercase tracking-tighter">AES-256 Multi-Tenant Isolation</p>
              </div>
           </motion.div>
        </div>

        {/* Right: Login Form */}
        <div className="flex-1 bg-white p-12 lg:p-20 flex flex-col justify-center relative">
           <div className="max-w-md mx-auto w-full">
              <div className="mb-12">
                 <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight mb-3">Authentification</h2>
                 <p className="text-slate-400 font-bold text-sm">Accédez à votre espace de gestion.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Adresse Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                      <input 
                        {...register('email')}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500/20 transition-all font-bold text-sm text-slate-900 shadow-inner-soft placeholder:text-slate-300"
                        placeholder="nom@ecole.sn"
                      />
                    </div>
                    {errors.email && <p className="text-xs font-bold text-rose-500 ml-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mot de passe</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                      <input 
                        type="password"
                        {...register('password')}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500/20 transition-all font-bold text-sm text-slate-900 shadow-inner-soft placeholder:text-slate-300"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <p className="text-xs font-bold text-rose-500 ml-1">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded-md border-slate-200 text-brand-600 focus:ring-brand-500/20 transition-all" />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Rester connecté</span>
                   </label>
                   <button type="button" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:text-brand-800 transition-colors">Oublié ?</button>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-brand-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-brand-600 transition-all shadow-heavy hover:shadow-indigo active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Se Connecter</span>
                      <ChevronRight size={18} strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 text-center">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                   SGS • Système de Gestion Scolaire &copy; 2026
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
