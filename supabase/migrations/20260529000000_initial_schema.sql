-- RECONSTRUCTED INITIAL MIGRATION for Remy2404/university_enrollment_system.
-- Based on src/types/database.ts (main branch, checked 2026-11-22).
-- This is a new schema implementation, NOT an export of the original database.
-- Review policies, validation rules, and defaults for your application before production.
-- Must run BEFORE 20260530080600_create_notifications_and_application_actions.sql.

begin;

-- 1. Enums used by the application and the following migration.
create type public.admission_period_status as enum ('upcoming', 'open', 'closed', 'archived');
create type public.app_role as enum ('applicant', 'admission_officer', 'registrar', 'admin');
create type public.application_status as enum (
  'draft', 'submitted', 'under_review', 'documents_required',
  'accepted', 'rejected', 'enrolled', 'withdrawn'
);
create type public.degree_level as enum ('associate', 'bachelor', 'master', 'doctorate');
create type public.document_status as enum ('pending_review', 'verified', 'rejected');
create type public.document_type as enum (
  'profile_photo', 'national_id', 'high_school_certificate',
  'transcript', 'birth_certificate', 'other'
);
create type public.enrollment_status as enum ('active', 'suspended', 'graduated', 'withdrawn');

-- 2. Base tables. All 14 tables here are intentionally created before the
--    later migration adds notifications and user_preferences (16 total).
create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  constraint academic_year_dates_valid check (end_date >= start_date)
);

create table public.faculties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculties(id),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id),
  code text not null unique,
  name text not null,
  description text,
  degree_level public.degree_level not null,
  duration_years integer not null check (duration_years > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admission_periods (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id),
  name text not null,
  application_open_date date not null,
  application_deadline date not null,
  status public.admission_period_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_period_dates_valid check (application_deadline >= application_open_date)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  gender text,
  date_of_birth date,
  nationality text,
  national_id_number text,
  current_address text,
  province_city text,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint user_roles_unique_per_user unique (user_id, role)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(id),
  admission_period_id uuid not null references public.admission_periods(id),
  application_number text not null unique,
  status public.application_status not null default 'draft',
  progress_percentage integer default 0 check (progress_percentage between 0 and 100),
  personal_info jsonb,
  contact_info jsonb,
  academic_background jsonb,
  guardian_info jsonb,
  is_archived boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_program_choices (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  program_id uuid not null references public.programs(id),
  priority integer not null check (priority > 0),
  created_at timestamptz not null default now(),
  constraint application_program_choices_priority_unique unique(application_id, priority)
);

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id),
  document_type public.document_type not null,
  storage_path text not null,
  file_name text not null,
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  mime_type text not null,
  status public.document_status not null default 'pending_review',
  reject_reason text,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  decision public.application_status not null,
  notes text,
  reviewed_at timestamptz not null default now()
);

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status public.application_status,
  to_status public.application_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  change_reason text,
  changed_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id),
  applicant_id uuid not null references public.profiles(id),
  program_id uuid not null references public.programs(id),
  academic_year_id uuid not null references public.academic_years(id),
  student_number text not null unique,
  status public.enrollment_status not null default 'active',
  enrollment_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index applications_applicant_id_idx on public.applications (applicant_id);
create index applications_status_idx on public.applications (status);
create index application_documents_application_id_idx on public.application_documents (application_id);
create index application_reviews_application_id_idx on public.application_reviews (application_id);
create index application_status_history_application_id_idx on public.application_status_history (application_id, changed_at desc);
create index enrollments_applicant_id_idx on public.enrollments (applicant_id);
create index user_roles_user_id_idx on public.user_roles (user_id);

-- 3. Auth helper functions referenced by the existing migration.
--    SECURITY DEFINER avoids recursive user_roles RLS checks.
create function public.has_role(_role public.app_role, _user_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create function public.auth_has_role(_role public.app_role)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select public.has_role(_role, auth.uid());
$$;

create function public.is_enrollment_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select public.auth_has_role('admission_officer')
      or public.auth_has_role('registrar')
      or public.auth_has_role('admin');
$$;

grant execute on function public.has_role(public.app_role, uuid) to authenticated;
grant execute on function public.auth_has_role(public.app_role) to authenticated;
grant execute on function public.is_enrollment_staff() to authenticated;

-- 4. Create an application profile and applicant role after sign-up.
create function public.handle_enrollment_auth_user_created()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone_number)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
             nullif(split_part(new.email, '@', 1), ''), 'New User'),
    nullif(new.raw_user_meta_data ->> 'phone_number', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'applicant')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_enrollment
  after insert on auth.users
  for each row execute function public.handle_enrollment_auth_user_created();

-- 5. Generic timestamp update for tables with updated_at.
create function public.set_enrollment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'faculties', 'departments', 'programs', 'admission_periods',
    'profiles', 'applications', 'application_documents', 'enrollments'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_enrollment_updated_at()',
      table_name
    );
  end loop;
