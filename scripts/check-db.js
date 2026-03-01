const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const familiesCount = await prisma.family.count();
    const membersCount = await prisma.member.count();
    const families = await prisma.family.findMany({
        take: 5,
        include: { _count: { select: { members: true } } }
    });

    console.log(`Total Families: ${familiesCount}`);
    console.log(`Total Members: ${membersCount}`);
    console.log("Recent Families:", JSON.stringify(families, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
