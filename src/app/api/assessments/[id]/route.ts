import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const session = await auth();
    const assessment = await Assessment.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const isTaking = req.nextUrl.searchParams.get("mode") === "take";
    if (isTaking && session?.user) {
      return NextResponse.json({ assessment });
    }

    const safeAssessment = {
      ...assessment,
      questions: assessment.questions.map((q: { options: { text: string }[]; [key: string]: unknown }) => ({
        ...q,
        options: q.options.map((o: { text: string }) => ({ text: o.text })),
        explanation: undefined,
      })),
    };

    return NextResponse.json({ assessment: isTaking ? assessment : safeAssessment });
  } catch {
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    if (assessment.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    Object.assign(assessment, body);
    await assessment.save();

    return NextResponse.json({ assessment });
  } catch {
    return NextResponse.json({ error: "Failed to update assessment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    if (assessment.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await assessment.deleteOne();
    return NextResponse.json({ message: "Assessment deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 });
  }
}
