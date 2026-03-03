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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const family = await prisma.family.findUnique({
            where: { id },
            include: { members: true }
        });

        if (!family) {
            return NextResponse.json({ error: "Family not found" }, { status: 404 });
        }

        return NextResponse.json({
            family,
            members: family.members
        }, { status: 200 });
    } catch (error: any) {
        console.error("Family Fetch Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { address, members, ...restBody } = body;

        const family = await prisma.family.findUnique({
            where: { id }
        });

        if (!family) {
            return NextResponse.json({ error: "Family not found" }, { status: 404 });
        }

        if (user.role !== "admin" && family.representativeId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Flatten address and exclude ID/computed fields
        const updateData: any = {
            ...restBody,
            ...(address || {})
        };

        // Remove fields that shouldn't be updated directly via this object
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        if (updateData.headDob && updateData.headDob !== "") {
            const date = new Date(updateData.headDob);
            updateData.headDob = isNaN(date.getTime()) ? null : date;
        }

        const updatedFamily = await prisma.family.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ message: "Family updated", family: updatedFamily }, { status: 200 });
    } catch (error: any) {
        console.error("Family Update Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const family = await prisma.family.findUnique({
            where: { id }
        });

        if (!family) {
            return NextResponse.json({ error: "Family not found" }, { status: 404 });
        }

        if (user.role !== "admin" && family.representativeId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the family (Cascade delete will also delete all members if configured in schema.prisma)
        await prisma.family.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Family deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Family Delete Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

