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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromToken(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!["approved", "rejected", "pending"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updatedUser = await supabase.from('User')
            .update({ status })
            .eq('id', id);

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: `User status updated to ${status}`, user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Admin User Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
