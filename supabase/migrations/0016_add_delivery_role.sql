-- Adds a 'delivery' role for the new delivery-staff dashboard.
--
-- IMPORTANT: this must be run and committed on its own, as a separate paste
-- into the SQL Editor, BEFORE running 0017_delivery_dashboard_schema.sql.
-- Postgres will not let a newly-added enum value be referenced by other
-- statements in the same transaction that added it.

alter type user_role add value if not exists 'delivery';
