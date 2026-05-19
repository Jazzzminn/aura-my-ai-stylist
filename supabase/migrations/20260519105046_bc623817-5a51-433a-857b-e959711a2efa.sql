
create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  category text not null,
  color text not null default '#C9A98E',
  pattern text,
  image_url text,
  date_added timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists garments_user_id_idx on public.garments(user_id);

alter table public.garments enable row level security;

create policy "Users can view their own garments"
  on public.garments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own garments"
  on public.garments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own garments"
  on public.garments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own garments"
  on public.garments for delete
  using (auth.uid() = user_id);
