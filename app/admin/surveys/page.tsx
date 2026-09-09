import { logout } from "../actions";

export default function AdminSurveysPage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Umfragen</h1>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Logout
          </button>
        </form>
      </div>
      <p className="mt-4 text-gray-600">Noch keine Umfragen-Verwaltung (folgt in Task 5).</p>
    </main>
  );
}
