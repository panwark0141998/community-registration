const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Use the IP-based connection for stable local-to-neon seeding
const neonUrl = "postgresql://neondb_owner:endpoint=ep-damp-base-abmc3ie5;npg_SgOB0mPX2wDZ@13.41.250.251:5432/neondb?sslmode=no-verify";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: neonUrl,
        },
    },
});

async function main() {
    console.log('Starting Location Seeding...');

    // Check if locations already exist to avoid double seeding
    const count = await prisma.location.count();
    if (count > 0) {
        console.log(`Database already has ${count} locations. Skipping seed.`);
        return;
    }

    const filePath = path.join(__dirname, '..', 'data', 'rajasthan-locations.json');
    const locations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Found ${locations.length} locations to seed.`);

    const batchSize = 1000;
    for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize).map(loc => ({
            state: loc.state,
            district: loc.district,
            subDistrict: loc.subDistrict,
            village: loc.village,
            vlistCode: loc.vlistCode || null
        }));

        await prisma.location.createMany({
            data: batch
        });

        console.log(`Seeded ${Math.min(i + batchSize, locations.length)} / ${locations.length}...`);
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
