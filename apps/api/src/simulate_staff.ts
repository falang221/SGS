import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function simulateAddStaff() {
  console.log('--- Simulation Ajout Staff ---');

  // 1. Récupérer l'école existante (créée lors du seed)
  const school = await prisma.school.findFirst();
  if (!school) {
    console.error("Erreur: Aucune école trouvée. Veuillez lancer le seed d'abord.");
    return;
  }

  const staffEmail = 'prof.ndiaye@ecole.sn';
  
  // 2. Vérifier si le staff existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email: staffEmail } });
  if (existingUser) {
    console.log(`Le collaborateur ${staffEmail} existe déjà.`);
    return;
  }

  const hashedPassword = await bcrypt.hash('SGS12345!', 12);

  // 3. Création atomique (Transaction)
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: staffEmail,
          password: hashedPassword,
          role: 'ENSEIGNANT',
          tenantId: school.tenantId,
        }
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          role: 'Professeur de Mathématiques',
          salary: 350000,
          contractType: 'CDI'
        }
      });

      return { user, staff };
    });

    console.log('✅ Simulation réussie !');
    console.log(`- Email: ${result.user.email}`);
    console.log(`- Poste: ${result.staff.role}`);
    console.log(`- Salaire: ${result.staff.salary} F`);
    
    // 4. Vérifier les logs d'audit (optionnel pour la simulation)
    await prisma.auditLog.create({
        data: {
            userId: null, // Système
            action: 'SIMULATION_STAFF_CREATE',
            resource: 'STAFF',
            newValue: result.staff as any
        }
    });

  } catch (error) {
    console.error('Erreur lors de la simulation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAddStaff();
