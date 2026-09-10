"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import {
  createScript as dbCreateScript,
  deleteScript as dbDeleteScript,
  moveScript,
  updateSurveyTitle,
  getScriptById,
  updateScript as dbUpdateScript,
} from "@/lib/db";
import { requireAdmin } from "@/lib/session";

function parseValidUrl(link: string): void {
  let parsedLink: URL;
  try {
    parsedLink = new URL(link);
  } catch {
    throw new Error("Link muss eine gültige URL sein");
  }
  if (parsedLink.protocol !== "http:" && parsedLink.protocol !== "https:") {
    throw new Error("Link muss eine gültige URL sein");
  }
}

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
  parseValidUrl(link.trim());
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

export async function updateScript(surveyId: number, scriptId: number, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title");
  const link = formData.get("link");
  const newImageUrl = formData.get("imageUrl");
  const description = formData.get("description");
  if (typeof title !== "string" || title.trim() === "") throw new Error("Titel erforderlich");
  if (typeof link !== "string" || link.trim() === "") throw new Error("Link erforderlich");
  parseValidUrl(link.trim());

  const current = await getScriptById(scriptId);
  if (!current) throw new Error("Skript nicht gefunden");

  let imageUrl = current.image_url;
  if (typeof newImageUrl === "string" && newImageUrl.trim() !== "") {
    imageUrl = newImageUrl.trim();
    // Best-effort cleanup of the replaced blob; a failed delete leaves an
    // orphaned file but must not block saving the updated script.
    await del(current.image_url).catch(() => {});
  }

  await dbUpdateScript(scriptId, {
    title: title.trim(),
    link: link.trim(),
    imageUrl,
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
