create or replace function public.verify_teacher_login(input_login text, input_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_accounts
    where login = input_login
      and password_hash = crypt(input_password, password_hash)
  );
$$;

revoke all on function public.verify_teacher_login(text, text) from public;
grant execute on function public.verify_teacher_login(text, text) to anon, authenticated;
