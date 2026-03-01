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
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 403 });
        }

        // Fetch all family reps (limited to 50 for performance until pagination is implemented)
        const users = await supabase.from('User')
            .select('id, name, email, phone, role, status, createdAt, updatedAt')
            .eq('role', 'family_rep')
            .order('createdAt', { ascending: false })
            .limit(50)
            .all();

        // Map id to _id for frontend compatibility since we refactored
        const formattedUsers = users.map((u: any) => ({ ...u, _id: u.id }));

        return NextResponse.json(formattedUsers, { status: 200 });
    } catch (error) {
        console.error("Admin Users Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
