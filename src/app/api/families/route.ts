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
        const lastFamily = await prisma.family.findFirst({
            where: {
                familyId: {
                    startsWith: prefix
                }
            },
            orderBy: {
                familyId: 'desc'
            },
            select: {
                familyId: true
            }
        });

        let nextNumber = 1;
        if (lastFamily) {
            const lastId = lastFamily.familyId;
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

        // Check if familyId already exists
        const existingFamily = await prisma.family.findUnique({
            where: { familyId: familyData.familyId }
        });

        if (existingFamily) {
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
        const newFamily = await prisma.family.create({
            data: {
                ...data,
                representativeId: user.userId
            }
        });

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

        let families;
        if (user.role === "admin") {
            families = await prisma.family.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' }
            });
        } else {
            families = await prisma.family.findMany({
                where: { representativeId: user.userId },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json(families, { status: 200 });
    } catch (error) {
        console.error("Family Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

