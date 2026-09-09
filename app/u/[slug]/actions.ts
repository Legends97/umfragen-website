"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getSurveyBySlug,
  listScripts,
  createResponse,
  createResponseAnswer,
  createSuggestion,
  type Choice,
} from "@/lib/db";

export type SubmitState = {
  errors?: Record<number, string>;
  generalError?: string;
};

const CHOICES: Choice[] = ["priority", "later", "not_needed"];

export async function submitResponse(
  slug: string,
  _prevState: SubmitState | undefined,
  formData: FormData,
): Promise<SubmitState> {
  const survey = await getSurveyBySlug(slug);
  if (!survey || !survey.is_published) {
    return { generalError: "Umfrage nicht gefunden" };
  }

  const scripts = await listScripts(survey.id);
  const errors: Record<number, string> = {};
  const answers: { scriptId: number; choice: Choice }[] = [];

  for (const script of scripts) {
    const raw = formData.get(`choice_${script.id}`);
    if (typeof raw !== "string" || !CHOICES.includes(raw as Choice)) {
      errors[script.id] = "Bitte eine Option auswählen";
      continue;
    }
    answers.push({ scriptId: script.id, choice: raw as Choice });
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  let suggestions: { name: string; link: string; description: string | null }[] = [];
  const suggestionsRaw = formData.get("suggestions_json");
  if (typeof suggestionsRaw === "string" && suggestionsRaw.trim() !== "") {
    try {
      const parsed: unknown = JSON.parse(suggestionsRaw);
      if (Array.isArray(parsed)) {
        suggestions = parsed
          .filter(
            (entry): entry is { name: string; link: string; description?: string } =>
              typeof entry === "object" &&
              entry !== null &&
              typeof (entry as { name?: unknown }).name === "string" &&
              (entry as { name: string }).name.trim() !== "" &&
              typeof (entry as { link?: unknown }).link === "string" &&
              (entry as { link: string }).link.trim() !== "",
          )
          .map((entry) => ({
            name: entry.name.trim(),
            link: entry.link.trim(),
            description:
              typeof entry.description === "string" && entry.description.trim() !== ""
                ? entry.description.trim()
                : null,
          }));
      }
    } catch {
      // Ungültiges JSON wird ignoriert, Hauptabgabe zählt trotzdem.
    }
  }

  const responseId = await createResponse(survey.id);
  for (const answer of answers) {
    await createResponseAnswer(responseId, answer.scriptId, answer.choice);
  }
  for (const suggestion of suggestions) {
    await createSuggestion(survey.id, responseId, suggestion);
  }

  const cookieStore = await cookies();
  cookieStore.set(`survey_${slug}_done`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/u/${slug}`,
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(`/u/${slug}`);
}
