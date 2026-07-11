"use client";

import { useMemo, useState } from "react";
import type { Invitation } from "@/data/invitations";
import type { Student } from "@/data/students";

type SortKey = "name" | "averageScore" | "completedTasks";

const sortLabels: Record<SortKey, string> = {
  name: "по имени",
  averageScore: "по баллам",
  completedTasks: "по заданиям",
};

export function TeacherDashboard({
  copiedInvite,
  createInvitationAction,
  createdInviteCode,
  createdInviteUrl,
  invitations,
  students,
}: {
  copiedInvite?: boolean;
  createInvitationAction: () => Promise<void>;
  createdInviteCode?: string;
  createdInviteUrl?: string;
  invitations: Invitation[];
  students: Student[];
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const visibleStudents = useMemo(() => {
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
  }, [query, sortKey, students]);

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

      <div className="teacher-controls">
        <label>
          <span>Поиск</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Имя, логин, предмет, код"
          />
        </label>

        <label>
          <span>Сортировка</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

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
