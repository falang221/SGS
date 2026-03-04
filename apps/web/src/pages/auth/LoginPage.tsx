import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ShieldCheck, ChevronRight, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../shared/api/client';
import { Input } from '../../shared/ui/components/Input';
import { Button } from '../../shared/ui/components/Button';

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
      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      navigate('/dashboard');
    } catch (error: any) {
       const errorMsg = error.response?.data?.error || 'Erreur de connexion au serveur.';
       alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] overflow-hidden relative font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-heavy overflow-hidden m-4">
        
        {/* Brand Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-600/20 to-transparent border-r border-white/5">
           <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-indigo">
                   <GraduationCap size={24} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-display font-black text-white tracking-tighter uppercase">SGS<span className="text-brand-500">.</span></span>
              </div>

              <h1 className="text-5xl font-display font-black text-white leading-[1.1] mb-6">
                L'intelligence <br />
                au service de <br />
                <span className="text-brand-500">l'Éducation</span>.
              </h1>
              
              <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                La plateforme de gestion scolaire la plus avancée du Sénégal, conçue pour l'excellence académique.
              </p>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-400">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <p className="text-white font-bold text-xs uppercase tracking-wider">Sécurité Bancaire</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Isolation des données certifiée</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                    <Globe size={20} />
                 </div>
                 <div>
                    <p className="text-white font-bold text-xs uppercase tracking-wider">Multi-Établissements</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Gestion centralisée pilotée par IA</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Form Side */}
        <div className="bg-white p-10 lg:p-16 flex flex-col justify-center">
           <div className="max-w-sm mx-auto w-full">
              <div className="mb-10 text-center lg:text-left">
                 <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Bienvenue</h2>
                 <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest text-[10px]">Espace d'authentification</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input 
                  label="Adresse Email"
                  placeholder="nom@ecole.sn"
                  leftIcon={<Mail size={18} />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div className="space-y-1">
                  <Input 
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock size={18} />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <div className="text-right">
                    <button type="button" className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:text-brand-800 transition-colors">
                      Mot de passe oublié ?
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-1 py-2">
                   <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20" />
                   <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">Rester connecté</label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-6 text-sm font-black uppercase tracking-[0.2em] shadow-indigo"
                  loading={isSubmitting}
                >
                  Se Connecter
                  <ChevronRight size={18} strokeWidth={3} className="ml-2" />
                </Button>
              </form>

              <div className="mt-12 text-center">
                 <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-px w-10 bg-slate-100" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Partenaire de confiance</span>
                    <div className="h-px w-10 bg-slate-100" />
                 </div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
                   SGS • VERSION 2.0 • &copy; 2026
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
