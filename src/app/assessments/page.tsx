import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";
import AssessmentCard from "@/components/AssessmentCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IAssessment } from "@/types";
import AssessmentFilters from "@/components/AssessmentFilters";

interface SearchParams {
  category?: string;
  difficulty?: string;
  search?: string;
}

async function getAssessments(filters: SearchParams): Promise<{ assessments: IAssessment[]; total: number }> {
  await connectDB();

  const query: Record<string, unknown> = { isPublished: true };
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.search) query.title = { $regex: filters.search, $options: "i" };

  const assessments = await Assessment.find(query)
    .select("-questions.options.isCorrect -questions.explanation")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(24)
    .lean();

  const total = await Assessment.countDocuments(query);

  return {
    assessments: assessments.map((a) => ({
      ...a,
      _id: a._id.toString(),
      createdBy: a.createdBy,
      createdAt: a.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: a.updatedAt?.toISOString() ?? new Date().toISOString(),
    })) as unknown as IAssessment[],
    total,
  };
}

async function getCategories(): Promise<string[]> {
  await connectDB();
  const cats = await Assessment.distinct("category", { isPublished: true });
  return cats;
}

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [{ assessments, total }, categories] = await Promise.all([
    getAssessments(params),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Skill Assessments</h1>
          <p className="text-stone-500 text-sm">{total} assessment{total !== 1 ? "s" : ""} available</p>
        </div>

        <AssessmentFilters categories={categories} currentFilters={params} />

        {assessments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-white mb-2">No assessments found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {assessments.map((assessment) => (
              <AssessmentCard key={assessment._id} assessment={assessment} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
