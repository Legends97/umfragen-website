import { notFound } from "next/navigation";
import { getSurveyById, listScripts } from "@/lib/db";
import { togglePublish } from "../actions";
import { deleteScript, moveScriptUp, moveScriptDown } from "./actions";
import { ScriptForm } from "./script-form";

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
  const survey = await getSurveyById(surveyId);
  if (!survey) notFound();
  const scripts = await listScripts(surveyId);

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-bold">{survey.title}</h1>
        <p className="text-sm text-gray-600">
          /u/{survey.slug} —{" "}
          <form action={togglePublish.bind(null, survey.id)} className="inline">
            <button type="submit" className="underline">
              {survey.is_published ? "veröffentlicht (deaktivieren)" : "unveröffentlicht (aktivieren)"}
            </button>
          </form>
        </p>
      </div>

      <ul className="space-y-2">
        {scripts.map((script) => (
          <li key={script.id} className="flex items-center gap-3 rounded border p-3">
            {/* ponytail: <img> statt next/image, siehe Global Constraints */}
            <img src={script.image_url} alt="" className="h-12 w-12 rounded object-cover" />
            <div className="flex-1">
              <p className="font-medium">{script.title}</p>
              <a href={script.link} target="_blank" className="text-sm text-blue-600 underline">
                {script.link}
              </a>
            </div>
            <form action={moveScriptUp.bind(null, survey.id, script.id)}>
              <button type="submit" aria-label="Nach oben">
                ↑
              </button>
            </form>
            <form action={moveScriptDown.bind(null, survey.id, script.id)}>
              <button type="submit" aria-label="Nach unten">
                ↓
              </button>
            </form>
            <form action={deleteScript.bind(null, survey.id, script.id)}>
              <button type="submit" className="text-red-600">
                Löschen
              </button>
            </form>
          </li>
        ))}
      </ul>

      <ScriptForm surveyId={survey.id} />
    </main>
  );
}
