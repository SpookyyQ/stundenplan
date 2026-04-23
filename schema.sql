-- ElitePlan – Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query

create table public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  first_name   text default '',
  last_name    text default '',
  semester_end text default '2026-07-17'
);

create table public.courses (
  id         text not null,
  user_id    uuid references auth.users on delete cascade not null,
  name       text not null default '',
  teacher    text default '',
  room       text default '',
  color      text default '#7c6aff',
  moodle_url text default '',
  primary key (id, user_id)
);

create table public.lessons (
  id         text not null,
  user_id    uuid references auth.users on delete cascade not null,
  course_id  text not null,
  day        integer default 0,
  start_time text not null,
  end_time   text not null,
  room       text default '',
  date       text,
  start_date text,
  primary key (id, user_id)
);

create table public.exams (
  id         text not null,
  user_id    uuid references auth.users on delete cascade not null,
  course_id  text not null,
  type       text default 'klausur',
  title      text not null default '',
  note       text default '',
  date       text,
  time       text,
  room       text,
  milestones jsonb default '[]',
  primary key (id, user_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.courses  enable row level security;
alter table public.lessons  enable row level security;
alter table public.exams    enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id)         with check (auth.uid() = id);
create policy "own courses" on public.courses  for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "own lessons" on public.lessons  for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "own exams"   on public.exams    for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);

-- Auto-create empty profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
