import Image from "next/image";
import {
  egeImportedSocialStudiesNumbers,
  egeImportedSocialStudiesMeta,
  egeImportedSocialStudiesTopics,
} from "@/data/social-studies-ege-imported-meta";
import {
  egeImportedSocialStudiesTasks,
  type EgeImportedSocialStudiesTask,
} from "@/data/social-studies-ege-imported-tasks";

type CatalogView = "types" | "topics";

function getTaskKind(value: string | undefined) {
  return value === "ege_imported_text_answer" || value === "ege_imported_free_answer" ? value : "";
}

function getTopic(value: string | undefined) {
  return value && egeImportedSocialStudiesTopics.includes(value) ? value : "";
}

function getNumber(value: string | undefined) {
  const parsed = Number(value);

  return egeImportedSocialStudiesNumbers.includes(parsed) ? parsed : 0;
}

function getCatalogView(value: string | undefined): CatalogView {
  return value === "topics" ? "topics" : "types";
}

function getAnswerText(task: EgeImportedSocialStudiesTask) {
  return task.answer.autoCheck ? task.answer.value.join(" или ") : "автоматического ответа нет — смотри пояснение/критерии";
}

function getTaskHref(params: { number?: number; topic?: string; taskKind?: string }) {
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

function TaskContent({ task }: { task: EgeImportedSocialStudiesTask }) {
  return (
    <div className="trainer-imported-prompt">
      {!task.images?.length
        ? task.prompt
            .split("\n")
            .map((line, index) =>
              line.trim() ? <p key={`${task.id}-${index}`}>{line}</p> : <br key={`${task.id}-${index}`} />,
            )
        : null}
      {task.images?.length ? (
        <div className="trainer-task-images">
          {task.images.map((image) => (
            <Image alt={`Изображение задания №${task.sourceId}`} height={1400} key={image} src={image} width={1100} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NumberCatalog() {
  return (
    <div className="catalog-table" aria-label="Каталог заданий по номерам ЕГЭ">
      {egeImportedSocialStudiesNumbers.map((number) => {
        const numberTasksCount = egeImportedSocialStudiesMeta.countsByNumber[String(number) as keyof typeof egeImportedSocialStudiesMeta.countsByNumber] ?? 0;
        const numberTitle =
          egeImportedSocialStudiesMeta.titlesByNumber[String(number) as keyof typeof egeImportedSocialStudiesMeta.titlesByNumber] ??
          "Задания ЕГЭ по обществознанию";
        const kinds =
          egeImportedSocialStudiesMeta.countsByNumberAndKind[
            String(number) as keyof typeof egeImportedSocialStudiesMeta.countsByNumberAndKind
          ] ?? {};

        return (
          <div className="catalog-section" key={number}>
            <div className="catalog-main-row">
              <div>
                <span className="catalog-type-badge">Т</span>
                <a href={getTaskHref({ number })}>
                  {number}. {numberTitle}
                </a>
              </div>
              <strong>{numberTasksCount}</strong>
              <a className="catalog-go-link" href={getTaskHref({ number })}>
                Перейти
              </a>
            </div>

            {Object.entries(kinds).map(([kind, count]) => (
              <div className="catalog-sub-row" key={kind}>
                <a href={getTaskHref({ number })}>{kind}</a>
                <span>{count}</span>
                <a className="catalog-go-link" href={getTaskHref({ number })}>
                  Перейти
                </a>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function TopicCatalog() {
  return (
    <div className="catalog-table" aria-label="Каталог заданий по темам">
      {egeImportedSocialStudiesTopics.map((topic, index) => {
        const topicTasksCount = egeImportedSocialStudiesMeta.countsByTopic[topic as keyof typeof egeImportedSocialStudiesMeta.countsByTopic] ?? 0;
        const topicTasks = egeImportedSocialStudiesTasks.filter((task) => task.topic === topic);
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
              <strong>{topicTasksCount}</strong>
              <a className="catalog-go-link" href={getTaskHref({ topic })}>
                Перейти
              </a>
            </div>

            {numbers.map((number) => {
              const count = topicTasks.filter((task) => task.number === number).length;

              return (
                <div className="catalog-sub-row" key={number}>
                  <a href={getTaskHref({ topic, number })}>Задание № {number}</a>
                  <span>{count}</span>
                  <a className="catalog-go-link" href={getTaskHref({ topic, number })}>
                    Перейти
                  </a>
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

  const visibleTasks = egeImportedSocialStudiesTasks.filter((task) => {
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
          <strong>{egeImportedSocialStudiesMeta.total}</strong>
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
              {egeImportedSocialStudiesNumbers.map((item) => (
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
              {egeImportedSocialStudiesTopics.map((item) => (
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
              <option value="ege_imported_text_answer">Ответ цифрами</option>
              <option value="ege_imported_free_answer">Свободный ответ</option>
            </select>
          </label>

          <button type="submit">Найти</button>
          <a href="/social-studies/ege#tasks">Сбросить</a>
        </div>
      </form>

      <div className="task-results" id="tasks">
        {visibleTasks.slice(0, 50).map((task) => (
          <article key={task.id} className="task-row-card">
            <div className="task-row-info">
              <span>Номер источника: {task.sourceId}</span>
              <span>ЕГЭ №{task.number}</span>
              <span>{task.topic}</span>
              <span>{task.taskKindLabel}</span>
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
              Источник: {task.source.name}, № {task.source.sourceId}. Файл импорта: {task.source.file}.
            </p>
          </article>
        ))}
        {visibleTasks.length > 50 ? (
          <p className="task-source">Показаны первые 50 заданий из {visibleTasks.length}. Чтобы сузить список, выбери номер или тему выше.</p>
        ) : null}
      </div>
    </section>
  );
}
