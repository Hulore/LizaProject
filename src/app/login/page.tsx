import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { teacherAccount } from "@/data/students";
import { getTeacherSession } from "@/lib/auth";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getTeacherSession();

  if (session) {
    redirect("/teacher");
  }

  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="auth-page">
        <section className="auth-panel">
          <div className="auth-copy">
            <p>Вход</p>
            <h1>Регистрация только по приглашению</h1>
          </div>

          <form action={loginAction} className="auth-form">
            <label>
              <span>Логин</span>
              <input name="login" placeholder="Например: TestTeacher" required />
            </label>

            <label>
              <span>Пароль</span>
              <input name="password" type="password" placeholder="Пароль" required />
            </label>

            <label>
              <span>Код приглашения</span>
              <input name="invite" placeholder="Например: LZ-8K2P-MR91" />
            </label>

            {error ? (
              <p className="auth-error">
                {error === "empty" ? "Введи логин и пароль." : "Логин или пароль не подошли."}
              </p>
            ) : null}

            <div className="auth-actions">
              <Link href="/">Войти как ученик</Link>
              <button type="submit">Войти как учитель</button>
            </div>
          </form>

          <p className="teacher-test-login">
            Тест учителя: {teacherAccount.login} / {teacherAccount.password}
          </p>
        </section>
      </main>
    </div>
  );
}
