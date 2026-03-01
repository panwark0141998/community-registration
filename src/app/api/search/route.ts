import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";
import * as fs from 'fs';

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

        const searchParams = req.nextUrl.searchParams;
        const query = (searchParams.get("q") || "").toLowerCase();
        const caste = searchParams.get("caste") || "";
        const district = searchParams.get("district") || "";
        const village = searchParams.get("village") || "";
        const state = searchParams.get("state") || "";

        const logFile = "C:/Users/panwa/.gemini/antigravity/scratch/community-registration/search-debug.log";
        const ts = new Date().toISOString();
        fs.appendFileSync(logFile, `\n[${ts}] Request: query=${query}, state=${state}, district=${district}, village=${village}, caste=${caste}\n`);
        console.log("Search APi Params:", { query, state, district, village, caste });


        // Build base family query with robust server-side filters
        let familyQuery = supabase.from('Family').select('*');

        if (state) familyQuery = familyQuery.ilike('state', `%${state}%`);
        if (district) familyQuery = familyQuery.ilike('district', `%${district}%`);
        if (village) familyQuery = familyQuery.ilike('village', `%${village}%`);
        if (caste) familyQuery = familyQuery.ilike('caste', `%${caste}%`);

        let familiesRes: any[] = [];

        if (query) {
            fs.appendFileSync(logFile, `[${ts}] Executing complex search for: ${query}\n`);
            // Complex search: Find families matching (headOfFamily OR familyId)
            // AND separately find members matching fullName to get their familyIds

            // 1. Fast search on Members table
            const matchingMembers = await supabase.from('Member')
                .select('familyId')
                .ilike('fullName', `%${query}%`)
                .limit(100)
                .all();

            const memberFamilyIds = Array.isArray(matchingMembers)
                ? matchingMembers.map((m: any) => m.familyId)
                : [];

            // 2. Build the robust OR condition for family fetch
            let orCondition = `headOfFamily.ilike.%${query}%,familyId.ilike.%${query}%`;

            // If we found specific members, include their parents in the family query
            if (memberFamilyIds.length > 0) {
                const uniqueIds = [...new Set(memberFamilyIds)];
                orCondition += `,id.in.(${uniqueIds.join(',')})`;
            }

            // Execute complex family filter
            familyQuery = familyQuery.or(`(${orCondition})`);
            familiesRes = await familyQuery.limit(50).all();

        } else {
            fs.appendFileSync(logFile, `[${ts}] Executing simple query fetch...\n`);
            // No global text query, just execute structural filters
            familiesRes = await familyQuery.limit(50).all();
            fs.appendFileSync(logFile, `[${ts}] Simple query fetch returned records: ${familiesRes ? familiesRes.length : "undefined/null"}\n`);
        }

        const rawFamilies = Array.isArray(familiesRes) ? familiesRes : [];
        fs.appendFileSync(logFile, `[${ts}] Final rawFamilies length: ${rawFamilies.length}\n`);

        // Now, fetch members ONLY for the families we actually retrieved
        let allMembers: any[] = [];
        if (rawFamilies.length > 0) {
            const familyIds = rawFamilies.map(f => f.id);
            const membersRes = await supabase.from('Member')
                .select('*')
                .filter('familyId', 'in', `(${familyIds.join(',')})`)
                .all();

            allMembers = Array.isArray(membersRes) ? membersRes : [];
        }

        // Map members precisely to families
        const results = rawFamilies.map(f => ({
            ...f,
            members: allMembers.filter(m => m.familyId === f.id).map(m => ({ ...m, id: m.id }))
        }));

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

