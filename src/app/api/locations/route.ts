import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

        let query = supabase.from('Location').select('subDistrict, village, state, district');

        if (state) {
            query = query.filter('state', 'eq', state);
        }
        if (district) {
            query = query.filter('district', 'eq', district);
        }
        if (subDistrict) {
            query = query.filter('subDistrict', 'eq', subDistrict);
        }
        if (q) {
            query = query.filter('village', 'ilike', `%${q}%`);
        }

        // Allow larger limit if we are fetching all by subDistrict to populate a standard dropdown
        const fetchLimit = subDistrict ? 1500 : 20;
        const data = await query.order('village', { ascending: true }).limit(fetchLimit).all();

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
