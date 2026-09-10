create table if not exists surveys (
  id serial primary key,
  slug text unique not null,
  title text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists scripts (
  id serial primary key,
  survey_id integer not null references surveys(id) on delete cascade,
  title text not null,
  description text,
  media_type text not null default 'image' check (media_type in ('image', 'youtube')),
  image_url text,
  youtube_url text,
  link text not null,
  sort_order integer not null default 0,
  check (
    (media_type = 'image' and image_url is not null and youtube_url is null) or
    (media_type = 'youtube' and youtube_url is not null and image_url is null)
  )
);

create table if not exists responses (
  id serial primary key,
  survey_id integer not null references surveys(id) on delete cascade,
  submitted_at timestamptz not null default now()
);

create table if not exists response_answers (
  id serial primary key,
  response_id integer not null references responses(id) on delete cascade,
  script_id integer not null references scripts(id) on delete cascade,
  choice text not null check (choice in ('priority', 'later', 'not_needed'))
);

create table if not exists suggestions (
  id serial primary key,
  survey_id integer not null references surveys(id) on delete cascade,
  response_id integer references responses(id) on delete cascade,
  name text not null,
  link text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_scripts_survey on scripts(survey_id);
create index if not exists idx_response_answers_response on response_answers(response_id);
create index if not exists idx_response_answers_script on response_answers(script_id);
create index if not exists idx_suggestions_survey on suggestions(survey_id);
