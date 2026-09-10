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

export async function updateSurveyTitle(id: number, title: string): Promise<void> {
  await sql`update surveys set title = ${title} where id = ${id}`;
}

export async function togglePublish(id: number): Promise<void> {
  await sql`
    update surveys set is_published = not is_published where id = ${id}
  `;
}

export async function deleteSurvey(id: number): Promise<void> {
  await sql`delete from surveys where id = ${id}`;
}

export type MediaType = "image" | "youtube";

export type Script = {
  id: number;
  survey_id: number;
  title: string;
  description: string | null;
  media_type: MediaType;
  image_url: string | null;
  youtube_url: string | null;
  link: string;
  sort_order: number;
};

type ScriptMedia =
  | { mediaType: "image"; imageUrl: string }
  | { mediaType: "youtube"; youtubeUrl: string };

type ScriptInput = {
  title: string;
  description: string | null;
  link: string;
} & ScriptMedia;

export async function listScripts(surveyId: number): Promise<Script[]> {
  const { rows } = await sql<Script>`
    select id, survey_id, title, description, media_type, image_url, youtube_url, link, sort_order
    from scripts
    where survey_id = ${surveyId}
    order by sort_order asc, id asc
  `;
  return rows;
}

export async function createScript(surveyId: number, data: ScriptInput): Promise<Script> {
  const { rows: maxRows } = await sql<{ max: number | null }>`
    select max(sort_order) as max from scripts where survey_id = ${surveyId}
  `;
  const nextOrder = (maxRows[0]?.max ?? -1) + 1;
  const imageUrl = data.mediaType === "image" ? data.imageUrl : null;
  const youtubeUrl = data.mediaType === "youtube" ? data.youtubeUrl : null;
  const { rows } = await sql<Script>`
    insert into scripts (survey_id, title, description, media_type, image_url, youtube_url, link, sort_order)
    values (${surveyId}, ${data.title}, ${data.description}, ${data.mediaType}, ${imageUrl}, ${youtubeUrl}, ${data.link}, ${nextOrder})
    returning id, survey_id, title, description, media_type, image_url, youtube_url, link, sort_order
  `;
  return rows[0];
}

export async function deleteScript(scriptId: number): Promise<void> {
  await sql`delete from scripts where id = ${scriptId}`;
}

export async function getScriptById(scriptId: number): Promise<Script | null> {
  const { rows } = await sql<Script>`
    select id, survey_id, title, description, media_type, image_url, youtube_url, link, sort_order
    from scripts
    where id = ${scriptId}
  `;
  return rows[0] ?? null;
}

export async function updateScript(
  scriptId: number,
  data: ScriptInput,
): Promise<void> {
  const imageUrl = data.mediaType === "image" ? data.imageUrl : null;
  const youtubeUrl = data.mediaType === "youtube" ? data.youtubeUrl : null;
  await sql`
    update scripts
    set title = ${data.title},
        description = ${data.description},
        media_type = ${data.mediaType},
        image_url = ${imageUrl},
        youtube_url = ${youtubeUrl},
        link = ${data.link}
    where id = ${scriptId}
  `;
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

export const CHOICES: { value: Choice; label: string }[] = [
  { value: "priority", label: "Priorität" },
  { value: "later", label: "kann später" },
  { value: "not_needed", label: "brauch ich nicht" },
];

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

export async function countResponses(surveyId: number): Promise<number> {
  const { rows } = await sql<{ count: string }>`
    select count(*) as count from responses where survey_id = ${surveyId}
  `;
  return Number(rows[0]?.count ?? 0);
}

export type ScriptTally = {
  script_id: number;
  title: string;
  media_type: MediaType;
  image_url: string | null;
  youtube_url: string | null;
  priority_count: number;
  later_count: number;
  not_needed_count: number;
};

export async function getScriptTallies(surveyId: number): Promise<ScriptTally[]> {
  const { rows } = await sql<{
    script_id: number;
    title: string;
    media_type: MediaType;
    image_url: string | null;
    youtube_url: string | null;
    priority_count: string;
    later_count: string;
    not_needed_count: string;
  }>`
    select
      s.id as script_id,
      s.title,
      s.media_type,
      s.image_url,
      s.youtube_url,
      coalesce(sum(case when ra.choice = 'priority' then 1 else 0 end), 0) as priority_count,
      coalesce(sum(case when ra.choice = 'later' then 1 else 0 end), 0) as later_count,
      coalesce(sum(case when ra.choice = 'not_needed' then 1 else 0 end), 0) as not_needed_count
    from scripts s
    left join response_answers ra on ra.script_id = s.id
    where s.survey_id = ${surveyId}
    group by s.id, s.title, s.media_type, s.image_url, s.youtube_url, s.sort_order
    order by s.sort_order asc, s.id asc
  `;
  return rows.map((row) => ({
    script_id: row.script_id,
    title: row.title,
    media_type: row.media_type,
    image_url: row.image_url,
    youtube_url: row.youtube_url,
    priority_count: Number(row.priority_count),
    later_count: Number(row.later_count),
    not_needed_count: Number(row.not_needed_count),
  }));
}

export type Suggestion = {
  id: number;
  name: string;
  link: string;
  description: string | null;
  created_at: string;
};

export async function listSuggestions(surveyId: number): Promise<Suggestion[]> {
  const { rows } = await sql<Suggestion>`
    select id, name, link, description, created_at
    from suggestions
    where survey_id = ${surveyId}
    order by created_at desc, id desc
  `;
  return rows;
}

export async function deleteResponses(surveyId: number): Promise<void> {
  // Cascades to response_answers and suggestions.response_id via FK constraints.
  await sql`delete from responses where survey_id = ${surveyId}`;
}
