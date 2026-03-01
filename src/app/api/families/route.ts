import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// Middleware to extract user from token (basic simulation)
const getUserFromToken = (req: NextRequest) => {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string; role: string };
    } catch (error) {
        return null;
    }
};

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { address, ...restBody } = await req.json();
        const familyData = { ...restBody, ...(address || {}) };

        // Auto-generate Family ID prefix: STATE(2) + DISTRICT(2) + VILLAGE(2)
        const statePrefix = (familyData.state || "XX").substring(0, 2).toUpperCase();
        const districtPrefix = (familyData.district || "XX").substring(0, 2).toUpperCase();
        const villagePrefix = (familyData.village || "XX").substring(0, 2).toUpperCase();
        const prefix = `${statePrefix}${districtPrefix}${villagePrefix}`;

        // Find last family with this prefix to get the next sequential number
        const lastFamilies = await supabase.from('Family')
            .select('familyId')
            .like('familyId', `${prefix}%`)
            .order('familyId', { ascending: false })
            .limit(1)
            .all();

        let nextNumber = 1;
        if (lastFamilies && lastFamilies.length > 0) {
            const lastId = lastFamilies[0].familyId;
            const lastNumStr = lastId.substring(6);
            const lastNum = parseInt(lastNumStr);
            if (!isNaN(lastNum)) {
                nextNumber = lastNum + 1;
            }
        }

        const generatedFamilyId = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

        // Use generated ID if user didn't provide one
        if (!familyData.familyId) {
            familyData.familyId = generatedFamilyId;
        }

        // Check if familyId already exists (manual or generated)
        const familiesRes = await supabase.from('Family').select('id, familyId').eq('familyId', familyData.familyId).all();

        if (familiesRes && familiesRes.length > 0) {
            return NextResponse.json({ error: "Family ID already exists" }, { status: 400 });
        }

        const data: any = {
            ...familyData,
            representativeId: user.userId,
        };

        if (data.headDob && data.headDob !== "") {
            const date = new Date(data.headDob);
            data.headDob = isNaN(date.getTime()) ? null : date;
        } else {
            data.headDob = null;
        }

        console.log("Inserting Family Data:", data);
        const newFamily = await supabase.from('Family').insert(data);

        return NextResponse.json({ message: "Family created successfully", family: newFamily, generatedId: generatedFamilyId }, { status: 201 });
    } catch (error: any) {
        console.error("Family Creation Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message,
            details: error.toString()
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // If admin, return limit of max 50 families to prevent massive payload freeze. 
        // A proper pagination should be implemented for admin later.
        let families;
        if (user.role === "admin") {
            families = await supabase.from('Family').select('*').limit(50).all();
        } else {
            families = await supabase.from('Family').select('*').eq('representativeId', user.userId).all();
        }

        return NextResponse.json(families, { status: 200 });
    } catch (error) {
        console.error("Family Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
