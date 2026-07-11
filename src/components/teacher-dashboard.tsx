import type { Invitation } from "@/data/invitations";
import type { Student } from "@/data/students";

export type StudentSortKey = "name" | "averageScore" | "completedTasks";

const sortLabels: Record<StudentSortKey, string> = {
  name: "по имени",
  averageScore: "по баллам",
  completedTasks: "по заданиям",
};

function getVisibleStudents(students: Student[], query: string, sortKey: StudentSortKey) {
  const normalizedQuery = query.trim().toLowerCase();

  return students
    .filter((student) => {
      if (!normalizedQuery) {
        return true;
      }

      return [student.name, student.login, student.inviteCode, ...student.subjects, ...student.exams]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .sort((first, second) => {
      if (sortKey === "name") {
        return first.name.localeCompare(second.name, "ru");
      }

      return second[sortKey] - first[sortKey];
    });
}

export function TeacherDashboard({
  copiedInvite,
  createInvitationAction,
  createdInviteCode,
  createdInviteUrl,
  invitations,
  query,
  sortKey,
  students,
}: {
  copiedInvite?: boolean;
  createInvitationAction: () => Promise<void>;
  createdInviteCode?: string;
  createdInviteUrl?: string;
  invitations: Invitation[];
  query: string;
  sortKey: StudentSortKey;
  students: Student[];
}) {
  const visibleStudents = getVisibleStudents(students, query, sortKey);

  return (
    <section className="teacher-shell">
      <div className="teacher-toolbar">
        <div>
          <p className="teacher-kicker">Учитель</p>
          <h1>Список учеников</h1>
        </div>

        <form action={createInvitationAction} className="create-invite-box">
          <button type="submit" className="invite-button">
            Создать приглашение
          </button>
          <small>Каждое нажатие удаляет старую свободную ссылку и создаёт новую.</small>
        </form>
      </div>

      {createdInviteCode && createdInviteUrl ? (
        <div className="invite-result">
          <span>Новое приглашение</span>
          <a href={createdInviteUrl}>{createdInviteUrl}</a>
          {copiedInvite ? <small>Ссылка уже в буфере. Можно вставлять в чат или Блокнот.</small> : null}
        </div>
      ) : null}

      <div className="invite-list">
        {invitations.map((invitation) => (
          <a
            key={invitation.code}
            className={invitation.isUsed ? "invite-chip invite-chip-used" : "invite-chip"}
            href={`/register/${invitation.code}`}
          >
            <span>{invitation.code}</span>
            <small>{invitation.isUsed ? "использовано" : "свободно"} · {invitation.createdAt}</small>
          </a>
        ))}
      </div>

      <form className="teacher-controls" method="get" action="/teacher">
        <label>
          <span>Поиск</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="Имя, логин, предмет, код"
          />
        </label>

        <label>
          <span>Сортировка</span>
          <select name="sort" defaultValue={sortKey}>
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Применить</button>
        <a href="/teacher">Сбросить</a>
      </form>

      <p className="student-list-summary">
        Показано учеников: {visibleStudents.length} из {students.length}
      </p>

      <div className="student-list">
        {visibleStudents.map((student) => (
          <article key={student.id} className="student-row">
            <div>
              <h2>{student.name}</h2>
              <p>{student.login}</p>
            </div>

            <div>
              <span>{student.subjects.join(", ")}</span>
              <p>{student.exams.join(", ")}</p>
            </div>

            <div>
              <span>{student.completedTasks}</span>
              <p>заданий</p>
            </div>

            <div>
              <span>{student.averageScore}%</span>
              <p>средний балл</p>
            </div>

            <div>
              <span>{student.inviteCode}</span>
              <p>{student.lastActivity}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
