const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Use the IP address and include endpoint ID in the password for SNI-less routing
const neonUrl = "postgresql://neondb_owner:endpoint=ep-damp-base-abmc3ie5;npg_SgOB0mPX2wDZ@13.41.250.251:5432/neondb?sslmode=no-verify";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: neonUrl,
        },
    },
});

const db = new sqlite3.Database('./dev.db');
const dbAll = promisify(db.all).bind(db);

async function migrate() {
    try {
        console.log('Fetching local data from SQLite...');
        const users = await dbAll('SELECT * FROM User');
        const families = await dbAll('SELECT * FROM Family');
        const members = await dbAll('SELECT * FROM Member');

        console.log(`Found ${users.length} users, ${families.length} families, ${members.length} members.`);

        console.log('Connecting to Neon via IPv4...');

        // 1. Migrate Users
        console.log('Migrating Users...');
        for (const user of users) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: {
                    name: user.name,
                    password: user.password,
                    role: user.role,
                    phone: user.phone,
                    status: user.status,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                },
                create: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    password: user.password,
                    role: user.role,
                    phone: user.phone,
                    status: user.status,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                },
            });
        }

        // 2. Migrate Families
        console.log('Migrating Families...');
        for (const family of families) {
            await prisma.family.upsert({
                where: { id: family.id },
                update: {
                    familyId: family.familyId,
                    representativeId: family.representativeId,
                    headOfFamily: family.headOfFamily,
                    headGender: family.headGender,
                    headDob: family.headDob ? new Date(family.headDob) : null,
                    fatherName: family.fatherName,
                    motherName: family.motherName,
                    state: family.state,
                    district: family.district,
                    subDistrict: family.subDistrict,
                    village: family.village,
                    pincode: family.pincode,
                    contactNumber: family.contactNumber,
                    caste: family.caste,
                    createdAt: new Date(family.createdAt),
                    updatedAt: new Date(family.updatedAt),
                },
                create: {
                    id: family.id,
                    familyId: family.familyId,
                    representativeId: family.representativeId,
                    headOfFamily: family.headOfFamily,
                    headGender: family.headGender,
                    headDob: family.headDob ? new Date(family.headDob) : null,
                    fatherName: family.fatherName,
                    motherName: family.motherName,
                    state: family.state,
                    district: family.district,
                    subDistrict: family.subDistrict,
                    village: family.village,
                    pincode: family.pincode,
                    contactNumber: family.contactNumber,
                    caste: family.caste,
                    createdAt: new Date(family.createdAt),
                    updatedAt: new Date(family.updatedAt),
                },
            });
        }

        // 3. Migrate Members
        console.log('Migrating Members...');
        for (const member of members) {
            await prisma.member.upsert({
                where: { id: member.id },
                update: {
                    familyId: member.familyId,
                    fullName: member.fullName,
                    gender: member.gender,
                    dob: new Date(member.dob),
                    relationshipToHead: member.relationshipToHead,
                    maritalStatus: member.maritalStatus,
                    isAlive: member.isAlive === 1,
                    createdAt: new Date(member.createdAt),
                    updatedAt: new Date(member.updatedAt),
                },
                create: {
                    id: member.id,
                    familyId: member.familyId,
                    fullName: member.fullName,
                    gender: member.gender,
                    dob: new Date(member.dob),
                    relationshipToHead: member.relationshipToHead,
                    maritalStatus: member.maritalStatus,
                    isAlive: member.isAlive === 1,
                    createdAt: new Date(member.createdAt),
                    updatedAt: new Date(member.updatedAt),
                },
            });
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await prisma.$disconnect();
        db.close();
    }
}

migrate();
