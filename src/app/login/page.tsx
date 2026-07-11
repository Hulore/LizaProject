import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { teacherAccount } from "@/data/students";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="auth-page">
        <section className="auth-panel">
          <div className="auth-copy">
            <p>Вход</p>
            <h1>Регистрация только по приглашению</h1>
          </div>

          <form className="auth-form">
            <label>
              <span>Логин</span>
              <input name="login" placeholder="Например: student_alina" />
            </label>

            <label>
              <span>Пароль</span>
              <input name="password" type="password" placeholder="Пароль" />
            </label>

            <label>
              <span>Код приглашения</span>
              <input name="invite" placeholder="Например: LZ-8K2P-MR91" />
            </label>

            <div className="auth-actions">
              <Link href="/">Войти как ученик</Link>
              <Link href="/teacher">Войти как учитель</Link>
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
