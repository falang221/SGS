import React from 'react';
import { Button } from '../shared/ui/components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../shared/ui/components/Card';
import { Badge } from '../shared/ui/components/Badge';
import { Input } from '../shared/ui/components/Input';
import { Skeleton } from '../shared/ui/components/Skeleton';
import { Search, Mail, Lock, User, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const DesignSystemPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-20">
      <section>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Design System</h1>
        <p className="text-slate-500 max-w-2xl">
          Voici les composants UI premium utilisés dans l'application SGS. Chaque composant est conçu pour être accessible, réactif et esthétique.
        </p>
      </section>

      {/* Boutons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Boutons</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Principal</Button>
              <Button variant="secondary">Secondaire</Button>
              <Button variant="outline">Contour</Button>
              <Button variant="ghost">Fantôme</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Succès</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button size="sm">Petit</Button>
              <Button size="md">Moyen</Button>
              <Button size="lg">Grand</Button>
              <Button loading>Chargement</Button>
              <Button disabled>Désactivé</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Badges */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Badges</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Défaut</Badge>
              <Badge variant="secondary">Secondaire</Badge>
              <Badge variant="outline">Contour</Badge>
              <Badge variant="info">Information</Badge>
              <Badge variant="success">Succès</Badge>
              <Badge variant="warning">Attention</Badge>
              <Badge variant="destructive">Erreur</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Formulaires */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Formulaires</h2>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input 
              label="Nom d'utilisateur" 
              placeholder="Entrez votre nom" 
              leftIcon={<User size={18} />} 
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="votre@email.com" 
              leftIcon={<Mail size={18} />} 
            />
            <Input 
              label="Mot de passe" 
              type="password" 
              placeholder="••••••••" 
              leftIcon={<Lock size={18} />} 
            />
            <Input 
              label="Recherche avec erreur" 
              error="Ce champ est requis" 
              placeholder="Chercher quelque chose..." 
              rightIcon={<Search size={18} />}
            />
          </CardContent>
        </Card>
      </section>

      {/* Skeletons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Chargement (Skeletons)</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-[100px] w-full" />
          </CardContent>
        </Card>
      </section>

      {/* Feedback Visuals */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Feedback Visuel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                <CheckCircle size={20} />
             </div>
             <div>
                <p className="text-sm font-bold text-emerald-900 leading-none">Succès</p>
                <p className="text-xs text-emerald-600 mt-1">Action réussie !</p>
             </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <Info size={20} />
             </div>
             <div>
                <p className="text-sm font-bold text-blue-900 leading-none">Info</p>
                <p className="text-xs text-blue-600 mt-1">Nouvelle mise à jour.</p>
             </div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                <AlertTriangle size={20} />
             </div>
             <div>
                <p className="text-sm font-bold text-amber-900 leading-none">Attention</p>
                <p className="text-xs text-amber-600 mt-1">Vérifiez vos données.</p>
             </div>
          </div>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
             <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
                <Bell size={20} />
             </div>
             <div>
                <p className="text-sm font-bold text-red-900 leading-none">Alerte</p>
                <p className="text-xs text-red-600 mt-1">Paiement en retard.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemPage;
