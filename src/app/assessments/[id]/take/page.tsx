import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";
import TakeAssessmentClient from "@/components/TakeAssessmentClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TakeAssessmentPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();
  const assessment = await Assessment.findById(id).lean();
  if (!assessment || !assessment.isPublished) notFound();

  const serialized = {
    _id: assessment._id.toString(),
    title: assessment.title,
    description: assessment.description,
    category: assessment.category,
    difficulty: assessment.difficulty,
    timeLimit: assessment.timeLimit,
    passingScore: assessment.passingScore,
    totalPoints: assessment.totalPoints,
    questions: assessment.questions.map((q: { _id?: { toString(): string }; text: string; type: string; options: { text: string; isCorrect: boolean }[]; explanation?: string; points: number }) => ({
      _id: q._id?.toString(),
      text: q.text,
      type: q.type,
      options: q.options.map((o: { text: string; isCorrect: boolean }) => ({ text: o.text, isCorrect: o.isCorrect })),
      explanation: q.explanation,
      points: q.points,
    })),
    tags: assessment.tags,
    attemptCount: assessment.attemptCount,
    isPublished: assessment.isPublished,
    createdBy: assessment.createdBy.toString(),
    createdAt: assessment.createdAt?.toISOString() ?? "",
    updatedAt: assessment.updatedAt?.toISOString() ?? "",
  };

  return <TakeAssessmentClient assessment={serialized} />;
}
