"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Option { text: string; isCorrect: boolean }
interface Question { text: string; type: "mcq" | "true_false"; options: Option[]; explanation: string; points: number }

const defaultQuestion = (): Question => ({
  text: "",
  type: "mcq",
  options: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  explanation: "",
  points: 10,
});

const CATEGORIES = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "CSS", "Database", "DevOps", "System Design", "Algorithms"];

export default function CreateAssessmentClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [meta, setMeta] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    timeLimit: 30,
    passingScore: 70,
    tags: "",
  });

  const [questions, setQuestions] = useState<Question[]>([defaultQuestion()]);

  const addQuestion = () => setQuestions([...questions, defaultQuestion()]);

  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, key: keyof Question, value: unknown) => {
    const updated = [...questions];
    if (key === "type" && value === "true_false") {
      updated[idx] = {
        ...updated[idx],
        type: "true_false",
        options: [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: false },
        ],
      };
    } else {
      (updated[idx] as unknown as Record<string, unknown>)[key] = value;
    }
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, key: "text" | "isCorrect", value: string | boolean) => {
    const updated = [...questions];
    const q = { ...updated[qIdx], options: [...updated[qIdx].options] };
    if (key === "isCorrect") {
      q.options = q.options.map((o, i) => ({ ...o, isCorrect: i === oIdx }));
    } else {
      q.options[oIdx] = { ...q.options[oIdx], text: value as string };
    }
    updated[qIdx] = q;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const payload = {
      ...meta,
      tags: meta.tags.split(",").map((t) => t.trim()).filter(Boolean),
      questions,
      timeLimit: Number(meta.timeLimit),
      passingScore: Number(meta.passingScore),
    };

    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create assessment");
      return;
    }
    router.push(`/assessments/${data.assessment._id}`);
  };

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setStep(s)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s
                  ? "bg-teal-600 text-white"
                  : s < step
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-stone-100 text-stone-400"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            <span className={`text-sm hidden sm:block ${step === s ? "text-stone-900 font-medium" : "text-stone-400"}`}>
              {s === 1 ? "Details" : "Questions"}
            </span>
            {s < 2 && <div className="w-8 h-px mx-1 bg-stone-200" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="card p-8 space-y-5">
          <h2 className="font-semibold text-stone-900">Assessment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Title *</label>
              <input
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                placeholder="e.g. JavaScript Fundamentals"
                className="w-full px-4 py-2.5 text-sm input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Description *</label>
              <textarea
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                placeholder="What will students learn from this assessment?"
                rows={3}
                className="w-full px-4 py-2.5 text-sm input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
              <select
                value={meta.category}
                onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                className="w-full px-4 py-2.5 text-sm input-field"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setMeta({ ...meta, difficulty: d })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all ${
                      meta.difficulty === d
                        ? "bg-teal-50 border-teal-300 text-teal-700"
                        : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Time Limit (minutes)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={meta.timeLimit}
                onChange={(e) => setMeta({ ...meta, timeLimit: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-sm input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Passing Score (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={meta.passingScore}
                onChange={(e) => setMeta({ ...meta, passingScore: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-sm input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tags (comma separated)</label>
              <input
                value={meta.tags}
                onChange={(e) => setMeta({ ...meta, tags: e.target.value })}
                placeholder="e.g. closures, async, ES6"
                className="w-full px-4 py-2.5 text-sm input-field"
              />
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!meta.title || !meta.description || !meta.category}
            className="px-8 py-3 text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Add Questions →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-900">Question {qIdx + 1}</h3>
                <div className="flex gap-2">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIdx, "type", e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs input-field"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                  </select>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIdx)}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-600 border border-red-200 transition-colors hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Question Text *</label>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                    placeholder="Enter your question here..."
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2">Options (select the correct one)</label>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateOption(qIdx, oIdx, "isCorrect", true)}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                            opt.isCorrect
                              ? "bg-teal-600 border-teal-600"
                              : "border-stone-300 hover:border-stone-400"
                          }`}
                        />
                        <input
                          value={opt.text}
                          onChange={(e) => updateOption(qIdx, oIdx, "text", e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          disabled={q.type === "true_false"}
                          className="flex-1 px-3 py-2 rounded-lg text-sm input-field disabled:opacity-60 disabled:bg-stone-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">Points</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={q.points}
                      onChange={(e) => updateQuestion(qIdx, "points", Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg text-sm input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">Explanation (optional)</label>
                    <input
                      value={q.explanation}
                      onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)}
                      placeholder="Why is this the answer?"
                      className="w-full px-3 py-2 rounded-lg text-sm input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={addQuestion}
              className="px-6 py-3 rounded-xl font-medium text-teal-600 border border-teal-200 text-sm transition-all hover:bg-teal-50"
            >
              + Add Question
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || questions.some((q) => !q.text || !q.options.some((o) => o.isCorrect) || q.options.some((o) => !o.text && q.type === "mcq"))}
              className="flex-1 py-3 text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : `Publish Assessment (${questions.length} questions)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
