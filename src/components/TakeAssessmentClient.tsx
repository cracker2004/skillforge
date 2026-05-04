"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IAssessment } from "@/types";
import { getDifficultyColor } from "@/lib/utils";

interface Props {
  assessment: IAssessment;
}

export default function TakeAssessmentClient({ assessment }: Props) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimit * 60);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const startTime = Date.now();

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const formattedAnswers = Object.entries(answers).map(([qIdx, optIdx]) => ({
      questionIndex: parseInt(qIdx),
      selectedOption: optIdx,
    }));

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment._id,
          answers: formattedAnswers,
          timeSpent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/results/${data.submission._id}`);
      }
    } catch {
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, assessment._id, submitting]);

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [started, timeLeft, handleSubmit]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 60;
  const question = assessment.questions[currentQ];
  const totalQ = assessment.questions.length;
  const answered = Object.keys(answers).length;

  if (!started) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#f5f0eb" }}
      >
        <div className="card p-10 max-w-lg w-full text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-6"
            style={{ backgroundColor: "#0d9488" }}
          >
            {assessment.category.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{assessment.title}</h1>
          <div className={`inline-block text-xs px-3 py-1 rounded-full border mb-6 ${getDifficultyColor(assessment.difficulty)}`}>
            {assessment.difficulty}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Questions", value: totalQ },
              { label: "Time Limit", value: `${assessment.timeLimit}m` },
              { label: "Pass Score", value: `${assessment.passingScore}%` },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-stone-900 font-bold text-lg">{s.value}</div>
                <div className="text-stone-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-sm text-stone-500 p-4 rounded-xl bg-stone-50 border border-stone-200 mb-6 text-left space-y-1.5">
            <p>• Answer all questions before the timer ends</p>
            <p>• You cannot go back to a previous question after moving forward</p>
            <p>• You can skip questions and come back later</p>
            <p>• Submitted answers cannot be changed</p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="w-full py-3.5 btn-primary text-sm"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f0eb" }}>
      <div
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{ backgroundColor: "rgba(250,250,249,0.95)", backdropFilter: "blur(12px)", borderColor: "#e7e5e4" }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-sm font-medium text-stone-900 truncate max-w-xs">{assessment.title}</div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-stone-500">{answered}/{totalQ} answered</div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${
                isLowTime ? "text-red-600 bg-red-50" : "text-stone-700 bg-stone-100"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <div className="h-1 rounded-full bg-stone-200">
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQ + 1) / totalQ) * 100}%`,
                backgroundColor: "#0d9488",
              }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="card p-8 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-teal-600">
              Question {currentQ + 1} of {totalQ}
            </span>
            <span className="text-xs text-stone-400">{question.points} pts</span>
          </div>
          <h2 className="text-lg font-semibold text-stone-900 leading-relaxed mb-6">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [currentQ]: idx })}
                  className={`w-full text-left px-5 py-4 rounded-xl text-sm transition-all border ${
                    isSelected
                      ? "bg-teal-50 border-teal-300 text-stone-800"
                      : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span
                    className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold mr-3 ${
                      isSelected
                        ? "bg-teal-600 text-white"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-medium btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {assessment.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  idx === currentQ
                    ? "bg-teal-600 text-white"
                    : answers[idx] !== undefined
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium btn-primary"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit ✓"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
