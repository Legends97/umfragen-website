import { sql } from "@vercel/postgres";

export type Survey = {
  id: number;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
};

export async function listSurveys(): Promise<Survey[]> {
  const { rows } = await sql<Survey>`
    select id, slug, title, is_published, created_at
    from surveys
    order by created_at desc
  `;
  return rows;
}

export async function getSurveyById(id: number): Promise<Survey | null> {
  const { rows } = await sql<Survey>`
    select id, slug, title, is_published, created_at
    from surveys
    where id = ${id}
  `;
  return rows[0] ?? null;
}

export async function getSurveyBySlug(slug: string): Promise<Survey | null> {
  const { rows } = await sql<Survey>`
    select id, slug, title, is_published, created_at
    from surveys
    where slug = ${slug}
  `;
  return rows[0] ?? null;
}

export async function createSurvey(slug: string, title: string): Promise<Survey> {
  const { rows } = await sql<Survey>`
    insert into surveys (slug, title)
    values (${slug}, ${title})
    returning id, slug, title, is_published, created_at
  `;
  return rows[0];
}

export async function togglePublish(id: number): Promise<void> {
  await sql`
    update surveys set is_published = not is_published where id = ${id}
  `;
}

export async function deleteSurvey(id: number): Promise<void> {
  await sql`delete from surveys where id = ${id}`;
}

export type Script = {
  id: number;
  survey_id: number;
  title: string;
  description: string | null;
  image_url: string;
  link: string;
  sort_order: number;
};

export async function listScripts(surveyId: number): Promise<Script[]> {
  const { rows } = await sql<Script>`
    select id, survey_id, title, description, image_url, link, sort_order
    from scripts
    where survey_id = ${surveyId}
    order by sort_order asc, id asc
  `;
  return rows;
}

export async function createScript(
  surveyId: number,
  data: { title: string; description: string | null; imageUrl: string; link: string },
): Promise<Script> {
  const { rows: maxRows } = await sql<{ max: number | null }>`
    select max(sort_order) as max from scripts where survey_id = ${surveyId}
  `;
  const nextOrder = (maxRows[0]?.max ?? -1) + 1;
  const { rows } = await sql<Script>`
    insert into scripts (survey_id, title, description, image_url, link, sort_order)
    values (${surveyId}, ${data.title}, ${data.description}, ${data.imageUrl}, ${data.link}, ${nextOrder})
    returning id, survey_id, title, description, image_url, link, sort_order
  `;
  return rows[0];
}

export async function deleteScript(scriptId: number): Promise<void> {
  await sql`delete from scripts where id = ${scriptId}`;
}

export async function moveScript(scriptId: number, direction: "up" | "down"): Promise<void> {
  const { rows } = await sql<{ id: number; survey_id: number; sort_order: number }>`
    select id, survey_id, sort_order from scripts where id = ${scriptId}
  `;
  const current = rows[0];
  if (!current) return;

  const neighborRows =
    direction === "up"
      ? (
          await sql<{ id: number; sort_order: number }>`
            select id, sort_order from scripts
            where survey_id = ${current.survey_id} and sort_order < ${current.sort_order}
            order by sort_order desc
            limit 1
          `
        ).rows
      : (
          await sql<{ id: number; sort_order: number }>`
            select id, sort_order from scripts
            where survey_id = ${current.survey_id} and sort_order > ${current.sort_order}
            order by sort_order asc
            limit 1
          `
        ).rows;

  const neighbor = neighborRows[0];
  if (!neighbor) return;

  await sql`update scripts set sort_order = ${neighbor.sort_order} where id = ${current.id}`;
  await sql`update scripts set sort_order = ${current.sort_order} where id = ${neighbor.id}`;
}

export type Choice = "priority" | "later" | "not_needed";

export async function createResponse(surveyId: number): Promise<number> {
  const { rows } = await sql<{ id: number }>`
    insert into responses (survey_id)
    values (${surveyId})
    returning id
  `;
  return rows[0].id;
}

export async function createResponseAnswer(
  responseId: number,
  scriptId: number,
  choice: Choice,
): Promise<void> {
  await sql`
    insert into response_answers (response_id, script_id, choice)
    values (${responseId}, ${scriptId}, ${choice})
  `;
}

export async function createSuggestion(
  surveyId: number,
  responseId: number,
  data: { name: string; link: string; description: string | null },
): Promise<void> {
  await sql`
    insert into suggestions (survey_id, response_id, name, link, description)
    values (${surveyId}, ${responseId}, ${data.name}, ${data.link}, ${data.description})
  `;
}
