import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { z } from "zod";

// 1. Define strict validation for incoming query parameters
const querySchema = z.object({
  role: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    // 2. Parse URL parameters into a standard object
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    // 3. Validate and coerce the query string
    const validation = querySchema.safeParse(rawParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { role, company, location, page, limit } = validation.data;
    const skip = (page - 1) * limit;

    // 4. Construct the Prisma dynamic 'where' clause
    // Using 'insensitive' mode so "software engineer" matches "Software Engineer"
    const whereClause: any = {
      ...(role && { role: { contains: role, mode: "insensitive" } }),
      ...(company && { company: { contains: company, mode: "insensitive" } }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
    };

    // 5. Execute DB calls in parallel to reduce waterfall latency
    const [salaries, totalCount] = await Promise.all([
      prisma.salary.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // Most recent compensation data first
      }),
      prisma.salary.count({ where: whereClause }), // Get total for client-side pagination
    ]);

    // 6. Return data with pagination metadata
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
