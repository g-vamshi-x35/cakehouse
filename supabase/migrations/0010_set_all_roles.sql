-- Set roles for the three test accounts. Run this AFTER signing up all
-- three through /signup (signup always creates a 'customer' role account —
-- this is the only way to grant owner/employee access).
--
-- Safe to re-run: plain updates keyed on email, no inserts.

update profiles
set role = 'owner'
where id = (select id from auth.users where email = 'jagadishrock529@gmail.com');

update profiles
set role = 'employee'
where id = (select id from auth.users where email = 'gedalwamshi@gmail.com');

-- srivamshi005@gmail.com stays 'customer' (the signup default) —
-- included here only so this file documents the full intended state.
update profiles
set role = 'customer'
where id = (select id from auth.users where email = 'srivamshi005@gmail.com');

-- Verify all three landed correctly:
select u.email, p.role
from auth.users u
join profiles p on p.id = u.id
where u.email in ('jagadishrock529@gmail.com', 'gedalwamshi@gmail.com', 'srivamshi005@gmail.com');
