import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string; role: string };

        const user = await supabase.from('User')
            .select('id, name, email, role, status')
            .eq('id', decoded.userId)
            .single();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Auth Me Error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
