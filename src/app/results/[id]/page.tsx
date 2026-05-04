import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import { getScoreColor, getDifficultyColor, formatDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();
  const submission = await Submission.findById(id)
    .populate({
      path: "assessmentId",
      select: "title category difficulty questions totalPoints passingScore tags",
    })
    .lean();

  if (!submission) notFound();

  const userId = submission.userId.toString();
  if (userId !== session.user.id) redirect("/dashboard");

  const assessment = submission.assessmentId as {
    _id: string;
    title: string;
    category: string;
    difficulty: string;
    questions: Array<{
      text: string;
      options: Array<{ text: string; isCorrect: boolean }>;
      explanation?: string;
      points: number;
    }>;
    totalPoints: number;
    passingScore: number;
    tags: string[];
  };

  const answersMap = new Map<number, number>(
    submission.answers.map((a: { questionIndex: number; selectedOption: number }) => [a.questionIndex, a.selectedOption])
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div
          className="card p-8 mb-6 text-center"
          style={{
            backgroundColor: submission.passed ? "#f0fdf4" : "#fef2f2",
            borderColor: submission.passed ? "#bbf7d0" : "#fecaca",
          }}
        >
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: submission.passed ? "#dcfce7" : "#fee2e2" }}>
            <svg className={`w-8 h-8 ${submission.passed ? "text-green-600" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={submission.passed ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {submission.passed ? "Assessment Passed!" : "Keep Practicing!"}
          </h1>
          <p className="text-stone-500 mb-6">{assessment.title}</p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`text-6xl font-bold ${getScoreColor(submission.percentage)}`}>
              {submission.percentage}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Score", value: `${submission.score}/${submission.totalPoints} pts` },
              { label: "Status", value: submission.passed ? "Passed ✓" : "Failed ✗" },
              { label: "Time Spent", value: formatDuration(submission.timeSpent) },
              { label: "Pass Mark", value: `${assessment.passingScore}%` },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-white/60 border border-stone-200">
                <div className="text-stone-900 font-semibold text-sm">{s.value}</div>
                <div className="text-stone-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/assessments" className="px-6 py-2.5 rounded-xl font-medium text-sm btn-primary">
              Browse More Assessments
            </Link>
            <Link href={`/assessments/${assessment._id}/take`} className="px-6 py-2.5 rounded-xl font-medium text-sm btn-secondary">
              Retake Assessment
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-stone-900 mb-5">Question Review</h2>
          <div className="space-y-4">
            {assessment.questions.map((q, idx) => {
              const selectedOpt = answersMap.get(idx);
              const isCorrect = selectedOpt !== undefined && q.options[selectedOpt]?.isCorrect;
              const correctIdx = q.options.findIndex((o) => o.isCorrect);

              return (
                <div key={idx} className="p-5 rounded-xl border" style={{ backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2", borderColor: isCorrect ? "#bbf7d0" : "#fecaca" }}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold" style={{ backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2", color: isCorrect ? "#16a34a" : "#dc2626" }}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <p className="text-stone-900 text-sm font-medium mb-3">{q.text}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedOpt === oIdx;
                          const isCorrectOpt = opt.isCorrect;
                          let cls = "bg-stone-50 text-stone-500 border-stone-200";
                          if (isCorrectOpt) cls = "bg-green-50 text-green-700 border-green-200";
                          if (isSelected && !isCorrectOpt) cls = "bg-red-50 text-red-700 border-red-200";

                          return (
                            <div key={oIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${cls}`}>
                              <span>{isSelected ? (isCorrectOpt ? "✓" : "✗") : isCorrectOpt ? "✓" : "·"}</span>
                              {opt.text}
                              {isCorrectOpt && <span className="ml-auto font-medium">Correct</span>}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 p-3 rounded-lg text-xs text-stone-600 bg-stone-50 border border-stone-200">
                          <span className="text-teal-600 font-medium">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0">{q.points}pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
