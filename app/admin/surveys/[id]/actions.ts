"use server";

import { revalidatePath } from "next/cache";
import {
  createScript as dbCreateScript,
  deleteScript as dbDeleteScript,
  moveScript,
} from "@/lib/db";

export async function createScript(surveyId: number, formData: FormData) {
  const title = formData.get("title");
  const link = formData.get("link");
  const imageUrl = formData.get("imageUrl");
  const description = formData.get("description");
  if (typeof title !== "string" || title.trim() === "") throw new Error("Titel erforderlich");
  if (typeof link !== "string" || link.trim() === "") throw new Error("Link erforderlich");
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
  await dbDeleteScript(scriptId);
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function moveScriptUp(surveyId: number, scriptId: number) {
  await moveScript(scriptId, "up");
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function moveScriptDown(surveyId: number, scriptId: number) {
  await moveScript(scriptId, "down");
  revalidatePath(`/admin/surveys/${surveyId}`);
}
