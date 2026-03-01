import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const getUserFromToken = (req: NextRequest) => {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string; role: string };
    } catch (error) {
        return null;
    }
};

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch all families and members using Prisma
        const allFamilies = await prisma.family.findMany({
            select: { id: true, state: true, district: true, village: true, representativeId: true, headOfFamily: true, headDob: true }
        });
        const allMembers = await prisma.member.findMany({
            select: { id: true, fullName: true, dob: true, gender: true, isAlive: true, familyId: true }
        });

        const totalFamilies = allFamilies.length;
        const totalMembers = allMembers.length;
        const aliveMembers = allMembers.filter(m => m.isAlive).length;
        const maleMembers = allMembers.filter(m => m.gender === "Male").length;
        const femaleMembers = allMembers.filter(m => m.gender === "Female").length;

        // Simple aggregation logic for geography
        const geoStats = (items: any[], key: string) => {
            const counts: any = {};
            items.forEach(item => {
                const val = (item as any)[key];
                if (val) counts[val] = (counts[val] || 0) + 1;
            });
            const result = Object.entries(counts)
                .map(([name, count]) => ({ name, count: count as number }))
                .sort((a, b) => b.count - a.count);

            return key === 'state' ? result : result.slice(0, 10);
        };

        // --- Birthday Logic ---
        const today = new Date();
        const upcomingBirthdays: any[] = [];

        const checkBirthday = (dob: Date | null, name: string, familyId: string, isHead = false) => {
            if (!dob) return;
            const bDate = new Date(dob);

            // Generate comparison dates for today, +1, +2
            for (let i = 0; i < 3; i++) {
                const target = new Date();
                target.setDate(today.getDate() + i);

                if (bDate.getMonth() === target.getMonth() && bDate.getDate() === target.getDate()) {
                    // Avoid duplicates if head is also listed as a member
                    const exists = upcomingBirthdays.find(b => b.name === name && b.familyId === familyId);
                    if (!exists) {
                        upcomingBirthdays.push({
                            name,
                            dob: bDate,
                            daysUntil: i,
                            familyId,
                            isHead
                        });
                    }
                }
            }
        };

        // Check members
        allMembers.forEach(m => checkBirthday(m.dob, m.fullName, m.familyId));
        // Check heads
        allFamilies.forEach(f => checkBirthday(f.headDob, f.headOfFamily, f.id, true));

        const stats: any = {
            totalFamilies,
            totalMembers,
            aliveMembers,
            deceasedMembers: totalMembers - aliveMembers,
            demographics: { male: maleMembers, female: femaleMembers },
            geography: {
                byState: geoStats(allFamilies, 'state'),
                byDistrict: geoStats(allFamilies, 'district'),
                byVillage: geoStats(allFamilies, 'village')
            },
            upcomingBirthdays: upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil)
        };

        // If user is not admin, add their personal contribution stats
        if (user.role !== "admin") {
            const myFamilies = allFamilies.filter(f => f.representativeId === user.userId).length;
            stats.myFamilies = myFamilies;
        }

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error("Stats Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

