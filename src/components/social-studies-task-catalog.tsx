import {
  socialStudiesNumbers,
  socialStudiesTaskKindLabels,
  socialStudiesTasks,
  socialStudiesTopics,
  type SocialStudiesTask,
  type SocialStudiesTaskKind,
  type SocialStudiesTopic,
} from "@/data/social-studies-tasks";

type CatalogView = "types" | "topics";

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

function getCatalogView(value: string | undefined): CatalogView {
  return value === "topics" ? "topics" : "types";
}

function getAnswerText(task: SocialStudiesTask) {
  return task.answer.value.join(task.answer.orderMatters ? "" : ", ");
}

function getTaskHref(params: { number?: number; topic?: SocialStudiesTopic; taskKind?: SocialStudiesTaskKind }) {
  const searchParams = new URLSearchParams();

  if (params.number) {
    searchParams.set("number", String(params.number));
  }

  if (params.topic) {
    searchParams.set("topic", params.topic);
  }

  if (params.taskKind) {
    searchParams.set("taskKind", params.taskKind);
  }

  const query = searchParams.toString();

  return query ? `/social-studies/ege?${query}#tasks` : "/social-studies/ege#tasks";
}

function TaskContent({ task }: { task: SocialStudiesTask }) {
  if (task.taskKind === "social_matching") {
    return (
      <div className="task-matching-grid">
        <div>
          <h4>Левый столбец</h4>
          {task.content.leftColumn.map((item) => (
            <p key={item.id}>
              <span>{item.id}</span> {item.text}
            </p>
          ))}
        </div>

        <div>
          <h4>Правый столбец</h4>
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
          <span>{option.id})</span> {option.text}
        </li>
      ))}
    </ol>
  );
}

function NumberCatalog() {
  return (
    <div className="catalog-table" aria-label="Каталог заданий по номерам ЕГЭ">
      {socialStudiesNumbers.map((number) => {
        const numberTasks = socialStudiesTasks.filter((task) => task.number === number);
        const kinds = Array.from(new Set(numberTasks.map((task) => task.taskKind)));

        return (
          <div className="catalog-section" key={number}>
            <div className="catalog-main-row">
              <div>
                <span className="catalog-type-badge">Т</span>
                <a href={getTaskHref({ number })}>№ {number}. Задания ЕГЭ по обществознанию</a>
              </div>
              <strong>{numberTasks.length}</strong>
            </div>

            {kinds.map((kind) => {
              const count = numberTasks.filter((task) => task.taskKind === kind).length;

              return (
                <div className="catalog-sub-row" key={kind}>
                  <a href={getTaskHref({ number, taskKind: kind })}>{socialStudiesTaskKindLabels[kind]}</a>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TopicCatalog() {
  return (
    <div className="catalog-table" aria-label="Каталог заданий по темам">
      {socialStudiesTopics.map((topic, index) => {
        const topicTasks = socialStudiesTasks.filter((task) => task.topic === topic);
        const numbers = Array.from(new Set(topicTasks.map((task) => task.number))).sort((a, b) => a - b);

        return (
          <div className="catalog-section" key={topic}>
            <div className="catalog-main-row">
              <div>
                <span className="catalog-type-badge">Т</span>
                <a href={getTaskHref({ topic })}>
                  {index + 1}. {topic}
                </a>
              </div>
              <strong>{topicTasks.length}</strong>
            </div>

            {numbers.map((number) => {
              const count = topicTasks.filter((task) => task.number === number).length;

              return (
                <div className="catalog-sub-row" key={number}>
                  <a href={getTaskHref({ topic, number })}>Задание № {number}</a>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function SocialStudiesTaskCatalog({
  catalogView,
  number,
  taskKind,
  topic,
}: {
  catalogView?: string;
  number?: string;
  taskKind?: string;
  topic?: string;
}) {
  const selectedNumber = getNumber(number);
  const selectedTopic = getTopic(topic);
  const selectedTaskKind = getTaskKind(taskKind);
  const selectedCatalogView = getCatalogView(catalogView);

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
      <div className="catalog-box">
        <div className="catalog-title-row">
          <h2>Каталог заданий</h2>
          <nav aria-label="Переключение каталога">
            <a className={selectedCatalogView === "types" ? "active" : ""} href="/social-studies/ege?catalogView=types">
              по типам
            </a>
            <a className={selectedCatalogView === "topics" ? "active" : ""} href="/social-studies/ege?catalogView=topics">
              по темам
            </a>
          </nav>
        </div>

        <div className="catalog-total-row">
          <span>Всего заданий в каталоге</span>
          <strong>{socialStudiesTasks.length}</strong>
        </div>

        {selectedCatalogView === "topics" ? <TopicCatalog /> : <NumberCatalog />}
      </div>

      <form action="/social-studies/ege#tasks" className="task-picker" method="get">
        <div className="task-picker-head">
          <span>Подбор заданий</span>
          <strong>{visibleTasks.length}</strong>
        </div>

        <div className="task-picker-fields">
          <label>
            Номер задания
            <select name="number" defaultValue={selectedNumber || ""}>
              <option value="">любой</option>
              {socialStudiesNumbers.map((item) => (
                <option key={item} value={item}>
                  № {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Тема
            <select name="topic" defaultValue={selectedTopic}>
              <option value="">любая</option>
              {socialStudiesTopics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Тип ответа
            <select name="taskKind" defaultValue={selectedTaskKind}>
              <option value="">любой</option>
              {Object.entries(socialStudiesTaskKindLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Найти</button>
          <a href="/social-studies/ege#tasks">Сбросить</a>
        </div>
      </form>

      <div className="task-results" id="tasks">
        {visibleTasks.map((task) => (
          <article key={task.id} className="task-row-card">
            <div className="task-row-info">
              <span>Номер: {task.id.replace("social-ege-", "").toUpperCase()}</span>
              <span>ЕГЭ №{task.number}</span>
              <span>{task.topic}</span>
              <span>{socialStudiesTaskKindLabels[task.taskKind]}</span>
            </div>

            <h3>{task.title}</h3>
            <p className="task-question">{task.question}</p>

            <TaskContent task={task} />

            <details className="task-answer">
              <summary>Показать ответ</summary>
              <p>
                <b>Ответ:</b> {getAnswerText(task)}
              </p>
              <p>{task.explanation}</p>
            </details>

            <p className="task-source">
              Источник текста: {task.source.name}. Основа классификации:{" "}
              <a href={task.source.catalogUrl} target="_blank" rel="noreferrer">
                {task.source.catalogBasis}
              </a>
              .
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
