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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const member = await supabase.from('Member')
            .select('*,family:Family(*)')
            .eq('id', id)
            .single();

        if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

        // Authorization check
        if (user.role !== "admin" && member.family?.representativeId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error("Member GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        const member = await supabase.from('Member')
            .select('*,family:Family(*)')
            .eq('id', id)
            .single();

        if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

        if (user.role !== "admin" && member.family?.representativeId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Sanitize update data - only allow specific fields
        const updateData: any = {};
        const allowedFields = [
            "fullName", "gender", "dob", "relationshipToHead",
            "fatherName", "motherName", "fatherState", "fatherDistrict", "fatherSubDistrict", "fatherVillage", "maritalStatus", "spouseName",
            "education", "occupation", "bloodGroup", "isAlive", "memberPhoto", "fatherPincode", "fatherPincodeVillages"
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        // Parse date
        if (updateData.dob && updateData.dob !== "") {
            const date = new Date(updateData.dob);
            updateData.dob = isNaN(date.getTime()) ? null : date;
        }

        const updatedMember = await supabase.from('Member')
            .update(updateData)
            .eq('id', id);

        return NextResponse.json({ message: "Member updated", member: updatedMember });
    } catch (error) {
        console.error("Member Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const member = await supabase.from('Member')
            .select('*,family:Family(*)')
            .eq('id', id)
            .single();

        if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

        if (user.role !== "admin" && member.family?.representativeId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await supabase.from('Member')
            .delete()
            .eq('id', id);

        return NextResponse.json({ message: "Member deleted successfully" });
    } catch (error) {
        console.error("Member DELETE Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
