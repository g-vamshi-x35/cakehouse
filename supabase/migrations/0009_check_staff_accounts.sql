-- Diagnostic only (no changes made) — run this first and share the result.
-- Shows whether each account exists in auth.users, and what role (if any)
-- it currently has in profiles.

select
  u.email,
  u.id as user_id,
  u.email_confirmed_at is not null as email_confirmed,
  p.role
from auth.users u
left join profiles p on p.id = u.id
where u.email in ('jagadishrock529@gmail.com', 'gedalwamshi@gmail.com');
