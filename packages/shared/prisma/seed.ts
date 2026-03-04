const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Démarrage de l\'initialisation du Chef-d\'Œuvre SGS...');
  const hashedPassword = await bcrypt.hash('admin12345', 12);

  // 1. Création du Tenant Racine
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'groupe-scolaire-excellence' },
    update: {},
    create: {
      name: 'Groupe Scolaire Excellence',
      slug: 'groupe-scolaire-excellence',
      plan: 'ENTERPRISE',
    },
  });

  // 2. Création de l'École Pilote
  const school = await prisma.school.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' }, // ID fixe pour le dev/démo
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      tenantId: tenant.id,
      name: 'Excellence Dakar - Campus Plateau',
      type: 'COMPLEX',
      address: 'Avenue Pompidou, Dakar, Sénégal',
    },
  });

  // 3. Création du Super Admin Système
  const admin = await prisma.user.upsert({
    where: { email: 'superadmin@sgs.sn' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: 'superadmin@sgs.sn',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Super Admin créé:', admin.email);

  // 4. Configuration Pédagogique par défaut
  console.log('📦 Configuration des matières et classes...');
  
  const subjects = [
    { name: 'Mathématiques', coefficient: 4, code: 'MATH' },
    { name: 'Français', coefficient: 4, code: 'FRAN' },
    { name: 'Sciences de la Vie et de la Terre', coefficient: 2, code: 'SVT' },
    { name: 'Histoire-Géographie', coefficient: 2, code: 'HIST-GEO' },
    { name: 'Anglais', coefficient: 3, code: 'ANG' },
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { schoolId_name: { schoolId: school.id, name: s.name } },
      update: {},
      create: { ...s, schoolId: school.id }
    }).catch(() => {}); // Ignorer si contrainte schoolId_name n'existe pas encore
  }

  const classes = [
    { name: 'Sixième A', level: '6ème' },
    { name: 'Cinquième B', level: '5ème' },
    { name: 'Terminale S1', level: 'Tle' },
  ];

  for (const c of classes) {
    await prisma.class.create({
      data: { ...c, schoolId: school.id }
    }).catch(() => {});
  }

  console.log(`
✅ INITIALISATION RÉUSSIE
------------------------------------------------
🌍 Tenant  : ${tenant.name}
🏫 École   : ${school.name}
👤 Admin   : ${admin.email}
🔑 Pass    : admin12345
------------------------------------------------
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erreur critique lors de l\'initialisation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
