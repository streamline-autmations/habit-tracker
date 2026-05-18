-- ============================================================
--  BASELINE — schema + seed
--  Single-user personal app. user_id is always 'me'.
--  Run this whole file once in the Supabase SQL editor of the
--  project: https://lpjwfjkgqpgydzozuusj.supabase.co
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- tables ----------

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me',
  name text not null,                    -- 'smoking' | 'social_media' | 'coffee'
  type text not null,                    -- 'quit' | 'limit'
  started_at timestamptz not null,
  current_streak_start timestamptz not null,
  longest_streak_seconds bigint default 0,
  cost_per_day numeric default 0,        -- ZAR
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me',
  date date not null,
  water_glasses int default 0,
  steps int default 0,
  sunlight boolean default false,
  cold_shower boolean default false,
  gym boolean default false,
  prayer_reading boolean default false,
  coffee_count int default 0,
  mood int,                              -- 1-10
  energy int,                            -- 1-10
  notes text,
  triggers_spotted text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists cravings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me',
  habit text not null,                   -- 'smoking' | 'social_media' | 'coffee'
  intensity int,                         -- 1-10
  trigger text,                          -- 'stress' | 'meal' | 'boredom' | 'social' | 'morning' | 'other'
  resolution text,                       -- 'resisted' | 'slipped'
  tactic_used text,                      -- 'water' | 'walk' | 'pushups' | 'prayer' | 'cold' | 'read' | 'timer' | null
  notes text,
  created_at timestamptz default now()
);

create table if not exists slips (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me',
  habit text not null,
  reason text,
  what_will_be_different text,
  created_at timestamptz default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  category text,                         -- 'biblical' | 'stoic' | 'recovery' | 'identity' | 'general'
  content text not null,
  reference text
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me' unique,
  smoking_cost_per_day numeric default 45,
  reminder_time time default '21:00',
  quote_category text default 'all',
  coffee_mode text default 'budget',     -- 'quit' | 'budget'
  coffee_daily_max int default 1,
  social_minutes_per_day int default 90, -- est. reclaimed minutes/day for 'time reclaimed'
  created_at timestamptz default now()
);

-- ---------- single-user app: no auth, open access ----------

alter table habits    disable row level security;
alter table check_ins disable row level security;
alter table cravings  disable row level security;
alter table slips     disable row level security;
alter table quotes    disable row level security;
alter table settings  disable row level security;

-- ---------- seed: settings + habits (only if absent) ----------

insert into settings (user_id)
select 'me'
where not exists (select 1 from settings where user_id = 'me');

insert into habits (user_id, name, type, started_at, current_streak_start, cost_per_day, enabled)
select 'me', 'smoking', 'quit', now(), now(), 45, true
where not exists (select 1 from habits where user_id = 'me' and name = 'smoking');

insert into habits (user_id, name, type, started_at, current_streak_start, cost_per_day, enabled)
select 'me', 'social_media', 'quit', now(), now(), 0, true
where not exists (select 1 from habits where user_id = 'me' and name = 'social_media');

insert into habits (user_id, name, type, started_at, current_streak_start, cost_per_day, enabled)
select 'me', 'coffee', 'limit', now(), now(), 0, true
where not exists (select 1 from habits where user_id = 'me' and name = 'coffee');

-- ---------- seed: quotes (only on empty table) ----------

insert into quotes (category, content, reference)
select * from (values
  ('biblical', 'All things are lawful for me, but not all things are profitable. All things are lawful, but I will not be mastered by anything.', '1 Corinthians 6:12'),
  ('biblical', 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.', '1 Corinthians 10:13'),
  ('biblical', 'Like a city whose walls are broken through is a person who lacks self-control.', 'Proverbs 25:28'),
  ('biblical', 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.', '2 Timothy 1:7'),
  ('biblical', 'Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour.', '1 Peter 5:8'),
  ('biblical', 'Let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.', 'Hebrews 12:1'),
  ('biblical', 'Blessed is the one who perseveres under trial, because, having stood the test, that person will receive the crown of life.', 'James 1:12'),
  ('biblical', 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.', 'Galatians 5:22-23'),
  ('stoic', 'Endure each hour as it comes.', 'Marcus Aurelius'),
  ('stoic', 'You have power over your mind — not outside events. Realise this, and you will find strength.', 'Marcus Aurelius'),
  ('stoic', 'It is not the man who has too little, but the man who craves more, that is poor.', 'Seneca'),
  ('stoic', 'We suffer more often in imagination than in reality.', 'Seneca'),
  ('stoic', 'First say to yourself what you would be; and then do what you have to do.', 'Epictetus'),
  ('recovery', 'It only takes a moment to choose your future.', 'Allen Carr'),
  ('recovery', 'The cigarette doesn''t relieve the craving. It is the craving.', null),
  ('recovery', 'You don''t need a cigarette. You need 10 minutes.', null),
  ('recovery', 'Most cravings pass in less time than it takes to make a cup of tea.', null),
  ('recovery', 'There is no such thing as ''just one''.', null),
  ('recovery', 'The discomfort of withdrawal is the discomfort of healing.', null),
  ('identity', 'Your baseline gets higher every day you hold the line.', null),
  ('identity', 'You''re not quitting smoking. You''re a non-smoker.', null),
  ('identity', 'You''re not weak. You''re fighting chemistry. Chemistry loses when you keep showing up.', null),
  ('identity', 'Day 3 is the worst day. You''ve already done harder things.', null),
  ('identity', 'The hard work compounds. So does the easy work.', null),
  ('identity', 'You said you wanted to move to Stellenbosch. Today''s the day you mean it.', null),
  ('identity', 'The version of you in 6 months is watching what you do right now.', null),
  ('general', 'Discipline is choosing between what you want now and what you want most.', null),
  ('general', 'The cave you fear to enter holds the treasure you seek.', 'Joseph Campbell'),
  ('general', 'Sit with it. It passes.', null),
  ('general', 'Don''t break the chain.', null)
) as v(category, content, reference)
where not exists (select 1 from quotes);
