import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

async function getAuthUser(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch (e) {
        return null;
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = await getAuthUser(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const postId = params.id;

        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return NextResponse.json({ liked: false }, { status: 200 });
        } else {
            await prisma.like.create({
                data: {
                    postId,
                    userId,
                },
            });
            return NextResponse.json({ liked: true }, { status: 201 });
        }
    } catch (error) {
        console.error("Like Toggle Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
