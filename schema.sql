-- Hunting Together Build Board — Supabase database setup.
-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run: it drops and recreates the functions and policies (tables are kept).

-- ===== tables =====
create table if not exists public.builds (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  roblox_name  text not null check (roblox_name ~ '^[A-Za-z0-9_]{3,20}$'),
  title        text not null check (char_length(title) between 3 and 60),
  class        text not null check (class in ('Swordsman','Thief','Archer','Mage','Cleric','Merchant','Alchemist','Samurai','Necromancer','Muay Thai')),
  level        int  not null check (level between 1 and 999),
  stats        jsonb not null default '{}'::jsonb check (jsonb_typeof(stats) = 'object' and pg_column_size(stats) < 2000),
  concept      text not null default '' check (char_length(concept) <= 2000),
  gear         jsonb not null default '{}'::jsonb check (jsonb_typeof(gear) = 'object' and pg_column_size(gear) < 12000),
  cards        jsonb not null default '[]'::jsonb check (jsonb_typeof(cards) = 'array' and pg_column_size(cards) < 4000),
  skills       jsonb not null default '{}'::jsonb check (jsonb_typeof(skills) = 'object' and pg_column_size(skills) < 4000),
  tags         text[] not null default '{}' check (cardinality(tags) <= 6),
  like_count   int not null default 0,
  rating_sum   int not null default 0,
  rating_count int not null default 0,
  rating_avg   numeric(4,2) generated always as
                 (case when rating_count > 0 then round(rating_sum::numeric / rating_count, 2) else 0 end) stored,
  report_count int not null default 0,
  hidden       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
-- added in v2 (safe on an existing table)
alter table public.builds add column if not exists skills jsonb not null default '{}'::jsonb;

create index if not exists builds_class_idx   on public.builds (class);
create index if not exists builds_new_idx     on public.builds (created_at desc);
create index if not exists builds_likes_idx   on public.builds (like_count desc, created_at desc);
create index if not exists builds_rating_idx  on public.builds (rating_avg desc, rating_count desc);
create index if not exists builds_user_idx    on public.builds (user_id);

create table if not exists public.likes (
  build_id   uuid not null references public.builds(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (build_id, user_id)
);
create table if not exists public.ratings (
  build_id   uuid not null references public.builds(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  stars      smallint not null check (stars between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (build_id, user_id)
);
create table if not exists public.reports (
  build_id   uuid not null references public.builds(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  reason     text not null default '' check (char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  primary key (build_id, user_id)
);
create index if not exists likes_user_idx   on public.likes (user_id);
create index if not exists ratings_user_idx on public.ratings (user_id);

-- ===== triggers: updated_at + max 10 builds per player =====
create or replace function public.builds_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists builds_touch on public.builds;
create trigger builds_touch before update on public.builds
  for each row execute function public.builds_touch();

create or replace function public.builds_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.builds where user_id = new.user_id) >= 10 then
    raise exception 'build limit';
  end if;
  return new;
end $$;
drop trigger if exists builds_limit on public.builds;
create trigger builds_limit before insert on public.builds
  for each row execute function public.builds_limit();

-- ===== row level security =====
alter table public.builds  enable row level security;
alter table public.likes   enable row level security;
alter table public.ratings enable row level security;
alter table public.reports enable row level security;

drop policy if exists "builds read"   on public.builds;
drop policy if exists "builds insert" on public.builds;
drop policy if exists "builds update" on public.builds;
drop policy if exists "builds delete" on public.builds;
create policy "builds read"   on public.builds for select using (not hidden or user_id = auth.uid());
create policy "builds insert" on public.builds for insert to authenticated with check (user_id = auth.uid());
create policy "builds update" on public.builds for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "builds delete" on public.builds for delete to authenticated using (user_id = auth.uid());

drop policy if exists "likes read own"   on public.likes;
drop policy if exists "ratings read own" on public.ratings;
drop policy if exists "reports read own" on public.reports;
create policy "likes read own"   on public.likes   for select to authenticated using (user_id = auth.uid());
create policy "ratings read own" on public.ratings for select to authenticated using (user_id = auth.uid());
create policy "reports read own" on public.reports for select to authenticated using (user_id = auth.uid());

-- Players may only write the build's own fields; counters, hidden and owner are server-only.
revoke insert, update, delete on public.builds from anon, authenticated;
grant select on public.builds to anon, authenticated;
grant insert (roblox_name, title, class, level, stats, concept, gear, cards, skills, tags) on public.builds to authenticated;
grant update (roblox_name, title, class, level, stats, concept, gear, cards, skills, tags) on public.builds to authenticated;
grant delete on public.builds to authenticated;

-- Likes, ratings and reports change only through the functions below.
revoke all on public.likes, public.ratings, public.reports from anon, authenticated;
grant select on public.likes, public.ratings, public.reports to authenticated;

-- ===== actions =====
create or replace function public.toggle_like(p_build uuid) returns json
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  owner uuid;
  cnt int;
  now_liked boolean;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select user_id into owner from builds where id = p_build and not hidden for update;
  if not found then raise exception 'missing build'; end if;
  if owner = uid then raise exception 'own build'; end if;
  delete from likes where build_id = p_build and user_id = uid;
  if found then
    update builds set like_count = greatest(like_count - 1, 0) where id = p_build returning like_count into cnt;
    now_liked := false;
  else
    insert into likes (build_id, user_id) values (p_build, uid);
    update builds set like_count = like_count + 1 where id = p_build returning like_count into cnt;
    now_liked := true;
  end if;
  return json_build_object('liked', now_liked, 'like_count', cnt);
end $$;

create or replace function public.rate_build(p_build uuid, p_stars int) returns json
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  owner uuid;
  old_stars smallint;
  s int; c int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_stars is null or p_stars < 1 or p_stars > 5 then raise exception 'bad stars'; end if;
  select user_id into owner from builds where id = p_build and not hidden for update;
  if not found then raise exception 'missing build'; end if;
  if owner = uid then raise exception 'own build'; end if;
  select stars into old_stars from ratings where build_id = p_build and user_id = uid;
  if found then
    update ratings set stars = p_stars, updated_at = now() where build_id = p_build and user_id = uid;
    update builds set rating_sum = rating_sum - old_stars + p_stars where id = p_build
      returning rating_sum, rating_count into s, c;
  else
    insert into ratings (build_id, user_id, stars) values (p_build, uid, p_stars);
    update builds set rating_sum = rating_sum + p_stars, rating_count = rating_count + 1 where id = p_build
      returning rating_sum, rating_count into s, c;
  end if;
  return json_build_object('rating_sum', s, 'rating_count', c);
end $$;

-- 5 different reporters hide a build automatically; review in Table Editor -> reports / builds.
create or replace function public.report_build(p_build uuid, p_reason text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in'; end if;
  insert into reports (build_id, user_id, reason) values (p_build, uid, left(coalesce(p_reason, ''), 300))
    on conflict do nothing;
  if found then
    update builds set report_count = report_count + 1,
                      hidden = hidden or (report_count + 1 >= 5)
     where id = p_build;
  end if;
  return true;
end $$;

revoke all on function public.toggle_like(uuid), public.rate_build(uuid, int), public.report_build(uuid, text) from public, anon;
grant execute on function public.toggle_like(uuid), public.rate_build(uuid, int), public.report_build(uuid, text) to authenticated;

-- ===== icons (v2) =====
-- Public bucket for item/skill/rarity icons copied from Roblox by the Edge Function "icon-sync".
-- Roblox thumbnail links expire after 180 days, so the site reads icons from here instead.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('icons', 'icons', true, 2097152, array['image/png'])
on conflict (id) do update set public = true;
