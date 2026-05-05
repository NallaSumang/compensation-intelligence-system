import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const SalaryInputSchema = z.object({
  companyRaw: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  level: z.string().min(1, "Level is required"),
  location: z.string().min(1, "Location is required"),
  yoe: z.number().min(0, "Years of Experience must be positive"),
  baseSalary: z.number().positive("Base salary must be greater than 0"),
  bonus: z.number().nonnegative().optional().default(0),
  stock: z.number().nonnegative().optional().default(0),
});

function normalizeCompany(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = SalaryInputSchema.parse(body);

    const companyNormalized = normalizeCompany(parsedData.companyRaw);
    
    const totalComp = parsedData.baseSalary + parsedData.bonus + parsedData.stock;
    
    let confidenceScore = 50;
    if (parsedData.bonus > 0 || parsedData.stock > 0) {
      confidenceScore += 25;
    }
    if (parsedData.yoe > 0) {
      confidenceScore += 25;
    }

    const newSalary = await prisma.salary.create({
      data: {
        companyRaw: parsedData.companyRaw,
        companyNormalized,
        role: parsedData.role,
        level: parsedData.level,
        location: parsedData.location,
        yoe: parsedData.yoe,
        baseSalary: parsedData.baseSalary,
        bonus: parsedData.bonus,
        stock: parsedData.stock,
        totalComp,
        confidenceScore,
      },
    });

    return NextResponse.json(newSalary, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Changed .errors to .issues to fix the type error
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    
    // Cast error to handle Prisma specific codes safely in TS
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Exact salary entry already exists." },
        { status: 409 }
      );
    }

    console.error("Failed to create salary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyRaw = searchParams.get("company");
    const role = searchParams.get("role");
    const level = searchParams.get("level");
    const location = searchParams.get("location");

    const whereClause: any = {};

    if (companyRaw) {
      whereClause.companyNormalized = normalizeCompany(companyRaw);
    }
    if (role) {
      whereClause.role = role;
    }
    if (level) {
      whereClause.level = level;
    }
    if (location) {
      whereClause.location = location;
    }

    const salaries = await prisma.salary.findMany({
      where: whereClause,
      orderBy: {
        totalComp: "desc",
      },
      take: 50,
    });

    return NextResponse.json(salaries, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch salaries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
