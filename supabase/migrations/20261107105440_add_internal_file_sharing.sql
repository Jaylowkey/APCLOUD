create table if not exists public.file_shares (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint file_shares_no_self_share check (sender_id <> recipient_id),
  constraint file_shares_unique unique (sender_id, recipient_id, photo_id)
);
alter table public.file_shares enable row level security;
grant select, insert, delete on public.file_shares to authenticated;
create policy "Users can view shares sent or received" on public.file_shares for select to authenticated using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);
create policy "Users can share their own files" on public.file_shares for insert to authenticated with check ((select auth.uid()) = sender_id and exists (select 1 from public.photos p where p.id = photo_id and p.user_id = (select auth.uid()) and p.deleted_at is null));
create policy "Senders can revoke their shares" on public.file_shares for delete to authenticated using ((select auth.uid()) = sender_id);
create or replace function public.lookup_apcloud_user_by_email(lookup_email text)
returns table(user_id uuid, email text)
language sql stable security definer set search_path = ''
as $$ select u.id, u.email::text from auth.users u where auth.uid() is not null and lower(u.email) = lower(trim(lookup_email)) and u.deleted_at is null limit 1; $$;
revoke all on function public.lookup_apcloud_user_by_email(text) from public, anon;
grant execute on function public.lookup_apcloud_user_by_email(text) to authenticated;
create index if not exists file_shares_recipient_created_idx on public.file_shares(recipient_id, created_at desc);
create index if not exists file_shares_sender_created_idx on public.file_shares(sender_id, created_at desc);
