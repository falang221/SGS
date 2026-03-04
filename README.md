# 🎓 SGS - Système de Gestion Scolaire (Version 2.0)

![SGS Banner](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200&h=400)

**SGS** est une plateforme SaaS de gestion scolaire de nouvelle génération, conçue spécifiquement pour répondre aux besoins d'excellence des établissements éducatifs au Sénégal. Elle offre un pilotage stratégique complet, allant de la gestion administrative au recouvrement financier digital.

## ✨ Caractéristiques "Chef-d'œuvre"

### 🛡️ Architecture & Sécurité
- **Multi-Tenant Natif** : Isolation stricte des données par école via Row Level Security (RLS) au niveau de l'ORM Prisma.
- **Audit Log Complet** : Traçabilité de chaque action administrative avec filtrage automatique des données sensibles.
- **Sécurité Bancaire** : Authentification par JWT avec rotation de tokens et protection contre les vulnérabilités OWASP.

### 🎨 Design & Expérience Utilisateur
- **Interface "Electric Midnight"** : Design moderne, immersif et responsive.
- **Micro-interactions** : Animations fluides avec Framer Motion.
- **Performance Perçue** : Utilisation systématique de Skeletons pour un chargement instantané.

### 📚 Modules Métier Avancés
- **Gestion Académique** : Registre digital de notes, calcul pondéré des moyennes et classement live.
- **Finances Digitales** : Suivi des encaissements en temps réel, intégration Wave/Orange Money et relances automatiques.
- **Ressources Humaines** : Gestion complète du personnel, contrats CDI/CDD et registre de paie automatisé.
- **Édition Premium** : Génération de bulletins scolaires PDF haute définition avec QR Code de certification.

## 🛠️ Stack Technique

- **Monorepo** : [pnpm](https://pnpm.io/)
- **Frontend** : [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [TanStack Query](https://tanstack.com/query/latest)
- **Backend** : [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **ORM** : [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Traitement Asynchrone** : [BullMQ](https://optimalbits.github.io/bull/) (Redis)
- **Génération PDF** : [Puppeteer](https://pptr.dev/)

## 🚀 Déploiement Rapide (Docker)

Assurez-vous d'avoir Docker et Docker Compose installés.

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-compte/sgs-app.git
   cd sgs-app
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditez le fichier .env avec vos secrets
   ```

3. **Lancer la production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

L'application sera accessible sur :
- **Frontend** : `http://localhost`
- **API** : `http://localhost:3001`

## 👨‍💻 Installation (Développement)

```bash
# 1. Installer les dépendances
pnpm install

# 2. Générer le client Prisma
pnpm -F @school-mgmt/shared prisma generate

# 3. Lancer les services en mode dev
pnpm dev
```

## 📝 Licence

Propriété exclusive de Postefinances / Système Éducatif Sénégalais. &copy; 2026.
