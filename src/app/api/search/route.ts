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
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const searchParams = req.nextUrl.searchParams;
        const query = (searchParams.get("q") || "").trim();
        const caste = (searchParams.get("caste") || "").trim();
        const district = (searchParams.get("district") || "").trim();
        const village = (searchParams.get("village") || "").trim();
        const state = (searchParams.get("state") || "").trim();

        // Build where clause
        const where: any = {};

        if (state && state !== "allStates") {
            where.state = { contains: state, mode: 'insensitive' };
        }
        if (district && district !== "allDistricts") {
            where.district = { contains: district, mode: 'insensitive' };
        }
        if (village) {
            where.village = { contains: village, mode: 'insensitive' };
        }
        if (caste) {
            where.caste = { contains: caste, mode: 'insensitive' };
        }

        if (query) {
            where.OR = [
                { headOfFamily: { contains: query, mode: 'insensitive' } },
                { familyId: { contains: query, mode: 'insensitive' } },
                {
                    members: {
                        some: {
                            fullName: { contains: query, mode: 'insensitive' }
                        }
                    }
                }
            ];
        }

        const families = await prisma.family.findMany({
            where,
            include: {
                members: true
            },
            take: 50,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(families, { status: 200 });
    } catch (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


