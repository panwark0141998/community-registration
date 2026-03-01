const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
    try {
        console.log('Fetching users...');
        const users = await prisma.user.findMany();
        console.log('Fetching families...');
        const families = await prisma.family.findMany();
        console.log('Fetching members...');
        const members = await prisma.member.findMany();

        const data = { users, families, members };
        fs.writeFileSync(path.join(__dirname, 'data-export.json'), JSON.stringify(data, null, 2));
        console.log('Data exported to data-export.json');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
