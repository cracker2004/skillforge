import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import Assessment from "@/models/Assessment";
import User from "@/models/User";
import { formatDate, getDifficultyColor, getScoreColor } from "@/lib/utils";
import { ClipboardList, CheckCircle2, Target, Star, TrendingUp, Trophy, BookOpen, BarChart3, UserCircle } from "lucide-react";

interface DashboardData {
  totalAssessments: number;
  completedCount: number;
  averageScore: number;
  totalPoints: number;
  rank: number;
  passRate: number;
  recentSubmissions: Array<{
    _id: string;
    percentage: number;
    passed: boolean;
    score: number;
    totalPoints: number;
    completedAt: string;
    assessmentId: {
      _id: string;
      title: string;
      category: string;
      difficulty: string;
    };
  }>;
  badges: string[];
}

async function getDashboardData(userId: string): Promise<DashboardData> {
  await connectDB();

  const [submissions, totalAssessments, userRank, currentUser] = await Promise.all([
    Submission.find({ userId })
      .populate("assessmentId", "title category difficulty")
      .sort({ completedAt: -1 })
      .limit(5)
      .lean(),
    Assessment.countDocuments({ isPublished: true }),
    User.countDocuments({ points: { $gt: 0 } }),
    User.findById(userId).select("points badges").lean(),
  ]);

  const stats = submissions.reduce(
    (acc, s) => ({ totalScore: acc.totalScore + s.percentage, passed: acc.passed + (s.passed ? 1 : 0) }),
    { totalScore: 0, passed: 0 }
  );

  return {
    totalAssessments,
    completedCount: submissions.length,
    averageScore: submissions.length ? Math.round(stats.totalScore / submissions.length) : 0,
    totalPoints: currentUser?.points ?? 0,
    rank: userRank + 1,
    passRate: submissions.length ? Math.round((stats.passed / submissions.length) * 100) : 0,
    recentSubmissions: submissions.map((s) => ({
      _id: s._id.toString(),
      percentage: s.percentage,
      passed: s.passed,
      score: s.score,
      totalPoints: s.totalPoints,
      completedAt: s.completedAt.toISOString(),
      assessmentId: s.assessmentId as {
        _id: string;
        title: string;
        category: string;
        difficulty: string;
      },
    })),
    badges: currentUser?.badges ?? [],
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getDashboardData(session.user.id!);

  const stats = [
    { label: "Total Assessments", value: data.totalAssessments, icon: ClipboardList, iconBg: "#ede9fe", iconColor: "#7c3aed" },
    { label: "Completed", value: data.completedCount, icon: CheckCircle2, iconBg: "#dcfce7", iconColor: "#16a34a" },
    { label: "Avg. Score", value: `${data.averageScore}%`, icon: Target, iconBg: "#fef3c7", iconColor: "#d97706" },
    { label: "Total Points", value: data.totalPoints, icon: Star, iconBg: "#f0fdfa", iconColor: "#0d9488" },
    { label: "Pass Rate", value: `${data.passRate}%`, icon: TrendingUp, iconBg: "#e0f2fe", iconColor: "#0284c7" },
    { label: "Your Rank", value: `#${data.rank}`, icon: Trophy, iconBg: "#fce7f3", iconColor: "#db2777" },
  ];

  const isInstructor = session.user.role === "instructor";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Welcome back, {session.user.name?.split(" ")[0]}
            </h1>
            <p className="text-stone-500 text-sm mt-1">Here&apos;s your skill progress at a glance</p>
          </div>
          {isInstructor ? (
            <Link
              href="/assessments/create"
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm btn-primary"
            >
              + Create Assessment
            </Link>
          ) : (
            <Link
              href="/assessments"
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm btn-primary"
            >
              Browse Assessments
            </Link>
          )}
        </div>

        {/* Stat cards with icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card p-4 text-center card-hover">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: stat.iconBg }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
              </div>
              <div className="text-xl font-bold text-stone-900">{stat.value}</div>
              <div className="text-xs text-stone-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="font-semibold text-stone-900 mb-5">Recent Activity</h2>
              {data.recentSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-stone-400" />
                  </div>
                  <p className="text-stone-500 text-sm">No assessments completed yet.</p>
                  <Link
                    href="/assessments"
                    className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-medium text-teal-600 border border-teal-200 transition-colors hover:bg-teal-50"
                  >
                    Take your first assessment →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentSubmissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ backgroundColor: "#faf8f6", border: "1px solid #f0ece8" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: "#0d9488" }}
                      >
                        {sub.assessmentId?.category?.slice(0, 2).toUpperCase() ?? "??"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-900 truncate">
                          {sub.assessmentId?.title ?? "Unknown Assessment"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(sub.assessmentId?.difficulty ?? "")}`}>
                            {sub.assessmentId?.difficulty}
                          </span>
                          <span className="text-xs text-stone-400">{formatDate(sub.completedAt)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-lg font-bold ${getScoreColor(sub.percentage)}`}>
                          {sub.percentage}%
                        </div>
                        <div className={`text-xs ${sub.passed ? "text-green-600" : "text-red-600"}`}>
                          {sub.passed ? "Passed" : "Failed"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Your Badges</h2>
              {data.badges.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#fef3c7" }}>
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-stone-400 text-xs">Complete assessments to earn badges!</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 border border-teal-200 text-teal-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { href: "/assessments", label: "Browse Assessments", Icon: BookOpen },
                  { href: "/leaderboard", label: "View Leaderboard", Icon: BarChart3 },
                  { href: "/profile", label: "Edit Profile", Icon: UserCircle },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-stone-600 hover:text-stone-900 transition-colors"
                    style={{ backgroundColor: "#faf8f6" }}
                  >
                    <link.Icon className="w-4 h-4 text-stone-400" />
                    <span>{link.label}</span>
                    <svg className="w-4 h-4 ml-auto text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
