-- Promote a specific account to the 'owner' role so it can access
-- /dashboard/owner. Run this AFTER signing up normally through /signup
-- with the target email — signup always creates a 'customer' role account,
-- so this is the only way to grant owner access.
--
-- Safe to re-run: it's a plain update keyed on email, not an insert.

update profiles
set role = 'owner'
where id = (select id from auth.users where email = 'jagadishrock529@gmail.com');
