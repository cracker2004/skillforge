import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Submission from "@/models/Submission";
import ProfileClient from "@/components/ProfileClient";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();

  const [user, submissions] = await Promise.all([
    User.findById(session.user.id).select("-password").lean(),
    Submission.find({ userId: session.user.id })
      .populate("assessmentId", "title category difficulty")
      .sort({ completedAt: -1 })
      .limit(10)
      .lean(),
  ]);

  if (!user) redirect("/login");

  const serializedUser = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    points: user.points,
    badges: user.badges,
    bio: user.bio ?? "",
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
  };

  const serializedSubs = submissions.map((s) => ({
    _id: s._id.toString(),
    percentage: s.percentage,
    passed: s.passed,
    score: s.score,
    totalPoints: s.totalPoints,
    completedAt: s.completedAt instanceof Date ? s.completedAt.toISOString() : String(s.completedAt),
    assessmentId: s.assessmentId as { _id: string; title: string; category: string; difficulty: string },
  }));

  const totalAssessments = serializedSubs.length;
  const avgScore = totalAssessments
    ? Math.round(serializedSubs.reduce((sum, s) => sum + s.percentage, 0) / totalAssessments)
    : 0;
  const passRate = totalAssessments
    ? Math.round((serializedSubs.filter((s) => s.passed).length / totalAssessments) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-5">
            <div className="card p-6 text-center">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: "#0d9488" }}>
                {serializedUser.name[0].toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-stone-900">{serializedUser.name}</h1>
              <p className="text-stone-500 text-sm mt-1 capitalize">{serializedUser.role}</p>
              {serializedUser.bio && (
                <p className="text-stone-500 text-sm mt-3 leading-relaxed">{serializedUser.bio}</p>
              )}
              <div className="mt-4 pt-4 border-t border-stone-200">
                <div className="text-sm text-stone-400">Member since {formatDate(serializedUser.createdAt)}</div>
                <div className="text-2xl font-bold mt-2 text-teal-600">{serializedUser.points} pts</div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-stone-900 mb-4 text-sm">Stats Overview</h3>
              <div className="space-y-3">
                {[
                  { label: "Assessments Taken", value: totalAssessments },
                  { label: "Average Score", value: `${avgScore}%` },
                  { label: "Pass Rate", value: `${passRate}%` },
                  { label: "Badges Earned", value: serializedUser.badges.length },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center text-sm">
                    <span className="text-stone-500">{s.label}</span>
                    <span className="text-stone-900 font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {serializedUser.badges.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-stone-900 mb-3 text-sm">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {serializedUser.badges.map((badge: string) => (
                    <span key={badge} className="text-xs px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <ProfileClient user={serializedUser} />

            <div className="card p-6">
              <h2 className="font-semibold text-stone-900 mb-5">Assessment History</h2>
              {serializedSubs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-stone-500 text-sm">No assessments taken yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {serializedSubs.map((sub) => (
                    <div key={sub._id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#0d9488" }}>
                        {sub.assessmentId?.category?.slice(0, 2).toUpperCase() ?? "??"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-900 truncate">{sub.assessmentId?.title}</div>
                        <div className="text-xs text-stone-400">{formatDate(sub.completedAt)}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-bold text-sm ${sub.percentage >= 70 ? "text-green-600" : "text-red-600"}`}>{sub.percentage}%</div>
                        <div className={`text-xs ${sub.passed ? "text-green-600" : "text-red-600"}`}>{sub.passed ? "Passed" : "Failed"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
