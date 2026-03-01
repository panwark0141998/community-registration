import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate request body
        const validatedData = registerSchema.parse(body);

        // Check if user already exists via Supabase
        const users = await supabase.from('User').select('id, email').eq('email', validatedData.email).all();

        if (users && users.length > 0) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(validatedData.password, salt);

        // Create user object in Supabase
        const userData = {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            password: hashedPassword,
            role: "family_rep",
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const result = await supabase.from('User').insert(userData);
        const newUser = Array.isArray(result) ? result[0] : userData;

        // Remove password from response
        const userResponse = {
            id: newUser.id || validatedData.email,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
        };

        return NextResponse.json(
            { message: "Registration successful. Pending admin approval.", user: userResponse },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
