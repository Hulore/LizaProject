import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { getSession } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mock-header-inner mx-auto grid min-h-32 max-w-[1380px] grid-cols-[1fr_auto] items-center gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[180px_1fr_180px] lg:px-10">
        <span className="hidden lg:block" aria-hidden="true" />

        <Link href="/" className="brand-banner">
          <span>Лиза</span>
          <strong>ЖЁСТКИЕЙ ТРЕНЖЁР</strong>
          <em>+ Вайб</em>
        </Link>

        {session ? (
          <div className="header-account">
            <Link
              href={session.role === "teacher" ? "/teacher" : "/"}
              className="auth-button account-button"
              title={session.role === "teacher" ? "Открыть кабинет учителя" : "Аккаунт ученика"}
            >
              {session.name ?? session.login}
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="auth-button logout-button">
                Выйти
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="auth-button">
            Регистрация/вход
          </Link>
        )}
      </div>
    </header>
  );
}
