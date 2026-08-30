"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  socialStudiesNumbers,
  socialStudiesTaskKindLabels,
  socialStudiesTasks,
  socialStudiesTopics,
  type SocialStudiesTask,
} from "@/data/social-studies-tasks";
import {
  egeImportedSocialStudiesNumbers,
  egeImportedSocialStudiesMeta,
  egeImportedSocialStudiesTopics,
} from "@/data/social-studies-ege-imported-meta";
import type { EgeImportedSocialStudiesTask } from "@/data/social-studies-ege-imported-tasks";
import {
  ogeSocialStudiesNumbers,
  ogeSocialStudiesTaskKindLabels,
  ogeSocialStudiesTasks,
  ogeSocialStudiesTopics,
  type OgeSocialStudiesTask,
} from "@/data/social-studies-oge-tasks";
import type { Exam } from "@/data/subjects";

type TrainerMode = "topic" | "number" | "variant";
type AnswerMap = Record<string, string[]>;
type TrainerTask = SocialStudiesTask | OgeSocialStudiesTask | EgeImportedSocialStudiesTask;

function shuffleTasks<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function isOgeTermsTask(task: TrainerTask): task is OgeSocialStudiesTask {
  return task.taskKind === "oge_terms_definition";
}

function isImportedEgeTask(task: TrainerTask): task is EgeImportedSocialStudiesTask {
  return task.taskKind === "ege_imported_text_answer" || task.taskKind === "ege_imported_free_answer";
}

function normalizeTextAnswer(value: string) {
  return value.replace(/[\s,.;:-]/g, "").toLowerCase();
}

function isImportedOrderSensitive(task: EgeImportedSocialStudiesTask) {
  return [3, 6, 13, 14, 15].includes(task.number);
}

function isCorrect(task: TrainerTask, answer: string[] | undefined) {
  if (!answer || answer.length === 0) {
    return false;
  }

  if (isImportedEgeTask(task)) {
    if (!task.answer.autoCheck) {
      return false;
    }

    const studentAnswer = normalizeTextAnswer(answer[0] ?? "");

    return task.answer.value.some((correctAnswer) => {
      const normalizedCorrectAnswer = normalizeTextAnswer(correctAnswer);

      if (isImportedOrderSensitive(task)) {
        return normalizedCorrectAnswer === studentAnswer;
      }

      return [...normalizedCorrectAnswer].sort().join("") === [...studentAnswer].sort().join("");
    });
  }

  if (isOgeTermsTask(task)) {
    return [...task.answer.concepts].sort().join("|") === answer.map((item) => item.toLowerCase()).sort().join("|");
  }

  if (task.answer.orderMatters) {
    return task.answer.value.join("|") === answer.join("|");
  }

  return [...task.answer.value].sort().join("|") === [...answer].sort().join("|");
}

function answerText(task: TrainerTask) {
  if (isImportedEgeTask(task)) {
    return task.answer.autoCheck ? task.answer.value.join(" или ") : "автоматического ответа нет — смотри пояснение/критерии";
  }

  if (isOgeTermsTask(task)) {
    return task.answer.concepts.join(", ");
  }

  return task.answer.value.join(task.answer.orderMatters ? "" : ", ");
}

function isAnswerComplete(task: TrainerTask, answer: string[]) {
  if (isImportedEgeTask(task)) {
    return Boolean(answer[0]?.trim());
  }

  if (isOgeTermsTask(task)) {
    return answer.length === 2;
  }

  if (task.answer.orderMatters) {
    return answer.filter(Boolean).length === task.answer.value.length;
  }

  return answer.length >= task.answer.min && answer.length <= task.answer.max;
}

function getTaskKindLabel(task: TrainerTask) {
  if (isImportedEgeTask(task)) {
    return task.taskKindLabel;
  }

  if (isOgeTermsTask(task)) {
    return ogeSocialStudiesTaskKindLabels[task.taskKind];
  }

  return socialStudiesTaskKindLabels[task.taskKind];
}

function getSourceLabel(task: TrainerTask) {
  if (isImportedEgeTask(task)) {
    return `${task.source.name}, № ${task.source.sourceId}`;
  }

  if (isOgeTermsTask(task)) {
    return `${task.source.name}, № ${task.source.sourceId}, стр. ${task.source.page}`;
  }

  return task.source.name;
}

function buildVariant(tasks: TrainerTask[], numbers: readonly number[]) {
  return numbers
    .map((number) => {
      const tasksByNumber = tasks.filter((task) => task.number === number);

      return shuffleTasks(tasksByNumber)[0];
    })
    .filter(Boolean);
}

