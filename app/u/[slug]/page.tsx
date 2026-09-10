import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getSurveyBySlug, listScripts } from "@/lib/db";
import { SurveyForm } from "./survey-form";

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);
  if (!survey || !survey.is_published) notFound();

  const cookieStore = await cookies();
  const alreadyDone = cookieStore.get(`survey_${slug}_done`)?.value === "1";

  if (alreadyDone) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-amber-100 p-4">
        <div className="w-full max-w-md rounded-2xl border-4 border-amber-400 bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-gray-900">Danke für deine Teilnahme!</h1>
          <p className="mt-2 text-gray-600">Du hast an dieser Umfrage bereits teilgenommen.</p>
        </div>
      </main>
    );
  }

  const scripts = await listScripts(survey.id);

  return (
    <main className="min-h-screen bg-amber-100">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-4 py-8 shadow-md">
        <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-white">
          {survey.title}
        </h1>
      </div>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <SurveyForm slug={slug} scripts={scripts} />
      </div>
    </main>
  );
}
