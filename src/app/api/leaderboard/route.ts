import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Submission from "@/models/Submission";

export async function GET() {
  try {
    await connectDB();

    const [topUsers, submissionCounts] = await Promise.all([
      User.find().select("name email points badges").sort({ points: -1 }).limit(20).lean(),
      Submission.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map(submissionCounts.map((s) => [s._id.toString(), s.count]));

    const leaderboard = topUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
      submissionCount: countMap.get(user._id.toString()) ?? 0,
    }));

    return NextResponse.json({ leaderboard });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
