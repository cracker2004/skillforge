import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Submission from "@/models/Submission";
import { auth } from "@/lib/auth";

async function getLeaderboard() {
  await connectDB();
  const [topUsers, submissionCounts] = await Promise.all([
    User.find().select("name email points badges").sort({ points: -1 }).limit(20).lean(),
    Submission.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
  ]);
  const countMap = new Map(submissionCounts.map((s) => [s._id.toString(), s.count]));
  return topUsers.map((u, i) => ({
    ...u,
    _id: u._id.toString(),
    rank: i + 1,
    submissionCount: countMap.get(u._id.toString()) ?? 0,
  }));
}

export default async function LeaderboardPage() {
  const [leaderboard, session] = await Promise.all([getLeaderboard(), auth()]);
  const currentUserId = session?.user?.id;

  const podiumColors = [
    { border: "#eab308", bg: "#fefce8", text: "#a16207", label: "Gold" },
    { border: "#9ca3af", bg: "#f9fafb", text: "#4b5563", label: "Silver" },
    { border: "#f97316", bg: "#fff7ed", text: "#c2410c", label: "Bronze" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Leaderboard</h1>
          <p className="text-stone-500">Top developers ranked by earned points</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500">No entries yet. Be the first to complete an assessment!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {leaderboard.slice(0, 3).map((entry, idx) => (
                <div
                  key={entry._id}
                  className="card p-5 text-center card-hover"
                  style={{ borderLeftWidth: "3px", borderLeftColor: podiumColors[idx].border }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: podiumColors[idx].text }}>
                    {podiumColors[idx].label}
                  </div>
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#0d9488" }}>
                    {entry.name[0].toUpperCase()}
                  </div>
                  <div className="font-semibold text-stone-900 text-sm">{entry.name}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: podiumColors[idx].text }}>{entry.points}</div>
                  <div className="text-xs text-stone-400 mt-0.5">points</div>
                </div>
              ))}
            </div>

            <div className="card overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 text-xs text-stone-400 font-medium uppercase tracking-wider border-b border-stone-200">
                <span>Rank</span><span>Developer</span><span className="text-right">Quizzes</span><span className="text-right">Points</span>
              </div>
              {leaderboard.map((entry) => {
                const isCurrentUser = entry._id === currentUserId;
                return (
                  <div key={entry._id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4 border-b last:border-0 border-stone-100 transition-colors hover:bg-stone-50" style={{ backgroundColor: isCurrentUser ? "#f0fdfa" : undefined }}>
                    <div className="w-8 text-center">
                      {entry.rank <= 3 ? (
                        <span className="inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold" style={{ backgroundColor: podiumColors[entry.rank - 1].bg, color: podiumColors[entry.rank - 1].text }}>{entry.rank}</span>
                      ) : (
                        <span className="text-stone-400 text-sm font-mono">#{entry.rank}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: "#0d9488" }}>{entry.name[0].toUpperCase()}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-stone-900 flex items-center gap-2 truncate">
                          {entry.name}
                          {isCurrentUser && <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700">You</span>}
                        </div>
                        {entry.badges.length > 0 && (
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {entry.badges.slice(0, 2).map((b: string) => (<span key={b} className="text-xs text-stone-400">{b}</span>))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-stone-500 text-right">{entry.submissionCount}</div>
                    <div className="text-sm font-bold text-right text-teal-600">{entry.points}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
