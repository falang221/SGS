import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/api/client';
import { 
  Building, Shield, Bell, Database, Palette, 
  Lock, Save, ChevronRight, Mail, Phone, MapPin
} from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { useCurrentSchool } from '../../shared/hooks/useCurrentSchool';

type SchoolConfig = Record<string, unknown> & {
  nationalCode?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

type SchoolProfile = {
  id: string;
  name: string;
  address?: string | null;
  config?: SchoolConfig | null;
};

type SettingsForm = {
  name: string;
  address: string;
  nationalCode: string;
  contactEmail: string;
  contactPhone: string;
};

const emptyForm: SettingsForm = {
  name: '',
  address: '',
  nationalCode: '',
  contactEmail: '',
  contactPhone: '',
};

const toSettingsForm = (school?: SchoolProfile): SettingsForm => {
  if (!school) return emptyForm;
  const config = (school.config ?? {}) as SchoolConfig;
  return {
    name: school.name ?? '',
    address: school.address ?? '',
    nationalCode: typeof config.nationalCode === 'string' ? config.nationalCode : '',
    contactEmail: typeof config.contactEmail === 'string' ? config.contactEmail : '',
    contactPhone: typeof config.contactPhone === 'string' ? config.contactPhone : '',
  };
};

const normalizeForm = (form: SettingsForm): SettingsForm => ({
  name: form.name.trim(),
  address: form.address.trim(),
  nationalCode: form.nationalCode.trim(),
  contactEmail: form.contactEmail.trim(),
  contactPhone: form.contactPhone.trim(),
});

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentSchoolId, isLoading: isSchoolLoading } = useCurrentSchool();
  const [activeTab, setActiveTab] = useState('school');
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [savedSnapshot, setSavedSnapshot] = useState<SettingsForm>(emptyForm);

  const { data: school, isLoading } = useQuery({
    queryKey: ['school-profile', currentSchoolId],
    enabled: !!currentSchoolId,
    queryFn: async () => {
      const { data } = await api.get<SchoolProfile>(`/school/${currentSchoolId}`);
      return data;
    }
  });

  useEffect(() => {
    const nextForm = toSettingsForm(school);
    setForm(nextForm);
    setSavedSnapshot(nextForm);
  }, [school]);

  const isDirty = useMemo(() => {
    return JSON.stringify(normalizeForm(form)) !== JSON.stringify(normalizeForm(savedSnapshot));
  }, [form, savedSnapshot]);

  const handleFieldChange = (field: keyof SettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!currentSchoolId) {
        throw new Error('Aucun établissement actif');
      }

      const normalized = normalizeForm(form);
      const baseConfig = ((school?.config ?? {}) as SchoolConfig);
      const payload = {
        name: normalized.name,
        address: normalized.address || null,
        config: {
          ...baseConfig,
          nationalCode: normalized.nationalCode || null,
          contactEmail: normalized.contactEmail || null,
          contactPhone: normalized.contactPhone || null,
        },
      };

      return api.put(`/school/${currentSchoolId}`, payload);
    },
    onSuccess: async () => {
      const normalized = normalizeForm(form);
      setForm(normalized);
      setSavedSnapshot(normalized);
      await queryClient.invalidateQueries({ queryKey: ['school-profile', currentSchoolId] });
      alert('Paramètres enregistrés avec succès.');
    }
  });

  if (isLoading || isSchoolLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header Professionnel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-3 px-3 py-1 bg-indigo-50 rounded-full w-fit">
             <Building size={12} />
             Configuration du Système
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Paramètres <span className="text-indigo-600">Avancés</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Gérez l'identité de votre école et configurez les services.
          </p>
        </div>
        
        <Button
          className="gap-2 shadow-indigo"
          onClick={() => updateMutation.mutate()}
          loading={updateMutation.isPending}
          disabled={!isDirty}
        >
           <Save size={16} />
           <span>Tout Enregistrer</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Latérale */}
        <aside className="lg:col-span-4 space-y-3">
           <SettingsTab icon={Building} label="Établissement" active={activeTab === 'school'} onClick={() => setActiveTab('school')} />
           <SettingsTab icon={Shield} label="Sécurité & Rôles" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
           <SettingsTab icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
           <SettingsTab icon={Palette} label="Apparence" active={activeTab === 'design'} onClick={() => setActiveTab('design')} />
           <SettingsTab icon={Database} label="Données & Export" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
        </aside>

        {/* Contenu Principal */}
        <div className="lg:col-span-8">
           <Card className="border-slate-200 shadow-soft">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                 <h3 className="text-xl font-bold text-slate-900 tracking-tight">Profil de l'Établissement</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Identité visuelle et informations de contact</p>
              </div>

              <CardContent className="p-8 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de l'école</label>
                       <input 
                         value={form.name}
                         onChange={handleFieldChange('name')}
                         className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code National</label>
                       <input 
                         value={form.nationalCode}
                         onChange={handleFieldChange('nationalCode')}
                         className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Physique</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                         value={form.address}
                         onChange={handleFieldChange('address')}
                         className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de contact</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            value={form.contactEmail}
                            onChange={handleFieldChange('contactEmail')}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            value={form.contactPhone}
                            onChange={handleFieldChange('contactPhone')}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <Button
                      variant="outline"
                      className="text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                      onClick={() => updateMutation.mutate()}
                      loading={updateMutation.isPending}
                      disabled={!isDirty}
                    >
                       Sauvegarder ce module
                    </Button>
                 </div>
              </CardContent>
           </Card>

           {/* Zone de Danger Refactorisée */}
           <div className="mt-8 p-8 bg-red-50 rounded-2xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Lock size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900">Archivage de l'année</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Cette action clôturera l'année scolaire 2024-2025.</p>
                 </div>
              </div>
              <Button variant="danger" className="shadow-lg">Lancer l'archivage</Button>
           </div>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group border ${
      active 
        ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo" 
        : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200/60 shadow-sm"
    }`}
  >
    <div className="flex items-center gap-3">
       <Icon size={18} strokeWidth={active ? 3 : 2} />
       <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
    </div>
    <ChevronRight size={14} className={active ? "text-indigo-300" : "text-slate-300"} />
  </button>
);

const SettingsSkeleton = () => (
  <div className="space-y-8 animate-pulse pb-16">
    <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
    <div className="grid grid-cols-12 gap-8">
       <div className="col-span-4 space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl"></div>)}
       </div>
       <div className="col-span-8">
          <div className="h-[500px] bg-slate-100 rounded-2xl"></div>
       </div>
    </div>
  </div>
);

export default SettingsPage;
