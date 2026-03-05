import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, ShieldCheck, Zap, Globe, 
  ChevronRight, CheckCircle2, LayoutDashboard, 
  CreditCard, Users, ArrowRight, Star, PlayCircle
} from 'lucide-react';
import { Button } from '../shared/ui/components/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-500/20">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-indigo">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">SGS<span className="text-brand-500">.</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Fonctionnalités</a>
            <a href="#security" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Sécurité</a>
            <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Tarifs</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-brand-600 px-4">Connexion</Link>
            <Button size="sm" className="hidden sm:flex shadow-indigo px-6">Essai Gratuit</Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-50/50 via-transparent to-transparent blur-3xl opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 rounded-full border border-brand-100 animate-fadeIn">
              <Star size={14} className="text-brand-600 fill-brand-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Propulsé par 'fa3.0' • EdTech 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 animate-fadeIn">
              L'excellence scolaire <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">réinventée pour le Sénégal</span>.
            </h1>

            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed animate-fadeIn">
              Pilotez votre établissement avec une plateforme tout-en-un. Du suivi des notes au recouvrement par Mobile Money, SGS offre une clarté totale à la direction, aux enseignants et aux parents.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fadeIn">
              <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-base font-black shadow-indigo group">
                Démarrez maintenant
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <PlayCircle size={24} className="text-brand-600" />
                Voir la démo vidéo
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-24 relative animate-fadeIn">
            <div className="absolute -inset-4 bg-gradient-to-b from-brand-500/20 to-transparent blur-2xl opacity-30 rounded-[3rem]" />
            <div className="relative bg-[#0F172A] rounded-[2rem] border border-white/10 shadow-heavy overflow-hidden aspect-[16/9] md:aspect-[21/9]">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000')] bg-cover opacity-40 mix-blend-luminosity" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md p-10 rounded-full border border-white/20">
                     <PlayCircle size={64} className="text-white fill-white/20" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-600">Innovation Métier</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">Pensé pour le terrain.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={LayoutDashboard}
              title="Dashboard Direction"
              text="Vision 360° sur les effectifs, le taux de réussite et la santé financière de votre établissement en temps réel."
            />
            <FeatureCard 
              icon={CreditCard}
              title="Encaissement Digital"
              text="Paiement de la scolarité via Wave et Orange Money avec reçu automatique et rapprochement comptable."
            />
            <FeatureCard 
              icon={Users}
              title="Capital Humain"
              text="Gestion complète des enseignants et du personnel. Registre de paie automatisé et suivi des contrats."
            />
            <FeatureCard 
              icon={Zap}
              title="Notation & Moyennes"
              text="Calcul automatisé des moyennes pondérées selon le système sénégalais et génération de bulletins de luxe."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Sécurité & RLS"
              text="Chaque établissement dispose d'une isolation totale des données. Vos informations sont cryptées et certifiées."
            />
            <FeatureCard 
              icon={Globe}
              title="Accès Parent"
              text="Un portail dédié pour les parents : consultation des notes, absences et paiements sur mobile."
            />
          </div>
        </div>
      </section>

      {/* --- TRUST SECTION --- */}
      <section className="py-24 bg-white border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="max-w-md space-y-6">
              <h3 className="text-3xl font-black tracking-tight leading-none">
                La confiance des meilleures institutions.
              </h3>
              <p className="text-slate-500 font-medium">
                Déjà plus de 50 établissements au Sénégal utilisent SGS pour digitaliser leur administration et améliorer la réussite de leurs élèves.
              </p>
              <div className="flex gap-2">
                 {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
              </div>
           </div>
           <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
              <div className="text-3xl font-black text-slate-900 tracking-tighter">ÉCOLE PILOTE</div>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">INSTITUT EXCELLENCE</div>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">GROUPE SCOLAIRE</div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0F172A] pt-24 pb-12 text-white overflow-hidden relative">
        <div className="absolute bottom-0 right-0 p-24 opacity-5 pointer-events-none">
           <GraduationCap size={400} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white">
                  <GraduationCap size={24} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">SGS<span className="text-brand-500">.</span></span>
              </div>
              <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                Le partenaire de la transformation digitale des établissements scolaires au Sénégal. Fiabilité, Performance, Excellence.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Produit</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><a href="#" className="hover:text-brand-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Portail Parent</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Contact</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li>Dakar, Plateau, Sénégal</li>
                <li>+221 77 577 11 56</li>
                <li>a.ndiaye2012@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              © 2026 SGS • SYSTÈME DE GESTION SCOLAIRE • TOUS DROITS RÉSERVÉS
            </p>
            <div className="flex gap-8">
               <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Mentions Légales</a>
               <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, text }: any) => (
  <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-soft hover:shadow-medium transition-all duration-300 group hover:-translate-y-2">
    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
      <Icon size={28} />
    </div>
    <h4 className="text-xl font-black tracking-tight mb-4">{title}</h4>
    <p className="text-slate-500 font-medium text-sm leading-relaxed">
      {text}
    </p>
    <div className="mt-8 flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
       En savoir plus
       <ArrowRight size={14} />
    </div>
  </div>
);

export default LandingPage;
