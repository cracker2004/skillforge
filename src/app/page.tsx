import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Target, Clock, BarChart3, Trophy, PenSquare, Shield } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const features = [
    {
      icon: Target,
      title: "Skill Assessments",
      desc: "Curated quizzes across JavaScript, TypeScript, React, Node.js, System Design, and more.",
    },
    {
      icon: Clock,
      title: "Timed Challenges",
      desc: "Real-world pressure with countdown timers. Build confidence under exam conditions.",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      desc: "Track your progress, identify weak areas, and see how you stack up on the leaderboard.",
    },
    {
      icon: Trophy,
      title: "Earn Badges",
      desc: "Unlock achievements for high scores, perfect runs, and mastering advanced topics.",
    },
    {
      icon: PenSquare,
      title: "Create Assessments",
      desc: "Instructors can publish custom quizzes with MCQs, true/false, and detailed explanations.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "JWT-based authentication. Your data is encrypted and never shared.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-teal-200 bg-teal-50 text-teal-700"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Built for developers, by developers
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 mb-6 leading-tight">
              Master Your{" "}
              <span className="text-teal-600">Dev Skills</span>
              <br />
              One Quiz at a Time
            </h1>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              SkillForge is the assessment platform where developers take skill-based quizzes,
              earn points, and compete on a global leaderboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-xl font-semibold text-white text-lg btn-primary"
              >
                Start for Free
              </Link>
              <Link
                href="/assessments"
                className="px-8 py-3.5 rounded-xl font-semibold text-stone-600 text-lg btn-secondary"
              >
                Browse Assessments →
              </Link>
            </div>
            <div className="flex items-center justify-center gap-12 mt-14">
              {[
                { value: "50+", label: "Assessments" },
                { value: "1K+", label: "Questions" },
                { value: "10+", label: "Categories" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-stone-900">{stat.value}</div>
                  <div className="text-sm text-stone-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">Everything you need to level up</h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              A complete platform to assess, track, and showcase your technical expertise.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-6 card-hover">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-semibold text-stone-900 text-lg mb-2">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="card p-12 bg-stone-50">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Ready to forge your skills?</h2>
            <p className="text-stone-500 mb-8">
              Join developers using SkillForge to prepare for interviews and level up their careers.
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-3.5 rounded-xl font-semibold text-white text-lg btn-primary"
            >
              Create free account
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
