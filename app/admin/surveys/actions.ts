"use server";

import { revalidatePath } from "next/cache";
import {
  createSurvey as dbCreateSurvey,
  togglePublish as dbTogglePublish,
  deleteSurvey as dbDeleteSurvey,
} from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function createSurveyAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const title = formData.get("title");
  const slugInput = formData.get("slug");
  if (typeof title !== "string" || title.trim() === "") {
    return { error: "Titel erforderlich" };
  }
  const slug =
    typeof slugInput === "string" && slugInput.trim() !== ""
      ? slugify(slugInput)
      : slugify(title);
  if (slug === "") {
    return { error: "Slug ungültig" };
  }
  try {
    await dbCreateSurvey(slug, title.trim());
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return { error: `Slug "${slug}" ist bereits vergeben` };
    }
    throw error;
  }
  revalidatePath("/admin/surveys");
  return { error: undefined };
}

export async function togglePublish(surveyId: number) {
  await dbTogglePublish(surveyId);
  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function deleteSurveyAction(surveyId: number) {
  await dbDeleteSurvey(surveyId);
  revalidatePath("/admin/surveys");
}
