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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Danke für deine Teilnahme!</h1>
          <p className="mt-2 text-gray-600">Du hast an dieser Umfrage bereits teilgenommen.</p>
        </div>
      </main>
    );
  }

  const scripts = await listScripts(survey.id);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
        <SurveyForm slug={slug} scripts={scripts} />
      </div>
    </main>
  );
}
