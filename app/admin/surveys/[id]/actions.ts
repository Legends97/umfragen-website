"use server";

import { revalidatePath } from "next/cache";
import {
  createScript as dbCreateScript,
  deleteScript as dbDeleteScript,
  moveScript,
  updateSurveyTitle,
} from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function updateTitle(surveyId: number, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title");
  if (typeof title !== "string" || title.trim() === "") throw new Error("Titel erforderlich");
  await updateSurveyTitle(surveyId, title.trim());
  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/admin/surveys");
}

export async function createScript(surveyId: number, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title");
  const link = formData.get("link");
  const imageUrl = formData.get("imageUrl");
  const description = formData.get("description");
  if (typeof title !== "string" || title.trim() === "") throw new Error("Titel erforderlich");
  if (typeof link !== "string" || link.trim() === "") throw new Error("Link erforderlich");
  let parsedLink: URL;
  try {
    parsedLink = new URL(link.trim());
  } catch {
    throw new Error("Link muss eine gültige URL sein");
  }
  if (parsedLink.protocol !== "http:" && parsedLink.protocol !== "https:") {
    throw new Error("Link muss eine gültige URL sein");
  }
  if (typeof imageUrl !== "string" || imageUrl.trim() === "") throw new Error("Bild erforderlich");
  await dbCreateScript(surveyId, {
    title: title.trim(),
    link: link.trim(),
    imageUrl: imageUrl.trim(),
    description:
      typeof description === "string" && description.trim() !== "" ? description.trim() : null,
  });
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function deleteScript(surveyId: number, scriptId: number) {
  await requireAdmin();
  await dbDeleteScript(scriptId);
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function moveScriptUp(surveyId: number, scriptId: number) {
  await requireAdmin();
  await moveScript(scriptId, "up");
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function moveScriptDown(surveyId: number, scriptId: number) {
  await requireAdmin();
  await moveScript(scriptId, "down");
  revalidatePath(`/admin/surveys/${surveyId}`);
}
