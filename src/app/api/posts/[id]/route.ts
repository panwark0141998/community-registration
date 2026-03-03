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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getAuthUser(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: postId } = await params;
        const body = await req.json();
        const { content, imageUrl } = body;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        if (post.authorId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { content, imageUrl },
            include: {
                author: { select: { id: true, name: true, image: true } }
            }
        });

        return NextResponse.json({ post: updatedPost }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getAuthUser(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: postId } = await params;
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        // Allow author or admin to delete
        // Fetch user role to check admin
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (post.authorId !== userId && user?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.post.delete({ where: { id: postId } });
        return NextResponse.json({ message: "Post deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
