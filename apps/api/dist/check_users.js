"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log(`Nombre d'utilisateurs: ${users.length}`);
    for (const user of users) {
        console.log(`- ${user.email} (${user.role})`);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
