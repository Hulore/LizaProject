import { SiteHeader } from "@/components/site-header";
import { registerStudentAction } from "./actions";

const errorMessages: Record<string, string> = {
  empty: "Заполни имя, логин и пароль.",
  invite: "Приглашение не найдено или уже использовано.",
  login: "Такой логин уже занят.",
  password: "Пароль должен быть хотя бы 6 символов.",
};

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { code } = await params;
  const query = await searchParams;
  const registerWithCode = registerStudentAction.bind(null, code);
  const error = query?.error ? errorMessages[query.error] : null;

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="auth-page">
        <section className="auth-panel">
          <div className="auth-copy">
            <p>Приглашение {code}</p>
            <h1>Регистрация ученика</h1>
          </div>

          <form action={registerWithCode} className="auth-form">
            <label>
              <span>Имя</span>
              <input name="name" placeholder="Например: Лиза Иванова" required />
            </label>

            <label>
              <span>Логин</span>
              <input name="login" placeholder="Например: liza_student" required />
            </label>

            <label>
              <span>Пароль</span>
              <input name="password" type="password" placeholder="Минимум 6 символов" required />
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <div className="auth-actions auth-actions-single">
              <button type="submit">Создать аккаунт</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
