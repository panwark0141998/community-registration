import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

        // Community-wide stats via Supabase (Note: Postgrest grouping is limited, fetching counts)
        const allFamilies = await supabase.from('Family').select('id, state, district, village, representativeId').all();
        const allMembers = await supabase.from('Member').select('id, gender, isAlive').all();

        const totalFamilies = allFamilies.length;
        const totalMembers = allMembers.length;
        const aliveMembers = allMembers.filter((m: any) => m.isAlive).length;
        const maleMembers = allMembers.filter((m: any) => m.gender === "Male").length;
        const femaleMembers = allMembers.filter((m: any) => m.gender === "Female").length;

        // Simple aggregation logic for geography
        const geoStats = (items: any[], key: string) => {
            const counts: any = {};
            items.forEach(item => {
                if (item[key]) counts[item[key]] = (counts[item[key]] || 0) + 1;
            });
            if (key === 'state') {
                return Object.entries(counts)
                    .map(([name, count]) => ({ name, count: count as number }))
                    .sort((a, b) => b.count - a.count);
            }
            return Object.entries(counts)
                .map(([name, count]) => ({ name, count: count as number }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
        };

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
            }
        };

        // If user is not admin, add their personal contribution stats
        if (user.role !== "admin") {
            const myFamilies = allFamilies.filter((f: any) => f.representativeId === user.userId).length;
            stats.myFamilies = myFamilies;
        }

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error("Stats Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
