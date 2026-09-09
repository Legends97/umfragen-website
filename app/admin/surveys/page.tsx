import { listSurveys } from "@/lib/db";
import { logout } from "../actions";
import { createSurveyAction, togglePublish, deleteSurveyAction } from "./actions";
import { NewSurveyForm } from "./new-survey-form";

// Force dynamic rendering: this route is gated by middleware auth and reads
// live DB state on every request. Without this, `next build` tries to
// statically prerender the page and fails when POSTGRES_URL is unset.
export const dynamic = "force-dynamic";

export default async function AdminSurveysPage() {
  const surveys = await listSurveys();

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Umfragen</h1>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Logout
          </button>
        </form>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Titel</th>
            <th>Slug</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey) => (
            <tr key={survey.id} className="border-b">
              <td className="py-2">
                <a href={`/admin/surveys/${survey.id}`} className="underline">
                  {survey.title}
                </a>
              </td>
              <td>
                <a href={`/u/${survey.slug}`} target="_blank" className="text-blue-600 underline">
                  /u/{survey.slug}
                </a>
              </td>
              <td>
                <form action={togglePublish.bind(null, survey.id)}>
                  <button type="submit" className="underline">
                    {survey.is_published ? "veröffentlicht" : "unveröffentlicht"}
                  </button>
                </form>
              </td>
              <td>
                <form action={deleteSurveyAction.bind(null, survey.id)}>
                  <button type="submit" className="text-red-600">
                    Löschen
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <NewSurveyForm createSurveyAction={createSurveyAction} />
    </main>
  );
}