end;
$$;

-- 5b. Track application status changes for the student's timeline.
create function public.record_application_status_change()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (
      application_id, from_status, to_status, changed_by
    ) values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger applications_record_status_change
  after update of status on public.applications
  for each row execute function public.record_application_status_change();

-- 6. Row-level security. Policy choices here are a conservative reconstruction.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'academic_years', 'faculties', 'departments', 'programs',
    'admission_periods', 'profiles', 'user_roles', 'applications',
    'application_program_choices', 'application_documents',
    'application_reviews', 'application_status_history', 'enrollments',
    'audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

-- Public catalog can be displayed before user sign-in.
grant select on public.academic_years, public.faculties, public.departments,
  public.programs, public.admission_periods to anon, authenticated;
grant insert, update, delete on public.academic_years, public.faculties, public.departments,
  public.programs, public.admission_periods to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'academic_years', 'faculties', 'departments', 'programs', 'admission_periods'
  ] loop
    execute format(
      'create policy catalog_read on public.%I for select to anon, authenticated using (true)',
      table_name
    );
    execute format(
      'create policy catalog_admin_insert on public.%I for insert to authenticated with check (public.auth_has_role(''admin''))',
      table_name
    );
    execute format(
      'create policy catalog_admin_update on public.%I for update to authenticated using (public.auth_has_role(''admin'')) with check (public.auth_has_role(''admin''))',
      table_name
    );
    execute format(
      'create policy catalog_admin_delete on public.%I for delete to authenticated using (public.auth_has_role(''admin''))',
      table_name
    );
  end loop;
end;
$$;

grant select, insert, update on public.profiles to authenticated;
create policy profiles_select on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_enrollment_staff());
create policy profiles_insert_own on public.profiles for insert to authenticated
with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

grant select, insert, update, delete on public.user_roles to authenticated;
create policy user_roles_select on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or public.is_enrollment_staff());
create policy user_roles_admin_insert on public.user_roles for insert to authenticated
with check (public.auth_has_role('admin'));
create policy user_roles_admin_update on public.user_roles for update to authenticated
using (public.auth_has_role('admin')) with check (public.auth_has_role('admin'));
create policy user_roles_admin_delete on public.user_roles for delete to authenticated
using (public.auth_has_role('admin'));

grant select, insert, update, delete on public.applications to authenticated;
create policy applications_select on public.applications for select to authenticated
using (applicant_id = (select auth.uid()) or public.is_enrollment_staff());
create policy applications_insert_draft on public.applications for insert to authenticated
with check (applicant_id = (select auth.uid()) and status = 'draft');
create policy applications_admin_update on public.applications for update to authenticated
using (public.auth_has_role('admin')) with check (public.auth_has_role('admin'));
create policy applications_delete_draft on public.applications for delete to authenticated
using ((applicant_id = (select auth.uid()) and status = 'draft') or public.auth_has_role('admin'));

grant select on public.application_program_choices to authenticated;
create policy application_program_choices_read on public.application_program_choices
for select to authenticated using (
  public.is_enrollment_staff() or exists (
    select 1 from public.applications a
    where a.id = application_id and a.applicant_id = (select auth.uid())
  )
);

-- The follow-up migration creates document write policies and grants.
grant select on public.application_documents to authenticated;

grant select on public.application_reviews to authenticated;
create policy application_reviews_read on public.application_reviews for select to authenticated
using (public.is_enrollment_staff() or exists (
  select 1 from public.applications a
  where a.id = application_id and a.applicant_id = (select auth.uid())
));

grant select on public.application_status_history to authenticated;
create policy application_status_history_read on public.application_status_history
for select to authenticated using (public.is_enrollment_staff() or exists (
  select 1 from public.applications a
  where a.id = application_id and a.applicant_id = (select auth.uid())
));

grant select, insert, update, delete on public.enrollments to authenticated;
create policy enrollments_read on public.enrollments for select to authenticated
using (applicant_id = (select auth.uid()) or public.is_enrollment_staff());
create policy enrollments_staff_insert on public.enrollments for insert to authenticated
with check (public.is_enrollment_staff());
create policy enrollments_staff_update on public.enrollments for update to authenticated
using (public.is_enrollment_staff()) with check (public.is_enrollment_staff());
create policy enrollments_staff_delete on public.enrollments for delete to authenticated
using (public.auth_has_role('admin'));

grant select on public.audit_logs to authenticated;
create policy audit_logs_admin_read on public.audit_logs for select to authenticated
using (public.auth_has_role('admin'));

-- 7. Storage bucket needed by the follow-up migration's storage policies.
--    Actual files are uploaded separately. 10 MiB matches the app's docs.
insert into storage.buckets (id, name, public, file_size_limit)
values ('application-documents', 'application-documents', false, 10485760)
on conflict (id) do nothing;

commit;
