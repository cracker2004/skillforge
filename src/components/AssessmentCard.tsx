import Link from "next/link";
import { IAssessment } from "@/types";
import { getDifficultyColor, formatDate } from "@/lib/utils";

interface Props {
  assessment: IAssessment;
}

const categoryIcons: Record<string, string> = {
  "JavaScript": "JS",
  "TypeScript": "TS",
  "React": "Re",
  "Node.js": "No",
  "Python": "Py",
  "CSS": "CS",
  "Database": "DB",
  "DevOps": "DO",
  "System Design": "SD",
};

export default function AssessmentCard({ assessment }: Props) {
  const icon = categoryIcons[assessment.category] ?? assessment.category.slice(0, 2).toUpperCase();
  const diffColor = getDifficultyColor(assessment.difficulty);

  return (
    <Link href={`/assessments/${assessment._id}`}>
      <div className="card p-5 card-hover cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: "#0d9488" }}
          >
            {icon}
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full border font-medium ${diffColor}`}
          >
            {assessment.difficulty}
          </span>
        </div>

        <h3 className="font-semibold text-stone-900 text-base mb-2 line-clamp-2 leading-snug">
          {assessment.title}
        </h3>
        <p className="text-stone-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
          {assessment.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {assessment.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md font-medium bg-teal-50 text-teal-700 border border-teal-200"
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t"
          style={{ borderColor: "#e7e5e4" }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {assessment.questions.length} Qs
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {assessment.timeLimit}m
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {assessment.totalPoints} pts
            </span>
          </div>
          <span>{formatDate(assessment.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
