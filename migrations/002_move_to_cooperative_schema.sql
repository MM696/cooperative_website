BEGIN;

CREATE SCHEMA IF NOT EXISTS cooperative;

ALTER TABLE IF EXISTS public.admins SET SCHEMA cooperative;
ALTER TABLE IF EXISTS public.admin_sessions SET SCHEMA cooperative;
ALTER TABLE IF EXISTS public.admin_signup_tokens SET SCHEMA cooperative;
ALTER TABLE IF EXISTS public.members SET SCHEMA cooperative;
ALTER TABLE IF EXISTS public.member_sessions SET SCHEMA cooperative;
ALTER TABLE IF EXISTS public.member_signup_tokens SET SCHEMA cooperative;
ALTER TABLE IF EXISTS public.contributions SET SCHEMA cooperative;

COMMIT;
