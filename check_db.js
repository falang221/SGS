const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("Nombre d'utilisateurs en base :", users.length);
  users.forEach(u => console.log(`- Email: ${u.email}, Role: ${u.role}`));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
