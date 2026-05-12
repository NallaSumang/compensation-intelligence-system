import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ... [Keep your existing GET method and querySchema] ...

// 1. Exact mirror of your frontend form schema
const postSchema = z.object({
  companyRaw: z.string().min(1),
  role: z.string().min(1),
  level: z.string().min(1),
  location: z.string().min(1),
  yoe: z.number().min(0),
  baseSalary: z.number().positive(),
  bonus: z.number().nonnegative().default(0),
  stock: z.number().nonnegative().default(0),
});

export async function POST(req: NextRequest) {
  try {
    // 2. Defensive Payload Parsing
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const body = JSON.parse(text);

    // 3. Strict Zod Validation
    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 4. Database Transaction
    const newEntry = await prisma.salary.create({
      data: {
        company: data.companyRaw, // Remapping frontend variable to DB column
        role: data.role,
        level: data.level,
        location: data.location,
        yoe: data.yoe,
        baseSalary: data.baseSalary,
        bonus: data.bonus,
        stock: data.stock,
      },
    });

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });

  } catch (error: unknown) {
    console.error("[POST_SALARY_ERROR]:", error);

    // 5. Granular Error Handling to prevent HTML 500 pages
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON format payload" }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma-specific errors (e.g., unique constraint violations)
      return NextResponse.json(
        { error: "Database operation failed", code: error.code }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error. Check Vercel logs." },
      { status: 500 }
    );
  }
}
