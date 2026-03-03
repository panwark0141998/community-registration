import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                shares: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({ shares: updatedPost.shares }, { status: 200 });
    } catch (error) {
        console.error("Share Increment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
