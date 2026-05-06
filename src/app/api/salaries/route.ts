import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // FIXED: default import
import { z } from "zod";

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
      return NextResponse.json( 
        { error: "Invalid search parameters", details: validation.error.issues }, // FIXED: .issues instead of .errors
        { status: 400 }
      );
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

    return NextResponse.json(
      {
        data: salaries,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[GET_SALARIES_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ... YOUR EXISTING POST ROUTE GOES HERE
