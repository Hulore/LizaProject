"use client";

import { useMemo, useState } from "react";
import {
  socialStudiesNumbers,
  socialStudiesTaskKindLabels,
  socialStudiesTasks,
  socialStudiesTopics,
  type SocialStudiesTask,
} from "@/data/social-studies-tasks";
import type { Exam } from "@/data/subjects";

type TrainerMode = "topic" | "number" | "variant";
type AnswerMap = Record<string, string[]>;

function shuffleTasks<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function isCorrect(task: SocialStudiesTask, answer: string[] | undefined) {
  if (!answer || answer.length === 0) {
    return false;
  }

  if (task.answer.orderMatters) {
    return task.answer.value.join("|") === answer.join("|");
  }

  return [...task.answer.value].sort().join("|") === [...answer].sort().join("|");
}

function answerText(task: SocialStudiesTask) {
  return task.answer.value.join(task.answer.orderMatters ? "" : ", ");
}

function isAnswerComplete(task: SocialStudiesTask, answer: string[]) {
  if (task.answer.orderMatters) {
    return answer.filter(Boolean).length === task.answer.value.length;
  }

  return answer.length >= task.answer.min && answer.length <= task.answer.max;
}

function buildVariant() {
  return socialStudiesNumbers
    .map((number) => {
      const tasksByNumber = socialStudiesTasks.filter((task) => task.number === number);

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
  task: SocialStudiesTask;
}) {
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
  const [mode, setMode] = useState<TrainerMode | null>(null);
  const [selectedTopic, setSelectedTopic] = useState(socialStudiesTopics[0]);
  const [selectedNumber, setSelectedNumber] = useState(socialStudiesNumbers[0]);
  const [countByTopic, setCountByTopic] = useState(3);
  const [countByNumber, setCountByNumber] = useState(3);
  const [activeTasks, setActiveTasks] = useState<SocialStudiesTask[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [isFinished, setIsFinished] = useState(false);

  const topicTasks = useMemo(
    () => socialStudiesTasks.filter((task) => task.topic === selectedTopic),
    [selectedTopic],
  );
  const numberTasks = useMemo(
    () => socialStudiesTasks.filter((task) => task.number === selectedNumber),
    [selectedNumber],
  );

  const currentTask = activeTasks[currentIndex];
  const currentAnswer = currentTask ? answers[currentTask.id] ?? [] : [];
  const correctCount = activeTasks.filter((task) => isCorrect(task, answers[task.id])).length;
  const safeTopicCount = Math.min(countByTopic, Math.max(topicTasks.length, 1));
  const safeNumberCount = Math.min(countByNumber, Math.max(numberTasks.length, 1));

  function startTraining(nextMode: TrainerMode, tasks: SocialStudiesTask[]) {
    setMode(nextMode);
    setActiveTasks(tasks);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
  }

  function resetTraining() {
    setMode(null);
    setActiveTasks([]);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
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
            <span>{socialStudiesTaskKindLabels[currentTask.taskKind]}</span>
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
            {correctCount} из {activeTasks.length}
          </h2>
          <span>
            Правильных ответов: {activeTasks.length ? Math.round((correctCount / activeTasks.length) * 100) : 0}%
          </span>

          <div className="trainer-result-list">
            {activeTasks.map((task, index) => (
              <details key={task.id}>
                <summary>
                  {index + 1}. {task.title} — {isCorrect(task, answers[task.id]) ? "верно" : "ошибка"}
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
          {exam === "oge" ? " Пока ОГЭ работает на демо-базе, отдельные задания ОГЭ добавим позже." : ""}
        </span>
      </div>

      <div className="trainer-mode-grid">
        <article className="trainer-mode-card">
          <h3>1. По темам</h3>
          <p>Выбираем тему и количество заданий, затем решаем их подряд.</p>
          <label>
            Тема
            <select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value as typeof selectedTopic)}>
              {socialStudiesTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
          <label>
            Сколько заданий
            <select value={safeTopicCount} onChange={(event) => setCountByTopic(Number(event.target.value))}>
              {Array.from({ length: Math.max(topicTasks.length, 1) }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => startTraining("topic", topicTasks.slice(0, safeTopicCount))} type="button">
            Начать
          </button>
        </article>

        <article className="trainer-mode-card">
          <h3>2. По заданиям</h3>
          <p>Выбираем номер {examLabel} и тренируем только этот тип задания.</p>
          <label>
            Номер задания
            <select value={selectedNumber} onChange={(event) => setSelectedNumber(Number(event.target.value))}>
              {socialStudiesNumbers.map((number) => (
                <option key={number} value={number}>
                  № {number}
                </option>
              ))}
            </select>
          </label>
          <label>
            Сколько заданий
            <select value={safeNumberCount} onChange={(event) => setCountByNumber(Number(event.target.value))}>
              {Array.from({ length: Math.max(numberTasks.length, 1) }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => startTraining("number", numberTasks.slice(0, safeNumberCount))} type="button">
            Начать
          </button>
        </article>

        <article className="trainer-mode-card">
          <h3>3. Целый вариант</h3>
          <p>Собирается случайный вариант: по одному заданию каждого номера.</p>
          <div className="trainer-variant-count">
            Сейчас в варианте будет заданий: <b>{socialStudiesNumbers.length}</b>
          </div>
          <button onClick={() => startTraining("variant", buildVariant())} type="button">
            Сгенерировать вариант
          </button>
        </article>
      </div>
    </section>
  );
}
