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

export async function GET(req: NextRequest) {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return NextResponse.json({ posts }, { status: 200 });
    } catch (error) {
        console.error("Fetch Posts Error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthUser(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { content, imageUrl } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                content,
                imageUrl,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (error) {
        console.error("Create Post Error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
