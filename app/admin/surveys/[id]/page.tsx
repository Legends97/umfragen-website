import { notFound } from "next/navigation";
import { getSurveyById, listScripts } from "@/lib/db";
import { togglePublish } from "../actions";
import { updateTitle } from "./actions";
import { ScriptForm } from "./script-form";
import { ScriptRow } from "./script-row";

// Force dynamic rendering: this route is gated by middleware auth and reads
// live DB state on every request. Without this, `next build` tries to
// statically prerender the page and fails when POSTGRES_URL is unset.
export const dynamic = "force-dynamic";

export default async function SurveyEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surveyId = Number(id);
  if (!Number.isInteger(surveyId)) notFound();
  const survey = await getSurveyById(surveyId);
  if (!survey) notFound();
  const scripts = await listScripts(surveyId);

  return (
    <main className="space-y-6 p-8">
      <div>
        <form action={updateTitle.bind(null, survey.id)} className="flex items-center gap-2">
          <input
            name="title"
            defaultValue={survey.title}
            required
            className="rounded border px-2 py-1 text-xl font-bold"
          />
          <button type="submit" className="text-sm underline">
            Speichern
          </button>
        </form>
        <div className="mt-1 text-sm text-gray-600">
          /u/{survey.slug} —{" "}
          <form action={togglePublish.bind(null, survey.id)} className="inline">
            <button type="submit" className="underline">
              {survey.is_published ? "veröffentlicht (deaktivieren)" : "unveröffentlicht (aktivieren)"}
            </button>
          </form>{" "}
          — <a href={`/admin/surveys/${survey.id}/results`} className="underline">Ergebnisse</a>
        </div>
      </div>

      <ul className="space-y-2">
        {scripts.map((script) => (
          <ScriptRow key={script.id} surveyId={survey.id} script={script} />
        ))}
      </ul>

      <ScriptForm surveyId={survey.id} />
    </main>
  );
}
