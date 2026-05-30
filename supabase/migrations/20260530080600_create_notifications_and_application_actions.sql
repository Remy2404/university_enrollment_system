begin;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  message text not null check (char_length(message) between 1 and 1000),
  type text not null default 'info' check (type in ('success', 'info', 'warning', 'error')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "notifications_insert_own_or_staff" on public.notifications;
create policy "notifications_insert_own_or_staff"
  on public.notifications for insert
  with check (
    public.auth_has_role('admission_officer')
    or public.auth_has_role('registrar')
    or public.auth_has_role('admin')
  );

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_notifications boolean not null default true,
  sms_notifications boolean not null default false,
  application_updates boolean not null default true,
  document_alerts boolean not null default true,
  language text not null default 'en' check (language in ('en', 'km')),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

grant select, insert, update, delete on table public.notifications to authenticated;
grant select, insert, update on table public.user_preferences to authenticated;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
  on public.user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.notify_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_title text;
  notification_message text;
  notification_type text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  case new.status
    when 'submitted' then
      notification_title := 'Application Submitted';
      notification_message := 'Your application has been submitted successfully.';
      notification_type := 'success';
    when 'under_review' then
      notification_title := 'Application Under Review';
      notification_message := 'Admission staff are reviewing your application.';
      notification_type := 'info';
    when 'documents_required' then
      notification_title := 'Document Corrections Required';
      notification_message := 'Admission staff requested corrections to your application documents.';
      notification_type := 'warning';
    when 'accepted' then
      notification_title := 'Application Accepted';
      notification_message := 'Congratulations. Your admission application has been accepted.';
      notification_type := 'success';
    when 'rejected' then
      notification_title := 'Application Decision Updated';
      notification_message := 'Your admission application review has been completed.';
      notification_type := 'error';
    when 'enrolled' then
      notification_title := 'Enrollment Completed';
      notification_message := 'Your university enrollment has been completed.';
      notification_type := 'success';
    else
      return new;
  end case;

  insert into public.notifications (user_id, title, message, type)
  values (new.applicant_id, notification_title, notification_message, notification_type);

  return new;
end;
$$;

drop trigger if exists applications_notify_status_change on public.applications;
create trigger applications_notify_status_change
  after update of status on public.applications
  for each row execute function public.notify_application_status_change();

create or replace function public.create_application_draft(p_admission_period_id uuid)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  draft public.applications;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
      from public.admission_periods
     where id = p_admission_period_id
       and status = 'open'
       and application_open_date <= current_date
       and application_deadline >= current_date
  ) then
    raise exception 'Admission period is not open';
  end if;

  select *
    into draft
    from public.applications
   where applicant_id = auth.uid()
     and status in ('draft', 'documents_required')
   order by created_at desc
   limit 1;

  if found then
    return draft;
  end if;

  insert into public.applications (
    applicant_id,
    admission_period_id,
    application_number
  )
  values (
    auth.uid(),
    p_admission_period_id,
    'PENDING-' || replace(gen_random_uuid()::text, '-', '')
  )
  returning * into draft;

  return draft;
end;
$$;

create or replace function public.save_application_draft(
  p_application_id uuid,
  p_progress_percentage integer,
  p_personal_info jsonb,
  p_contact_info jsonb,
  p_academic_background jsonb,
  p_guardian_info jsonb,
  p_program_id uuid default null
)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.applications;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.applications
     set progress_percentage = greatest(0, least(coalesce(p_progress_percentage, 0), 100)),
         personal_info = p_personal_info,
         contact_info = p_contact_info,
         academic_background = p_academic_background,
         guardian_info = p_guardian_info,
         updated_at = now()
   where id = p_application_id
     and applicant_id = auth.uid()
     and status in ('draft', 'documents_required')
  returning * into saved;

  if not found then
    raise exception 'Editable application not found';
  end if;

  if p_program_id is not null and not exists (
    select 1
      from public.programs
     where id = p_program_id
       and is_active
  ) then
    raise exception 'Active program not found';
  end if;

  delete from public.application_program_choices
   where application_id = p_application_id
     and priority = 1;

  if p_program_id is not null then
    insert into public.application_program_choices (application_id, program_id, priority)
    values (p_application_id, p_program_id, 1);
  end if;

  return saved;
end;
$$;

create or replace function public.submit_application(p_application_id uuid)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  submitted public.applications;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
      from public.application_program_choices
     where application_id = p_application_id
       and priority = 1
  ) then
    raise exception 'Primary program choice required';
  end if;

  update public.applications
     set status = 'submitted',
         progress_percentage = 100,
         submitted_at = coalesce(submitted_at, now()),
         updated_at = now()
   where id = p_application_id
     and applicant_id = auth.uid()
     and status in ('draft', 'documents_required')
  returning * into submitted;

  if not found then
    raise exception 'Submittable application not found';
  end if;

  return submitted;
end;
$$;

create or replace function public.submit_application_review(
  p_application_id uuid,
  p_status public.application_status,
  p_notes text default null
)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed public.applications;
begin
  if not (
    public.auth_has_role('admission_officer')
    or public.auth_has_role('registrar')
    or public.auth_has_role('admin')
  ) then
    raise exception 'Staff role required';
  end if;

  if p_status not in ('accepted', 'rejected', 'documents_required', 'under_review') then
    raise exception 'Unsupported review status';
  end if;

  update public.applications
     set status = p_status,
         updated_at = now()
   where id = p_application_id
  returning * into reviewed;

  if not found then
    raise exception 'Application not found';
  end if;

  insert into public.application_reviews (application_id, reviewer_id, decision, notes)
  values (p_application_id, auth.uid(), p_status, nullif(trim(p_notes), ''));

  return reviewed;
end;
$$;

revoke all on function public.notify_application_status_change() from public;
revoke all on function public.create_application_draft(uuid) from public;
revoke all on function public.save_application_draft(uuid, integer, jsonb, jsonb, jsonb, jsonb, uuid) from public;
revoke all on function public.submit_application(uuid) from public;
revoke all on function public.submit_application_review(uuid, public.application_status, text) from public;

grant execute on function public.create_application_draft(uuid) to authenticated;
grant execute on function public.save_application_draft(uuid, integer, jsonb, jsonb, jsonb, jsonb, uuid) to authenticated;
grant execute on function public.submit_application(uuid) to authenticated;
grant execute on function public.submit_application_review(uuid, public.application_status, text) to authenticated;

commit;
