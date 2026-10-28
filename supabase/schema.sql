-- ============================================================
-- 小婷500分之路 · Supabase 数据库初始化脚本
-- 使用方法：Supabase 控制台 → SQL Editor → 新建查询 → 粘贴全文 → Run
-- 可以重复执行，不会报错。
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. 用户表（只有两个人，不开放注册，保留头像等资料）
-- ------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null check (role in ('admin', 'student')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- 固定两个账号的 id，方便任务表记录 created_by
insert into public.users (id, name, role)
values
  ('00000000-0000-0000-0000-000000000001', '男朋友', 'admin'),
  ('00000000-0000-0000-0000-000000000002', '小婷', 'student')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. 每日任务（一天一条）
--    subtasks 用 jsonb 数组保存，例如 ["背单词50个","阅读1篇"]
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  date        date not null unique,
  title       text not null default '今日英语任务',
  description text,                                  -- 一句话鼓励语
  subtasks    jsonb not null default '[]'::jsonb,
  created_by  uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. 提交记录（一天一条，补交/重交时覆盖，保留最新）
--    image_urls 里存的是 Storage 里的对象路径，不是公开链接，
--    读取时服务端会换成 12 小时有效的签名 URL。
-- ------------------------------------------------------------
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  date         date not null unique,
  image_urls   text[] not null default '{}',
  note         text,
  submitted_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. 催作业记录
-- ------------------------------------------------------------
create table if not exists public.reminders (
  id      uuid primary key default gen_random_uuid(),
  date    date not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists reminders_sent_at_idx on public.reminders (sent_at desc);
create index if not exists reminders_unread_idx on public.reminders (read_at) where read_at is null;

-- ------------------------------------------------------------
-- 5. 行级安全（RLS）
--    所有读写都由服务端的 service_role 完成（会跳过 RLS）。
--    这里只给浏览器端的 anon key 开一条只读策略：
--    为了可以 Realtime 订阅「催作业」事件，reminders 允许匿名只读。
--    这里面没有照片、任务内容等私密信息。
-- ------------------------------------------------------------
alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.submissions enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "anon can read reminders" on public.reminders;
create policy "anon can read reminders"
  on public.reminders
  for select
  to anon
  using (true);

-- ------------------------------------------------------------
-- 6. 打开 reminders 表的 Realtime
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'reminders'
  ) then
    alter publication supabase_realtime add table public.reminders;
  end if;
end $$;

-- ------------------------------------------------------------
-- 7. 私有 Storage bucket（存作业照片）
--    不添加任何 anon 读写策略，只有服务端 service_role 能访问。
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do update set public = false;

-- ------------------------------------------------------------
-- 8. 表级权限（GRANT）
--    RLS 管的是「行」，PostgreSQL 还要求「表」级权限。
--    服务端 service_role 需要读写全部表；anon 只需要 reminders 的只读
--    （内容受上面 RLS 策略限制，只为了能 Realtime 订阅）。
-- ------------------------------------------------------------
grant usage on schema public to anon, service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select on public.reminders to anon;
grant usage, select on all sequences in schema public to service_role, anon;

-- 以后新建的表也自动授权给 service_role
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
