import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Zap, Shield, Globe, Database, CreditCard, 
  Lock, Save, Activity, Server, AlertTriangle,
  Mail, Smartphone, ChevronRight, HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Input } from '../../shared/ui/components/Input';
import { Badge } from '../../shared/ui/components/Badge';
import { Skeleton } from '../../shared/ui/components/Skeleton';

const PlatformSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('gateways');

  // 1. Fetch System Settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data } = await api.get('/system/settings');
      return data;
    }
  });

  // 2. Fetch System Status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data } = await api.get('/system/status');
      return data;
    },
    refetchInterval: 10000 // Rafraîchir toutes les 10s
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/system/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      alert('Paramètre mis à jour avec succès.');
    }
  });

  if (settingsLoading || statusLoading) return <PlatformSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-white/10">
             <Server size={14} className="text-brand-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 tracking-[0.2em]">Platform Core &bull; Node JS</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Configuration <span className="text-brand-600">Système</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Gérez les paramètres globaux de la plateforme SaaS et surveillez les services.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-soft">
           <div className="px-4 py-2 text-center border-r border-slate-50">
              <p className="text-[8px] font-black text-slate-400 uppercase">DB Latency</p>
              <p className="text-sm font-black text-emerald-600">{status?.dbLatency}</p>
           </div>
           <div className="px-4 py-2 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase">Uptime</p>
              <p className="text-sm font-black text-slate-900">{Math.floor(status?.uptime / 3600)}h {Math.floor((status?.uptime % 3600) / 60)}m</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation */}
        <aside className="lg:col-span-3 space-y-2">
           <NavTab icon={Smartphone} label="Passerelles" active={activeTab === 'gateways'} onClick={() => setActiveTab('gateways')} />
           <NavTab icon={CreditCard} label="Abonnements" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
           <NavTab icon={Shield} label="Sécurité Plateforme" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
           <NavTab icon={Activity} label="Maintenance" active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} />
        </aside>

        {/* Form Area */}
        <div className="lg:col-span-9">
           <Card className="border-none shadow-soft overflow-hidden">
              {activeTab === 'gateways' && (
                <div className="animate-in fade-in duration-500">
                   <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                      <CardTitle className="text-xl font-black">Passerelles de Paiement & SMS</CardTitle>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Configuration globale des APIs tierces</p>
                   </div>
                   <CardContent className="p-8 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-6">
                            <h4 className="text-sm font-black flex items-center gap-2 text-blue-600">
                               <div className="w-2 h-2 rounded-full bg-blue-600" /> WAVE SÉNÉGAL
                            </h4>
                            <Input label="Clé API Wave" type="password" placeholder="••••••••••••••••" />
                            <Input label="Webhook Secret" type="password" placeholder="••••••••" />
                            <Button variant="outline" size="sm" className="w-full">Tester la connexion</Button>
                         </div>
                         <div className="space-y-6">
                            <h4 className="text-sm font-black flex items-center gap-2 text-orange-500">
                               <div className="w-2 h-2 rounded-full bg-orange-500" /> ORANGE MONEY
                            </h4>
                            <Input label="Consumer Key" placeholder="OM-2024-XXXX" />
                            <Input label="Consumer Secret" type="password" placeholder="••••••••" />
                            <Button variant="outline" size="sm" className="w-full">Tester la connexion</Button>
                         </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div className="space-y-6">
                         <h4 className="text-sm font-black flex items-center gap-2 text-slate-900">
                            <div className="w-2 h-2 rounded-full bg-slate-900" /> FOURNISSEUR SMS (Twilio / Orange)
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Sender ID" placeholder="SGS-NOTIF" />
                            <Input label="API Token" type="password" placeholder="••••••••" />
                         </div>
                      </div>
                   </CardContent>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                   <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                      <CardTitle className="text-xl font-black">Maintenance & Santé</CardTitle>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Contrôle direct du cycle de vie plateforme</p>
                   </div>
                   <CardContent className="p-8 space-y-8">
                      <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-between gap-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                               <AlertTriangle size={24} />
                            </div>
                            <div>
                               <p className="font-bold text-amber-900">Mode Maintenance</p>
                               <p className="text-xs text-amber-700 font-medium">Désactive l'accès à l'application pour tous les utilisateurs.</p>
                            </div>
                         </div>
                         <Button variant="secondary" className="bg-amber-600 hover:bg-amber-700">Activer le mode</Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 border border-slate-100 rounded-3xl bg-white shadow-soft group hover:border-brand-200 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                               <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                                  <HardDrive size={20} />
                               </div>
                               <Badge variant="success">Online</Badge>
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Base de Données</p>
                            <p className="text-lg font-black text-slate-900 mt-1">PostgreSQL v15.0</p>
                            <Button variant="ghost" size="sm" className="mt-4 text-[10px] font-black uppercase text-brand-600 p-0">Optimiser les index</Button>
                         </div>
                         <div className="p-6 border border-slate-100 rounded-3xl bg-white shadow-soft group hover:border-violet-200 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                               <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                                  <Zap size={20} />
                               </div>
                               <Badge variant="success">Online</Badge>
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cache Système</p>
                            <p className="text-lg font-black text-slate-900 mt-1">Redis Cluster Active</p>
                            <Button variant="ghost" size="sm" className="mt-4 text-[10px] font-black uppercase text-violet-600 p-0">Vider le cache</Button>
                         </div>
                      </div>
                   </CardContent>
                </div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
};

const NavTab = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 border ${
      active 
        ? "bg-slate-900 text-white border-slate-900 shadow-heavy translate-x-2" 
        : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 shadow-sm"
    }`}
  >
    <Icon size={18} strokeWidth={active ? 3 : 2} />
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const PlatformSkeleton = () => (
  <div className="space-y-10 animate-pulse">
    <div className="flex justify-between items-center">
       <Skeleton className="h-12 w-64 rounded-xl" />
       <Skeleton className="h-12 w-48 rounded-xl" />
    </div>
    <div className="grid grid-cols-12 gap-8">
       <div className="col-span-3 space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
       </div>
       <div className="col-span-9">
          <Skeleton className="h-[600px] w-full rounded-3xl" />
       </div>
    </div>
  </div>
);

export default PlatformSettingsPage;
