import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";
import Submission from "@/models/Submission";
import User from "@/models/User";
import { getBadgeForScore } from "@/lib/utils";

const submitSchema = z.object({
  assessmentId: z.string(),
  answers: z.array(
    z.object({ questionIndex: z.number(), selectedOption: z.number() })
  ),
  timeSpent: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    await connectDB();
    const assessment = await Assessment.findById(parsed.data.assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    let score = 0;
    parsed.data.answers.forEach(({ questionIndex, selectedOption }) => {
      const question = assessment.questions[questionIndex];
      if (question && question.options[selectedOption]?.isCorrect) {
        score += question.points;
      }
    });

    const totalPoints = assessment.totalPoints;
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    const submission = await Submission.create({
      userId: session.user.id,
      assessmentId: assessment._id,
      answers: parsed.data.answers,
      score,
      totalPoints,
      percentage,
      passed,
      timeSpent: parsed.data.timeSpent,
      completedAt: new Date(),
    });

    await Assessment.findByIdAndUpdate(assessment._id, { $inc: { attemptCount: 1 } });

    const pointsEarned = Math.round((score / (totalPoints || 1)) * 50);
    const badge = getBadgeForScore(percentage, assessment.difficulty);
    const updateData: Record<string, unknown> = { $inc: { points: pointsEarned } };
    if (badge) updateData.$addToSet = { badges: badge };
    await User.findByIdAndUpdate(session.user.id, updateData);

    return NextResponse.json({ submission, score, percentage, passed, pointsEarned }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");

    const query: Record<string, unknown> = { userId: session.user.id };
    if (assessmentId) query.assessmentId = assessmentId;

    const submissions = await Submission.find(query)
      .populate("assessmentId", "title category difficulty totalPoints")
      .sort({ completedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
