"use server";

import { revalidatePath } from "next/cache";
import { deleteResponses } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function resetResponses(surveyId: number) {
  await requireAdmin();
  await deleteResponses(surveyId);
  revalidatePath(`/admin/surveys/${surveyId}/results`);
}
