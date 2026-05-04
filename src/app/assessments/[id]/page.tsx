import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";
import Submission from "@/models/Submission";
import { getDifficultyColor } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();

  const assessment = await Assessment.findById(id).populate("createdBy", "name").lean();
  if (!assessment) notFound();

  const existingSubmission = await Submission.findOne({
    userId: session.user.id,
    assessmentId: id,
  }).sort({ completedAt: -1 }).lean();

  const diffColor = getDifficultyColor(assessment.difficulty);
  const totalQuestions = assessment.questions.length;
  const totalPoints = assessment.totalPoints;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/assessments" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Assessments
        </Link>

        <div className="card p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${diffColor}`}>{assessment.difficulty}</span>
                <span className="text-sm text-stone-500">{assessment.category}</span>
              </div>
              <h1 className="text-2xl font-bold text-stone-900 mb-3">{assessment.title}</h1>
              <p className="text-stone-500 leading-relaxed">{assessment.description}</p>
            </div>

            {existingSubmission && (
              <div className="flex-shrink-0 text-center p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div className={`text-3xl font-bold ${existingSubmission.percentage >= 70 ? "text-green-600" : "text-red-600"}`}>{existingSubmission.percentage}%</div>
                <div className={`text-sm mt-1 ${existingSubmission.passed ? "text-green-600" : "text-red-600"}`}>
                  Last attempt: {existingSubmission.passed ? "Passed ✓" : "Failed ✗"}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Questions", value: totalQuestions },
              { label: "Time Limit", value: `${assessment.timeLimit} min` },
              { label: "Total Points", value: totalPoints },
              { label: "Pass Score", value: `${assessment.passingScore}%` },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="text-stone-900 font-semibold">{stat.value}</div>
                <div className="text-xs text-stone-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {assessment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {assessment.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-stone-200">
            <Link href={`/assessments/${id}/take`} className="flex-1 text-center py-3.5 px-6 rounded-xl font-semibold text-sm btn-primary">
              {existingSubmission ? "Retake Assessment" : "Start Assessment"}
            </Link>
            {existingSubmission && (
              <Link href={`/results/${existingSubmission._id.toString()}`} className="flex-1 text-center py-3.5 px-6 rounded-xl font-semibold text-sm btn-secondary">
                View Last Results
              </Link>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-stone-900 mb-4">What you&apos;ll be tested on</h2>
          <div className="space-y-2">
            {assessment.questions.slice(0, 5).map((q: { text: string; points: number }, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 bg-teal-50 text-teal-700 border border-teal-200">{i + 1}</span>
                <p className="text-stone-700 text-sm">{q.text}</p>
                <span className="text-xs text-stone-400 flex-shrink-0 mt-0.5">{q.points}pts</span>
              </div>
            ))}
            {assessment.questions.length > 5 && (
              <p className="text-center text-sm text-stone-400 pt-2">+{assessment.questions.length - 5} more questions...</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
