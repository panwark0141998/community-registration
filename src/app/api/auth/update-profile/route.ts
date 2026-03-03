import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const body = await req.json();
        const { name } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: { name: name.trim() },
            select: { id: true, name: true, email: true, role: true, status: true, phone: true }
        });

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
