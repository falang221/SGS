import React from 'react';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ShieldCheck, ChevronRight, Globe } from 'lucide-react';
import api from '../../shared/api/client';
import { Input } from '../../shared/ui/components/Input';

type LoginForm = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginForm, string>>;

import { useToastStore } from '../../shared/store/useToastStore';

const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = React.useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = (values: LoginForm): LoginErrors => {
    const nextErrors: LoginErrors = {};
    const email = values.email.trim();

    if (!email) {
      nextErrors.email = 'Adresse email requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Format email invalide';
    }

    if (!values.password) {
      nextErrors.password = 'Mot de passe requis';
    } else if (values.password.length < 8) {
      nextErrors.password = '8 caractères minimum';
    }

    return nextErrors;
  };

  const handleInputChange = (field: keyof LoginForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      addToast(`Bienvenue, ${user.firstName || user.email.split('@')[0]} !`, 'success');
      navigate('/dashboard');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const errorMsg = apiError.response?.data?.error || 'Erreur de connexion au serveur.';
      addToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] overflow-hidden relative font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-500 rounded-full blur-[120px] opacity-20 animate-pulse [animation-duration:10s]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500 rounded-full blur-[120px] opacity-15 animate-pulse [animation-duration:12s] [animation-delay:1s]" />
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

              <form onSubmit={onSubmit} className="space-y-6">
                <Input 
                  label="Adresse Email"
                  placeholder="nom@ecole.sn"
                  leftIcon={<Mail size={18} />}
                  error={errors.email}
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                />

                <div className="space-y-1">
                  <Input 
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock size={18} />}
                    error={errors.password}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
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

                <button
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-6 text-sm font-black uppercase tracking-[0.2em] bg-brand-600 text-white hover:bg-brand-700 shadow-indigo disabled:opacity-60 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  ) : null}
                  Se Connecter
                  <ChevronRight size={18} strokeWidth={3} className="ml-2" />
                </button>
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
