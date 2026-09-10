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
  type MediaType,
} from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { parseYoutubeEmbedUrl } from "@/lib/youtube";

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

type Media = { mediaType: "image"; imageUrl: string } | { mediaType: "youtube"; youtubeUrl: string };

function readMediaType(formData: FormData): MediaType {
  const mediaType = formData.get("mediaType");
  if (mediaType !== "image" && mediaType !== "youtube") throw new Error("Ungültiger Medientyp");
  return mediaType;
}

function readYoutubeMedia(formData: FormData): Media {
  const raw = formData.get("youtubeUrl");
  if (typeof raw !== "string" || raw.trim() === "") throw new Error("YouTube-Link erforderlich");
  const embedUrl = parseYoutubeEmbedUrl(raw.trim());
  if (!embedUrl) throw new Error("Ungültiger YouTube-Link");
  return { mediaType: "youtube", youtubeUrl: embedUrl };
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
  const description = formData.get("description");
  if (typeof title !== "string" || title.trim() === "") throw new Error("Titel erforderlich");
  if (typeof link !== "string" || link.trim() === "") throw new Error("Link erforderlich");
  parseValidUrl(link.trim());

  const mediaType = readMediaType(formData);
  let media: Media;
  if (mediaType === "image") {
    const imageUrl = formData.get("imageUrl");
    if (typeof imageUrl !== "string" || imageUrl.trim() === "") throw new Error("Bild erforderlich");
    media = { mediaType: "image", imageUrl: imageUrl.trim() };
  } else {
    media = readYoutubeMedia(formData);
  }

  await dbCreateScript(surveyId, {
    title: title.trim(),
    link: link.trim(),
    description:
      typeof description === "string" && description.trim() !== "" ? description.trim() : null,
    ...media,
  });
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function updateScript(surveyId: number, scriptId: number, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title");
  const link = formData.get("link");
  const description = formData.get("description");
  if (typeof title !== "string" || title.trim() === "") throw new Error("Titel erforderlich");
  if (typeof link !== "string" || link.trim() === "") throw new Error("Link erforderlich");
  parseValidUrl(link.trim());

  const current = await getScriptById(scriptId);
  if (!current) throw new Error("Skript nicht gefunden");

  const mediaType = readMediaType(formData);
  let media: Media;
  if (mediaType === "image") {
    const newImageUrl = formData.get("imageUrl");
    const finalImageUrl =
      typeof newImageUrl === "string" && newImageUrl.trim() !== ""
        ? newImageUrl.trim()
        : current.media_type === "image"
          ? current.image_url
          : null;
    if (!finalImageUrl) throw new Error("Bild erforderlich");
    media = { mediaType: "image", imageUrl: finalImageUrl };
  } else {
    media = readYoutubeMedia(formData);
  }

  // Best-effort cleanup of a replaced or abandoned image blob; a failed
  // delete leaves an orphaned file but must not block saving the script.
  if (
    current.media_type === "image" &&
    current.image_url &&
    !(media.mediaType === "image" && media.imageUrl === current.image_url)
  ) {
    await del(current.image_url).catch(() => {});
  }

  await dbUpdateScript(scriptId, {
    title: title.trim(),
    link: link.trim(),
    description:
      typeof description === "string" && description.trim() !== "" ? description.trim() : null,
    ...media,
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
