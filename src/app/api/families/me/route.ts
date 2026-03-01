import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        const families = await prisma.family.findMany({
            where: {
                representativeId: user.userId
            },
            include: {
                members: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Fallback for Admins - IF FAMILIES IS EMPTY, SHOW FIRST FAMILY
        if (families.length === 0 && user.role === "admin") {
            const firstFamily = await prisma.family.findFirst({
                include: {
                    members: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            if (firstFamily) {
                return NextResponse.json([{
                    ...firstFamily,
                    _debug: { userId: user.userId, role: user.role, status: 'admin_fallback' }
                }], { status: 200 });
            }
        }

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

