import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import Assessment from "@/models/Assessment";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [submissions, totalAssessments, userRank, currentUser] = await Promise.all([
      Submission.find({ userId: session.user.id })
        .populate("assessmentId", "title category difficulty")
        .sort({ completedAt: -1 })
        .limit(5)
        .lean(),
      Assessment.countDocuments({ isPublished: true }),
      User.countDocuments({ points: { $gt: (session.user as { points?: number }).points ?? 0 } }),
      User.findById(session.user.id).select("points badges").lean(),
    ]);

    const stats = submissions.reduce(
      (acc, s) => ({
        totalScore: acc.totalScore + s.percentage,
        passed: acc.passed + (s.passed ? 1 : 0),
      }),
      { totalScore: 0, passed: 0 }
    );

    return NextResponse.json({
      totalAssessments,
      completedAssessments: submissions.length,
      averageScore: submissions.length ? Math.round(stats.totalScore / submissions.length) : 0,
      totalPoints: currentUser?.points ?? 0,
      rank: userRank + 1,
      passRate: submissions.length ? Math.round((stats.passed / submissions.length) * 100) : 0,
      recentSubmissions: submissions,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
