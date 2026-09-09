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
