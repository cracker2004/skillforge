import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreateAssessmentClient from "@/components/CreateAssessmentClient";

export default async function CreateAssessmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "instructor") redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Create Assessment</h1>
          <p className="text-gray-400 text-sm mt-1">Build a new skill assessment for students</p>
        </div>
        <CreateAssessmentClient />
      </main>
      <Footer />
    </div>
  );
}
