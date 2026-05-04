import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  text: z.string().min(5),
  type: z.enum(["mcq", "true_false"]),
  options: z.array(optionSchema).min(2).max(6),
  explanation: z.string().optional(),
  points: z.number().min(1).max(100).default(10),
});

const createAssessmentSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(50),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  questions: z.array(questionSchema).min(1).max(50),
  timeLimit: z.number().min(5).max(180),
  passingScore: z.number().min(0).max(100).default(70),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");

    const query: Record<string, unknown> = { isPublished: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: "i" };

    const [assessments, total] = await Promise.all([
      Assessment.find(query)
        .select("-questions.options.isCorrect -questions.explanation")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Assessment.countDocuments(query),
    ]);

    return NextResponse.json({ assessments, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Only instructors can create assessments" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const assessment = await Assessment.create({
      ...parsed.data,
      createdBy: session.user.id,
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}
