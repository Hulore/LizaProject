begin;

alter table public.teacher_accounts add column if not exists session_version integer not null default 0;

drop policy if exists "Allow public read for prototype students" on public.students;
drop policy if exists "Allow public read for prototype invitations" on public.invitations;
revoke all on public.teacher_accounts, public.students, public.invitations from anon, authenticated;
revoke all on function public.verify_teacher_login(text, text) from public;
revoke execute on function public.verify_teacher_login(text, text) from anon, authenticated;

-- Disable only unchanged demo passwords that were previously published in source.
with demo(login, password) as (values
  ('student_alina', 'Q7v!2mZp#19a'),
  ('student_matvey', 'N4r$8xTc@52q'),
  ('student_sofia', 'H9p&6dVy!03s'),
  ('student_ivan', 'R2k#9wLp$74f'),
  ('student_eva', 'T8z!1qMa#66u'),
  ('student_daniil', 'M6y$3hXn@81p'),
  ('student_maria', 'P1s&7jRb!48k'),
  ('student_artem', 'V5c#0nGt$25e')
)
update public.students as student
set password_hash=extensions.crypt(encode(extensions.gen_random_bytes(32), 'hex'), extensions.gen_salt('bf'))
from demo
where student.login=demo.login
  and student.password_hash=extensions.crypt(demo.password, student.password_hash);

commit;
