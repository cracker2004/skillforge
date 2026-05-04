import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const submission = await Submission.findById(id)
      .populate({
        path: "assessmentId",
        select: "title category difficulty questions totalPoints passingScore",
      })
      .populate("userId", "name email")
      .lean();

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const userId = typeof submission.userId === "object" && "_id" in submission.userId
      ? submission.userId._id.toString()
      : submission.userId.toString();

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}
