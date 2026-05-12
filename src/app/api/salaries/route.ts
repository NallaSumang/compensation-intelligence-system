import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { z } from "zod";

// Schema for GET (Search/Filter)
const querySchema = z.object({
  role: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validation = querySchema.safeParse(rawParams);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { role, company, location, page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      ...(role && { role: { contains: role, mode: "insensitive" } }),
      ...(company && { company: { contains: company, mode: "insensitive" } }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
    };

    const [salaries, totalCount] = await Promise.all([
      prisma.salary.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.salary.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: salaries,
      meta: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Database Connection Failed" }, { status: 503 });
  }
}

// Schema for POST (Form Submission)
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
    const body = await req.json();
    const validation = postSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const data = validation.data;
    
    const newEntry = await prisma.salary.create({
      data: {
        company: data.companyRaw,
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
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
