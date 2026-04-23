drop policy if exists gm_insert on public.group_members;

create policy gm_insert
on public.group_members
for insert
to public
with check (
  user_id = auth.uid()
  and (
    status = 'pending'
    or (status = 'accepted' and creator_id = auth.uid())
  )
);

create or replace function public.join_group_by_invite_code(p_invite_code text)
returns table(group_id uuid, name text, creator_id uuid, invite_code text, membership_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_group public.groups%rowtype;
  existing_status text;
begin
  select *
    into target_group
  from public.groups
  where invite_code = upper(trim(coalesce(p_invite_code, '')))
  limit 1;

  if not found then
    raise exception 'Gruppe nicht gefunden';
  end if;

  if target_group.creator_id = auth.uid() then
    raise exception 'Das ist deine eigene Gruppe';
  end if;

  select gm.status
    into existing_status
  from public.group_members gm
  where gm.group_id = target_group.id
    and gm.user_id = auth.uid();

  if existing_status = 'accepted' then
    raise exception using errcode = '23505', message = 'Bereits Mitglied';
  elsif existing_status = 'pending' then
    raise exception using errcode = '23505', message = 'Anfrage bereits gesendet';
  end if;

  insert into public.group_members (group_id, user_id, status, creator_id)
  values (target_group.id, auth.uid(), 'pending', target_group.creator_id);

  return query
  select target_group.id, target_group.name, target_group.creator_id, target_group.invite_code, 'pending'::text;
end;
$$;

create or replace function public.sync_seed_group_membership(p_invite_code text)
returns table(group_id uuid, name text, creator_id uuid, invite_code text, membership_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_group public.groups%rowtype;
  current_email text;
  current_status text;
begin
  select *
    into target_group
  from public.groups
  where invite_code = upper(trim(coalesce(p_invite_code, '')))
  limit 1;

  if not found then
    raise exception 'Gruppe nicht gefunden';
  end if;

  select u.email
    into current_email
  from auth.users u
  where u.id = auth.uid();

  if current_email is null then
    raise exception 'Nicht angemeldet';
  end if;

  if current_email <> '5014124@eliteplan.htw' then
    raise exception 'Seed-Gruppensync ist fuer diesen Benutzer nicht freigegeben';
  end if;

  insert into public.group_members (group_id, user_id, status, creator_id)
  values (target_group.id, auth.uid(), 'accepted', target_group.creator_id)
  on conflict (group_id, user_id) do update
    set status = 'accepted',
        creator_id = excluded.creator_id;

  select gm.status
    into current_status
  from public.group_members gm
  where gm.group_id = target_group.id
    and gm.user_id = auth.uid();

  return query
  select target_group.id, target_group.name, target_group.creator_id, target_group.invite_code, coalesce(current_status, 'accepted')::text;
end;
$$;

revoke all on function public.join_group_by_invite_code(text) from public;
revoke all on function public.sync_seed_group_membership(text) from public;

grant execute on function public.join_group_by_invite_code(text) to authenticated;
grant execute on function public.sync_seed_group_membership(text) to authenticated;
