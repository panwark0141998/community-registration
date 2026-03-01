const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    const db = new Database('./dev.db', { readonly: true });

    console.log("Connected to local SQLite database via better-sqlite3.");

    try {
        const users = db.prepare('SELECT * FROM "User"').all();
        console.log(`Found ${users.length} users to migrate.`);
        for (const user of users) {
            try {
                await prisma.user.upsert({
                    where: { id: user.id },
                    create: {
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        name: user.name,
                        role: user.role,
                        phone: user.phone,
                        status: user.status,
                        createdAt: new Date(user.createdAt),
                        updatedAt: new Date(user.updatedAt)
                    },
                    update: {}
                });
            } catch (e) {
                console.error("Failed user:", user.email, e.message);
            }
        }

        const families = db.prepare('SELECT * FROM "Family"').all();
        console.log(`Found ${families.length} families to migrate.`);
        for (const family of families) {
            try {
                const districtVal = family.district || family.city || "";
                await prisma.family.upsert({
                    where: { id: family.id },
                    create: {
                        id: family.id,
                        familyId: family.familyId,
                        representativeId: family.representativeId,
                        headOfFamily: family.headOfFamily,
                        headGender: family.headGender,
                        headDob: family.headDob ? new Date(family.headDob) : null,
                        fatherName: family.fatherName,
                        motherName: family.motherName,
                        fatherState: family.fatherState,
                        fatherDistrict: family.fatherDistrict || family.fatherCity,
                        fatherSubDistrict: family.fatherSubDistrict,
                        fatherVillage: family.fatherVillage,
                        caste: family.caste,
                        street: family.street,
                        village: family.village,
                        subDistrict: family.subDistrict,
                        district: districtVal,
                        state: family.state,
                        pincode: family.pincode,
                        contactNumber: family.contactNumber,
                        familyPhoto: family.familyPhoto,
                        createdAt: new Date(family.createdAt),
                        updatedAt: new Date(family.updatedAt)
                    },
                    update: {}
                });
            } catch (e) {
                console.error("Failed family:", family.familyId, e.message);
            }
        }

        const members = db.prepare('SELECT * FROM "Member"').all();
        console.log(`Found ${members.length} members to migrate.`);
        for (const member of members) {
            try {
                await prisma.member.upsert({
                    where: { id: member.id },
                    create: {
                        id: member.id,
                        familyId: member.familyId,
                        fullName: member.fullName,
                        gender: member.gender,
                        dob: new Date(member.dob),
                        relationshipToHead: member.relationshipToHead,
                        fatherName: member.fatherName,
                        motherName: member.motherName,
                        fatherState: member.fatherState,
                        fatherDistrict: member.fatherDistrict || member.fatherCity,
                        fatherSubDistrict: member.fatherSubDistrict,
                        fatherVillage: member.fatherVillage,
                        maritalStatus: member.maritalStatus,
                        spouseName: member.spouseName,
                        education: member.education,
                        occupation: member.occupation,
                        bloodGroup: member.bloodGroup,
                        isAlive: member.isAlive === 1,
                        memberPhoto: member.memberPhoto,
                        createdAt: new Date(member.createdAt),
                        updatedAt: new Date(member.updatedAt)
                    },
                    update: {}
                });
            } catch (e) {
                console.error("Failed member:", member.fullName, e.message);
            }
        }
        console.log("Migration finished successfully!");
    } catch (e) {
        console.error("Migration fatal error:", e);
    } finally {
        await prisma.$disconnect();
        db.close();
    }
}

main().catch(console.error);
