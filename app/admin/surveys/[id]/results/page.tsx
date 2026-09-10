import { notFound } from "next/navigation";
import { getSurveyById, countResponses, getScriptTallies, listSuggestions } from "@/lib/db";
import { ScriptMedia } from "@/components/script-media";
import { ResetResponsesButton } from "./reset-button";

// Force dynamic rendering: liest live DB-Daten in einer Server Component mit
// dynamischem Routenparameter, ohne cookies()/headers() als impliziten Trigger.
// Ohne dies versucht `next build` eine statische Prerender, die ohne
// POSTGRES_URL fehlschlägt (gleiches Muster wie app/admin/surveys/[id]/page.tsx).
export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surveyId = Number(id);
  if (!Number.isInteger(surveyId)) notFound();
  const survey = await getSurveyById(surveyId);
  if (!survey) notFound();

  const [totalResponses, tallies, suggestions] = await Promise.all([
    countResponses(surveyId),
    getScriptTallies(surveyId),
    listSuggestions(surveyId),
  ]);

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8">
      <div>
        <h1 className="text-xl font-bold">{survey.title} — Ergebnisse</h1>
        <a href={`/admin/surveys/${survey.id}`} className="text-sm underline">
          zurück zum Editor
        </a>
        <p className="mt-2 flex items-center gap-3 text-gray-600">
          {totalResponses} Antworten insgesamt
          <ResetResponsesButton surveyId={survey.id} />
        </p>
      </div>

      {tallies.length === 0 ? (
        <p className="text-sm text-gray-600">Noch keine Skripte in dieser Umfrage.</p>
      ) : (
        <ul className="space-y-4">
          {tallies.map((tally) => {
            const total = tally.priority_count + tally.later_count + tally.not_needed_count;
            const percent = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));
            return (
              <li key={tally.script_id} className="flex items-start gap-3 rounded border p-4">
                <ScriptMedia
                  mediaType={tally.media_type}
                  imageUrl={tally.image_url}
                  youtubeUrl={tally.youtube_url}
                  alt=""
                  className="w-40 aspect-video rounded"
                />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{tally.title}</p>
                  <p className="text-sm text-gray-600">
                    Priorität: {tally.priority_count} ({percent(tally.priority_count)}%) — kann
                    später: {tally.later_count} ({percent(tally.later_count)}%) — brauch ich nicht:{" "}
                    {tally.not_needed_count} ({percent(tally.not_needed_count)}%) ({total} Bewertungen)
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <h2 className="font-medium">Vorschläge der User</h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-600">Noch keine Vorschläge.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Name</th>
                <th>Link</th>
                <th>Beschreibung</th>
                <th>Zeitpunkt</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((suggestion) => (
                <tr key={suggestion.id} className="border-b">
                  <td className="py-2">{suggestion.name}</td>
                  <td>
                    <a
                      href={suggestion.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 underline"
                    >
                      {suggestion.link}
                    </a>
                  </td>
                  <td>{suggestion.description ?? "—"}</td>
                  <td>
                    {new Date(suggestion.created_at).toLocaleString("de-DE", {
                      timeZone: "Europe/Berlin",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
