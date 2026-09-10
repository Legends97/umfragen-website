import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getSurveyBySlug, listScripts } from "@/lib/db";
import { SurveyForm } from "./survey-form";

export const dynamic = "force-dynamic";

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
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-xl font-bold">Danke für deine Teilnahme!</h1>
        <p className="mt-2 text-gray-600">Du hast an dieser Umfrage bereits teilgenommen.</p>
      </main>
    );
  }

  const scripts = await listScripts(survey.id);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="text-xl font-bold">{survey.title}</h1>
      <SurveyForm slug={slug} scripts={scripts} />
    </main>
  );
}
