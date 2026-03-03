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
        const q = searchParams.get("q") || "";
        const state = searchParams.get("state") || "";
        const district = searchParams.get("district") || "";
        const subDistrict = searchParams.get("subDistrict") || "";

        if (q.length < 2 && !state && !district && !subDistrict) {
            return NextResponse.json([]);
        }

        const where: any = {};
        if (state) where.state = state;
        if (district) where.district = district;
        if (subDistrict) where.subDistrict = subDistrict;
        if (q) {
            where.village = {
                contains: q,
                mode: 'insensitive'
            };
        }

        // Allow larger limit if we are fetching all by subDistrict to populate a standard dropdown
        const fetchLimit = subDistrict ? 1500 : 20;

        const data = await prisma.location.findMany({
            where,
            select: {
                subDistrict: true,
                village: true,
                state: true,
                district: true
            },
            orderBy: {
                village: 'asc'
            },
            take: fetchLimit
        });

        // Return unique combinations
        const unique = data.reduce((acc: any[], curr: any) => {
            const id = `${curr.village}-${curr.subDistrict}`;
            if (!acc.find(item => `${item.village}-${item.subDistrict}` === id)) {
                acc.push(curr);
            }
            return acc;
        }, []);

        return NextResponse.json(unique);
    } catch (error) {
        console.error("Location Search Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

