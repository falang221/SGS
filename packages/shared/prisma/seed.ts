const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SEEDED_SCHOOL_ID = '550e8400-e29b-41d4-a716-446655440000';
const SEEDED_DIRECTOR_EMAIL = 'directeur@ecole.sn';
const SEEDED_DIRECTOR_PASSWORD = 'admin12345';
const SEEDED_STUDENT_MATRICULE = 'MAT-2024-001';
const SEEDED_YEAR_ID = '2024-2025';

async function main() {
  console.log('🚀 Démarrage de l\'initialisation du Chef-d\'Œuvre SGS...');
  const hashedPassword = await bcrypt.hash(SEEDED_DIRECTOR_PASSWORD, 12);

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
    where: { id: SEEDED_SCHOOL_ID }, // ID fixe pour le dev/démo
    update: {},
    create: {
      id: SEEDED_SCHOOL_ID,
      tenantId: tenant.id,
      name: 'Excellence Dakar - Campus Plateau',
      type: 'COMPLEX',
      address: 'Avenue Pompidou, Dakar, Sénégal',
    },
  });

  // 3. Création du Super Admin Système
  const admin = await prisma.user.upsert({
    where: { email: 'superadmin@sgs.sn' },
    update: { 
      role: 'SUPER_ADMIN',
      firstName: 'Abdoulaye',
      lastName: 'Wade',
      tenantId: tenant.id,
      permissions: [],
    },
    create: {
      email: 'superadmin@sgs.sn',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      firstName: 'Abdoulaye',
      lastName: 'Wade',
      tenantId: tenant.id,
      permissions: [],
    },
  });

  console.log('✅ Super Admin créé:', admin.email);

  const director = await prisma.user.upsert({
    where: { email: SEEDED_DIRECTOR_EMAIL },
    update: {
      role: 'DIRECTEUR',
      firstName: 'Aminata',
      lastName: 'Ndiaye',
      tenantId: tenant.id,
      permissions: [],
    },
    create: {
      email: SEEDED_DIRECTOR_EMAIL,
      password: hashedPassword,
      role: 'DIRECTEUR',
      firstName: 'Aminata',
      lastName: 'Ndiaye',
      tenantId: tenant.id,
      permissions: [],
    },
  });

  console.log('✅ Directeur créé:', director.email);

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

  const seededClasses = [];

  for (const c of classes) {
    let schoolClass = await prisma.class.findFirst({
      where: {
        schoolId: school.id,
        name: c.name,
        deletedAt: null,
      },
    });

    if (!schoolClass) {
      schoolClass = await prisma.class.create({
        data: { ...c, schoolId: school.id }
      });
    }

    seededClasses.push(schoolClass);
  }

  const seededStudent = await prisma.student.upsert({
    where: { matricule: SEEDED_STUDENT_MATRICULE },
    update: {
      schoolId: school.id,
      firstName: 'Mariam',
      lastName: 'Diop',
      birthDate: new Date('2012-05-14T00:00:00.000Z'),
    },
    create: {
      schoolId: school.id,
      firstName: 'Mariam',
      lastName: 'Diop',
      birthDate: new Date('2012-05-14T00:00:00.000Z'),
      matricule: SEEDED_STUDENT_MATRICULE,
    },
  });

  const primaryClass = seededClasses[0];

  if (primaryClass) {
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: seededStudent.id,
        classId: primaryClass.id,
        yearId: SEEDED_YEAR_ID,
        deletedAt: null,
      },
    });

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          studentId: seededStudent.id,
          classId: primaryClass.id,
          yearId: SEEDED_YEAR_ID,
          feesTotal: 250000,
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log(`
✅ INITIALISATION RÉUSSIE
------------------------------------------------
🌍 Tenant  : ${tenant.name}
🏫 École   : ${school.name}
👤 Admin   : ${admin.email}
👩 Direction : ${director.email}
🧒 Élève seed : ${SEEDED_STUDENT_MATRICULE}
🔑 Pass    : ${SEEDED_DIRECTOR_PASSWORD}
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