function ChoiceAnswer({
  answer,
  onChange,
  task,
}: {
  answer: string[];
  onChange: (value: string[]) => void;
  task: Extract<SocialStudiesTask, { taskKind: "social_choose_exactly_2" | "social_choose_2_to_4" }>;
}) {
  return (
    <div className="trainer-answer-list">
      {task.content.options.map((option) => {
        const checked = answer.includes(option.id);
        const limitReached = answer.length >= task.answer.max;

        return (
          <label key={option.id}>
            <input
              checked={checked}
              disabled={!checked && limitReached}
              onChange={() => {
                if (checked) {
                  onChange(answer.filter((item) => item !== option.id));
                  return;
                }

                onChange([...answer, option.id]);
              }}
              type="checkbox"
            />
            <span>
              {option.id}) {option.text}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function MatchingAnswer({
  answer,
  onChange,
  task,
}: {
  answer: string[];
  onChange: (value: string[]) => void;
  task: Extract<SocialStudiesTask, { taskKind: "social_matching" }>;
}) {
  return (
    <div className="trainer-matching-answer">
      {task.content.leftColumn.map((leftItem, index) => (
        <label key={leftItem.id}>
          <span>{leftItem.id}</span>
          <select
            value={answer[index] ?? ""}
            onChange={(event) => {
              const nextAnswer = [...answer];
              nextAnswer[index] = event.target.value;
              onChange(nextAnswer);
            }}
          >
            <option value="">?</option>
            {task.content.rightColumn.map((rightItem) => (
              <option key={rightItem.id} value={rightItem.id}>
                {rightItem.id}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function TrainerQuestion({
  answer,
  onAnswer,
  task,
}: {
  answer: string[];
  onAnswer: (value: string[]) => void;
  task: TrainerTask;
}) {
  if (isImportedEgeTask(task)) {
    return (
      <>
        {!task.images?.length ? (
          <div className="trainer-imported-prompt">
            {task.prompt.split("\n").map((line, index) =>
              line.trim() ? <p key={`${task.id}-${index}`}>{line}</p> : <br key={`${task.id}-${index}`} />,
            )}
          </div>
        ) : null}
        {task.images?.length ? (
          <div className="trainer-task-images">
            {task.images.map((image) => (
              <Image alt={`Изображение задания №${task.sourceId}`} height={1400} key={image} src={image} width={1100} />
            ))}
          </div>
        ) : null}
        <label className="trainer-text-answer">
          {task.answer.autoCheck || task.part === 1 ? "Ответ" : "Твой развёрнутый ответ"}
          {task.answer.autoCheck || task.part === 1 ? (
            <input
              inputMode="numeric"
              onChange={(event) => onAnswer([event.target.value])}
              placeholder="Например: 245 или 31212"
              type="text"
              value={answer[0] ?? ""}
            />
          ) : (
            <textarea
              onChange={(event) => onAnswer([event.target.value])}
              placeholder="Напиши ответ. В конце откроется пояснение/критерии для самопроверки."
              value={answer[0] ?? ""}
            />
          )}
        </label>
        <p className="trainer-task-instruction">
          {task.answer.autoCheck
            ? "Вводи ответ так, как в ЕГЭ: цифры подряд без пробелов. Для заданий на выбор порядок не важен, для соответствий порядок важен."
            : task.part === 1
              ? "Для этого PDF не найден автоматический ключ, поэтому пока ответ сохраняется для самопроверки/проверки учителем."
              : "Это задание второй части: пока оно идёт на самопроверку. Позже сюда подключим нейросеть/проверку учителем."}
        </p>
      </>
    );
  }

  if (isOgeTermsTask(task)) {
    return (
      <>
        <p className="trainer-task-instruction">{task.instruction}</p>
        <div className="trainer-answer-list">
          {task.terms.map((term) => {
            const value = term.toLowerCase();
            const checked = answer.includes(value);
            const limitReached = answer.length >= 2;

            return (
              <label key={term}>
                <input
                  checked={checked}
                  disabled={!checked && limitReached}
                  onChange={() => {
                    if (checked) {
                      onAnswer(answer.filter((item) => item !== value));
                      return;
                    }

                    onAnswer([...answer, value]);
                  }}
                  type="checkbox"
                />
                <span>{term}</span>
              </label>
            );
          })}
        </div>
        <label className="trainer-definition-note">
          Смысл одного понятия — для самопроверки
          <textarea placeholder="Напиши определение. Автоматически сейчас проверяются только два выбранных понятия." />
        </label>
      </>
    );
  }

  if (task.taskKind === "social_matching") {
    return (
      <>
        <div className="trainer-matching-grid">
          <div>
            <h4>Позиции</h4>
            {task.content.leftColumn.map((item) => (
              <p key={item.id}>
                <b>{item.id}</b> {item.text}
              </p>
            ))}
          </div>
          <div>
            <h4>Варианты</h4>
            {task.content.rightColumn.map((item) => (
              <p key={item.id}>
                <b>{item.id}</b> {item.text}
              </p>
            ))}
          </div>
        </div>
        <MatchingAnswer answer={answer} onChange={onAnswer} task={task} />
      </>
    );
  }

  return <ChoiceAnswer answer={answer} onChange={onAnswer} task={task} />;
}

export function SocialStudiesTrainer({ exam }: { exam: Exam }) {
  const examLabel = exam.toUpperCase();
  const tasks: TrainerTask[] = exam === "oge" ? ogeSocialStudiesTasks : socialStudiesTasks;
  const topics = exam === "oge" ? ogeSocialStudiesTopics : egeImportedSocialStudiesTopics.length ? egeImportedSocialStudiesTopics : socialStudiesTopics;
  const numbers =
    exam === "oge" ? [...ogeSocialStudiesNumbers] : egeImportedSocialStudiesNumbers.length ? egeImportedSocialStudiesNumbers : socialStudiesNumbers;
  const [mode, setMode] = useState<TrainerMode | null>(null);
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [selectedNumber, setSelectedNumber] = useState(numbers[0]);
  const [countByTopic, setCountByTopic] = useState(3);
  const [countByNumber, setCountByNumber] = useState(3);
  const [activeTasks, setActiveTasks] = useState<TrainerTask[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [trainerError, setTrainerError] = useState("");

  const topicTasks = useMemo(
    () => tasks.filter((task) => task.topic === selectedTopic),
    [selectedTopic, tasks],
  );
  const numberTasks = useMemo(
    () => tasks.filter((task) => task.number === selectedNumber),
    [selectedNumber, tasks],
  );

  const currentTask = activeTasks[currentIndex];
  const currentAnswer = currentTask ? answers[currentTask.id] ?? [] : [];
  const autoCheckedTasks = activeTasks.filter((task) => !isImportedEgeTask(task) || task.answer.autoCheck);
  const correctCount = autoCheckedTasks.filter((task) => isCorrect(task, answers[task.id])).length;
  const selectedTopicTotal =
    exam === "ege"
      ? egeImportedSocialStudiesMeta.countsByTopic[selectedTopic as keyof typeof egeImportedSocialStudiesMeta.countsByTopic] ?? 0
      : topicTasks.length;
  const selectedNumberTotal =
    exam === "ege"
      ? egeImportedSocialStudiesMeta.countsByNumber[String(selectedNumber) as keyof typeof egeImportedSocialStudiesMeta.countsByNumber] ?? 0
      : numberTasks.length;
  const safeTopicCount = Math.min(countByTopic, Math.max(selectedTopicTotal, 1));
  const safeNumberCount = Math.min(countByNumber, Math.max(selectedNumberTotal, 1));

  function startTraining(nextMode: TrainerMode, nextTasks: TrainerTask[]) {
    setMode(nextMode);
    setActiveTasks(nextTasks);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setTrainerError("");
  }

  async function startEgeTraining(nextMode: TrainerMode) {
    setIsLoadingTasks(true);
    setTrainerError("");

    const searchParams = new URLSearchParams({ mode: nextMode });

    if (nextMode === "topic") {
      searchParams.set("topic", selectedTopic);
      searchParams.set("count", String(safeTopicCount));
    }

    if (nextMode === "number") {
      searchParams.set("number", String(selectedNumber));
      searchParams.set("count", String(safeNumberCount));
    }

    try {
      const response = await fetch(`/api/social-studies/ege-tasks?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error("Не удалось загрузить задания");
      }

      const data = (await response.json()) as { tasks: EgeImportedSocialStudiesTask[] };

      if (!data.tasks.length) {
        setTrainerError("Для этого выбора пока нет заданий.");
        return;
      }

      startTraining(nextMode, data.tasks);
    } catch {
      setTrainerError("Не получилось загрузить задания. Попробуй ещё раз.");
    } finally {
      setIsLoadingTasks(false);
    }
  }

  function resetTraining() {
    setMode(null);
    setActiveTasks([]);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setTrainerError("");
  }

  if (mode && currentTask && !isFinished) {
    return (
      <section className="trainer-shell">
        <div className="trainer-question-head">
          <div>
            <span>
              Задание {currentIndex + 1} из {activeTasks.length}
            </span>
            <h2>{currentTask.title}</h2>
          </div>
          <button onClick={resetTraining} type="button">
            Выйти
          </button>
        </div>

        <article className="trainer-question-card">
          <div className="trainer-task-meta">
            <span>{examLabel} №{currentTask.number}</span>
            <span>{currentTask.topic}</span>
            <span>{getTaskKindLabel(currentTask)}</span>
            <span>{getSourceLabel(currentTask)}</span>
          </div>
          <p className="trainer-question-text">{currentTask.question}</p>

          <TrainerQuestion
            answer={currentAnswer}
            onAnswer={(value) => setAnswers((prev) => ({ ...prev, [currentTask.id]: value }))}
            task={currentTask}
          />

          <div className="trainer-question-actions">
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} type="button">
              Назад
            </button>
            <button
              disabled={!isAnswerComplete(currentTask, currentAnswer)}
              onClick={() => {
                if (currentIndex === activeTasks.length - 1) {
                  setIsFinished(true);
                  return;
                }

                setCurrentIndex((index) => index + 1);
              }}
              type="button"
            >
              {currentIndex === activeTasks.length - 1 ? "Завершить" : "Дальше"}
            </button>
          </div>
        </article>
      </section>
    );
  }

  if (isFinished) {
    return (
      <section className="trainer-shell">
        <div className="trainer-result-card">
          <p>Результат</p>
          <h2>
            {correctCount} из {autoCheckedTasks.length}
          </h2>
          <span>
            Автоматически проверено: {autoCheckedTasks.length} из {activeTasks.length}. Правильных ответов:{" "}
            {autoCheckedTasks.length ? Math.round((correctCount / autoCheckedTasks.length) * 100) : 0}%
          </span>

          <div className="trainer-result-list">
            {activeTasks.map((task, index) => (
              <details key={task.id}>
                <summary>
                  {index + 1}. {task.title} —{" "}
                  {isImportedEgeTask(task) && !task.answer.autoCheck
                    ? "самопроверка"
                    : isCorrect(task, answers[task.id])
                      ? "верно"
                      : "ошибка"}
                </summary>
                <p>
                  <b>Правильный ответ:</b> {answerText(task)}
                </p>
                <p>{task.explanation}</p>
              </details>
            ))}
          </div>

          <button onClick={resetTraining} type="button">
            Выбрать другой режим
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="trainer-shell">
      <div className="trainer-head">
        <p>Тренажёр</p>
        <h2>Выберите формат тренировки</h2>
        <span>
          После выбора задания будут идти по одному. В конце появится результат: сколько ответов верные.
          {exam === "oge"
            ? " Для ОГЭ №1 уже подключены задания из PDF; автоматически проверяются выбранные понятия, а определение — для самопроверки."
            : " Для ЕГЭ подключён полный импорт из папки: №1–25. Задания с цифровым ключом проверяются автоматически, развёрнутые и графики — через самопроверку."}
        </span>
        {trainerError ? <span className="trainer-error">{trainerError}</span> : null}
      </div>

      <div className="trainer-mode-grid">
        <article className="trainer-mode-card">
          <h3>1. По темам</h3>
          <p>Выбираем тему и количество заданий, затем решаем их подряд.</p>
          <label>
            Тема
            <select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)}>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
          <label>
            Сколько заданий
            <select value={safeTopicCount} onChange={(event) => setCountByTopic(Number(event.target.value))}>
              {Array.from({ length: Math.max(selectedTopicTotal, 1) }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={isLoadingTasks}
            onClick={() => (exam === "ege" ? startEgeTraining("topic") : startTraining("topic", topicTasks.slice(0, safeTopicCount)))}
            type="button"
          >
            {isLoadingTasks ? "Загружаю..." : "Начать"}
          </button>
        </article>

        <article className="trainer-mode-card">
          <h3>2. По заданиям</h3>
          <p>Выбираем номер {examLabel} и тренируем только этот тип задания.</p>
          <label>
            Номер задания
            <select value={selectedNumber} onChange={(event) => setSelectedNumber(Number(event.target.value))}>
              {numbers.map((number) => (
                <option key={number} value={number}>
                  № {number}
                </option>
              ))}
            </select>
          </label>
          <label>
            Сколько заданий
            <select value={safeNumberCount} onChange={(event) => setCountByNumber(Number(event.target.value))}>
              {Array.from({ length: Math.max(selectedNumberTotal, 1) }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={isLoadingTasks}
            onClick={() =>
              exam === "ege" ? startEgeTraining("number") : startTraining("number", numberTasks.slice(0, safeNumberCount))
            }
            type="button"
          >
            {isLoadingTasks ? "Загружаю..." : "Начать"}
          </button>
        </article>

        <article className="trainer-mode-card">
          <h3>3. Целый вариант</h3>
          <p>Собирается случайный вариант: по одному заданию каждого номера.</p>
          <div className="trainer-variant-count">
            Сейчас в варианте будет заданий: <b>{numbers.length}</b>
          </div>
          <button
            disabled={isLoadingTasks}
            onClick={() => (exam === "ege" ? startEgeTraining("variant") : startTraining("variant", buildVariant(tasks, numbers)))}
            type="button"
          >
            {isLoadingTasks ? "Загружаю..." : "Сгенерировать вариант"}
          </button>
        </article>
      </div>
    </section>
  );
}
