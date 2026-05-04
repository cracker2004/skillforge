"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessments", label: "Assessments" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoading = status === "loading";

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "rgba(245, 240, 235, 0.92)",
        backdropFilter: "blur(12px)",
        borderColor: "#e7e5e4",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: "#0d9488" }}
            >
              SF
            </div>
            <span className="font-bold text-lg text-stone-900 hidden sm:block">SkillForge</span>
          </Link>

          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? "text-teal-700 bg-teal-50"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-8" /> 
            ) : session ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "#0d9488" }}
                  >
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm hidden sm:block text-stone-700">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors hidden sm:block hover:bg-stone-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 btn-primary"
                >
                  Get started
                </Link>
              </>
            )}
            <button
              className="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && session && (
          <div className="md:hidden pb-4 border-t pt-3" style={{ borderColor: "#e7e5e4" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-2.5 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors mt-1"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
