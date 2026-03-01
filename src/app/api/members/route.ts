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

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // Verify family belongs to this user or user is admin via Supabase
        const family = await supabase.from('Family').select('*').eq('id', body.familyId).single();

        if (!family) {
            return NextResponse.json({ error: "Family not found" }, { status: 404 });
        }

        if (user.role !== "admin" && family.representativeId !== user.userId) {
            return NextResponse.json({ error: "Forbidden. Inadequate permissions to add member to this family." }, { status: 403 });
        }

        // Sanitize creation data
        const creationData: any = {};
        const allowedFields = [
            "familyId", "fullName", "gender", "dob", "relationshipToHead",
            "fatherName", "motherName", "fatherState", "fatherDistrict", "fatherSubDistrict", "fatherVillage", "maritalStatus", "spouseName",
            "education", "occupation", "bloodGroup", "isAlive", "memberPhoto"
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                creationData[field] = body[field];
            }
        });

        // Parse date
        if (creationData.dob) {
            creationData.dob = new Date(creationData.dob);
        }

        const newMember = await supabase.from('Member').insert(creationData);

        return NextResponse.json({ message: "Member added successfully", member: newMember }, { status: 201 });
    } catch (error) {
        console.error("Member Creation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
