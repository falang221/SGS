require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');
  const hashedPassword = await bcrypt.hash('admin12345', 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'ecole-excellence' },
    update: {},
    create: {
      name: 'École Excellence Sénégal',
      slug: 'ecole-excellence',
      plan: 'PREMIUM',
    },
  });

  const school = await prisma.school.create({
    data: {
      tenantId: tenant.id,
      name: 'Excellence Dakar - Campus Plateau',
      type: 'COMPLEX',
      address: 'Avenue Pompidou, Dakar',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecole.sn' },
    update: {},
    create: {
      email: 'admin@ecole.sn',
      password: hashedPassword,
      role: 'DIRECTEUR',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Admin créé:', admin.email);
  console.log('Seeding terminé.');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
