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
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all families where this user is the representative
        const familiesRes = await supabase.from('Family')
            .select('*')
            .eq('representativeId', user.userId)
            .all();

        const rawFamilies = Array.isArray(familiesRes) ? familiesRes : [];
        console.log(`Found ${rawFamilies.length} families for User ID: ${user.userId}`);

        // Fetch members for these families separately to avoid join timeouts
        const familyIds = rawFamilies.map(f => f.id);
        let allMembers: any[] = [];

        if (familyIds.length > 0) {
            // Fetch members where familyId is in the list of family IDs
            const membersRes = await supabase.from('Member')
                .select('*')
                .filter('familyId', 'in', `(${familyIds.join(',')})`)
                .all();
            allMembers = Array.isArray(membersRes) ? membersRes : [];
        }

        // Map members back to their families
        const families = rawFamilies.map((f: any) => ({
            ...f,
            members: allMembers.filter((m: any) => m.familyId === f.id).map((m: any) => ({
                ...m,
                id: m.id
            }))
        }));

        // Fallback for Admins - IF FAMILIES IS EMPTY, SHOW FIRST FAMILY
        if (families.length === 0 && user.role === "admin") {
            const firstFamilyRes = await supabase.from('Family').select('*').limit(1).all();
            const firstFamily = Array.isArray(firstFamilyRes) && firstFamilyRes.length > 0 ? firstFamilyRes[0] : null;

            if (firstFamily) {
                const headMembersRes = await supabase.from('Member').select('*').eq('familyId', firstFamily.id).all();
                const headMembers = Array.isArray(headMembersRes) ? headMembersRes : [];

                return NextResponse.json([{
                    ...firstFamily,
                    members: headMembers.map((m: any) => ({ ...m, id: m.id })),
                    _debug: { userId: user.userId, role: user.role, status: 'admin_fallback' }
                }], { status: 200 });
            }
        }

        // Return processed families with debug info (hidden in array if needed, but array is fine)
        const response = families.map(f => ({ ...f, _debug: { userId: user.userId, role: user.role } }));
        return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
        console.error("Family Me Fetch Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}
