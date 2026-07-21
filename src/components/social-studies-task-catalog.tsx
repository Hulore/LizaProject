import {
  socialStudiesNumbers,
  socialStudiesTaskKindLabels,
  socialStudiesTasks,
  socialStudiesTopics,
  type SocialStudiesTask,
  type SocialStudiesTaskKind,
  type SocialStudiesTopic,
} from "@/data/social-studies-tasks";

function getTaskKind(value: string | undefined) {
  return value && value in socialStudiesTaskKindLabels ? (value as SocialStudiesTaskKind) : "";
}

function getTopic(value: string | undefined) {
  return socialStudiesTopics.includes(value as SocialStudiesTopic) ? (value as SocialStudiesTopic) : "";
}

function getNumber(value: string | undefined) {
  const parsed = Number(value);

  return socialStudiesNumbers.includes(parsed) ? parsed : 0;
}

function getAnswerText(task: SocialStudiesTask) {
  return task.answer.value.join(task.answer.orderMatters ? "" : ", ");
}

function TaskContent({ task }: { task: SocialStudiesTask }) {
  if (task.taskKind === "social_matching") {
    return (
      <div className="task-matching-grid">
        <div>
          <h3>Левый столбец</h3>
          {task.content.leftColumn.map((item) => (
            <p key={item.id}>
              <span>{item.id}</span> {item.text}
            </p>
          ))}
        </div>

        <div>
          <h3>Правый столбец</h3>
          {task.content.rightColumn.map((item) => (
            <p key={item.id}>
              <span>{item.id}</span> {item.text}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ol className="task-options">
      {task.content.options.map((option) => (
        <li key={option.id}>
          <span>{option.id}</span> {option.text}
        </li>
      ))}
    </ol>
  );
}

export function SocialStudiesTaskCatalog({
  number,
  taskKind,
  topic,
}: {
  number?: string;
  taskKind?: string;
  topic?: string;
}) {
  const selectedNumber = getNumber(number);
  const selectedTopic = getTopic(topic);
  const selectedTaskKind = getTaskKind(taskKind);

  const visibleTasks = socialStudiesTasks.filter((task) => {
    if (selectedNumber && task.number !== selectedNumber) {
      return false;
    }

    if (selectedTopic && task.topic !== selectedTopic) {
      return false;
    }

    if (selectedTaskKind && task.taskKind !== selectedTaskKind) {
      return false;
    }

    return true;
  });

  return (
    <section className="social-task-shell">
      <div className="social-task-intro">
        <p>Тестовая база заданий</p>
        <h2>Обществознание: первая часть</h2>
        <span>
          Это собственные прототипные задания для проверки структуры сайта. Каталог построен по логике номеров и тем ЕГЭ,
          источник классификации указан в карточках.
        </span>
      </div>

      <form action="/social-studies/ege" className="social-task-filters" method="get">
        <label>
          <span>Номер ЕГЭ</span>
          <select name="number" defaultValue={selectedNumber || ""}>
            <option value="">Все номера</option>
            {socialStudiesNumbers.map((item) => (
              <option key={item} value={item}>
                № {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Тема</span>
          <select name="topic" defaultValue={selectedTopic}>
            <option value="">Все темы</option>
            {socialStudiesTopics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Тип ответа</span>
          <select name="taskKind" defaultValue={selectedTaskKind}>
            <option value="">Все типы</option>
            {Object.entries(socialStudiesTaskKindLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Показать</button>
        <a href="/social-studies/ege">Сбросить</a>
      </form>

      <p className="social-task-summary">
        Показано заданий: {visibleTasks.length} из {socialStudiesTasks.length}
      </p>

      <div className="social-task-list">
        {visibleTasks.map((task) => (
          <article key={task.id} className="social-task-card">
            <div className="social-task-meta">
              <span>ЕГЭ №{task.number}</span>
              <span>{task.topic}</span>
              <span>{socialStudiesTaskKindLabels[task.taskKind]}</span>
            </div>

            <h2>{task.title}</h2>
            <p className="social-task-question">{task.question}</p>

            <TaskContent task={task} />

            <details className="social-task-answer">
              <summary>Показать ответ и пояснение</summary>
              <p>
                <span>Ответ:</span> {getAnswerText(task)}
              </p>
              <p>{task.explanation}</p>
            </details>

            <div className="social-task-source">
              <span>Источник текста: {task.source.name}</span>
              <a href={task.source.catalogUrl} target="_blank" rel="noreferrer">
                {task.source.catalogBasis}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
