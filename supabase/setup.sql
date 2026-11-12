-- Assadaka — installation Supabase
-- Exécuter ce fichier dans Supabase > SQL Editor, puis créer l'utilisateur admin.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 'main')
);

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Le catalogue public est lisible sans compte.
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content for select
to anon, authenticated
using (true);

-- Seuls les administrateurs inscrits dans admin_users peuvent publier.
drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
on public.site_content for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
on public.site_content for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Un administrateur peut consulter les autres comptes autorisés, sans pouvoir
-- s'ajouter lui-même arbitrairement depuis le navigateur.
drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin());

-- Bucket public pour les images du catalogue.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "Public can read site images" on storage.objects;
create policy "Public can read site images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-images');

drop policy if exists "Admins can upload site images" on storage.objects;
create policy "Admins can upload site images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admins can update site images" on storage.objects;
create policy "Admins can update site images"
on storage.objects for update
to authenticated
using (bucket_id = 'site-images' and public.is_admin())
with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admins can delete site images" on storage.objects;
create policy "Admins can delete site images"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-images' and public.is_admin());

-- APRÈS avoir créé l'utilisateur dans Authentication > Users :
-- récupérer son UUID puis exécuter la ligne suivante en remplaçant l'UUID.
-- insert into public.admin_users (user_id) values ('UUID_DE_L_ADMIN');
