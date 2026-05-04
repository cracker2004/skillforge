"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  categories: string[];
  currentFilters: { category?: string; difficulty?: string; search?: string };
}

const difficulties = ["beginner", "intermediate", "advanced"];

export default function AssessmentFilters({ categories, currentFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentFilters.search ?? "");

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (currentFilters.category) params.set("category", currentFilters.category);
    if (currentFilters.difficulty) params.set("difficulty", currentFilters.difficulty);
    if (currentFilters.search) params.set("search", currentFilters.search);

    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (currentFilters.category) params.set("category", currentFilters.category);
    if (currentFilters.difficulty) params.set("difficulty", currentFilters.difficulty);
    if (search) params.set("search", search);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAll = () => {
    setSearch("");
    startTransition(() => router.push(pathname));
  };

  const hasFilters = currentFilters.category || currentFilters.difficulty || currentFilters.search;

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessments..."
          className="flex-1 px-4 py-2.5 text-sm input-field"
        />
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-medium btn-primary"
        >
          Search
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="px-5 py-2.5 text-sm font-medium btn-secondary"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-stone-400 self-center mr-1">Difficulty:</span>
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => applyFilter("difficulty", d)}
            disabled={isPending}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all ${
              currentFilters.difficulty === d
                ? "bg-teal-50 border-teal-300 text-teal-700"
                : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-stone-400 self-center mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => applyFilter("category", cat)}
              disabled={isPending}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                currentFilters.category === cat
                  ? "bg-teal-50 border-teal-300 text-teal-700"
                  : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
