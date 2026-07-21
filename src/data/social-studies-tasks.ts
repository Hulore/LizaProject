export type SocialStudiesTaskKind = "social_choose_exactly_2" | "social_choose_2_to_4" | "social_matching";

export type SocialStudiesTopic =
  | "Политика"
  | "Право"
  | "Социальные отношения"
  | "Человек и общество"
  | "Экономика";

type TaskSource = {
  type: "prototype";
  name: string;
  catalogBasis: string;
  catalogUrl: string;
};

type Option = {
  id: string;
  text: string;
};

type ChoiceAnswer = {
  value: string[];
  min: number;
  max: number;
  orderMatters: false;
};

type MatchingAnswer = {
  value: string[];
  orderMatters: true;
};

type ChoiceContent = {
  options: Option[];
};

type MatchingContent = {
  leftColumn: Option[];
  rightColumn: Option[];
};

type BaseSocialStudiesTask = {
  id: string;
  subject: "social_studies";
  exam: "ege";
  part: 1;
  number: number;
  topic: SocialStudiesTopic;
  taskKind: SocialStudiesTaskKind;
  title: string;
  question: string;
  explanation: string;
  difficulty: "easy" | "medium";
  source: TaskSource;
};

export type SocialStudiesChoiceTask = BaseSocialStudiesTask & {
  taskKind: "social_choose_exactly_2" | "social_choose_2_to_4";
  content: ChoiceContent;
  answer: ChoiceAnswer;
};

export type SocialStudiesMatchingTask = BaseSocialStudiesTask & {
  taskKind: "social_matching";
  content: MatchingContent;
  answer: MatchingAnswer;
};

export type SocialStudiesTask = SocialStudiesChoiceTask | SocialStudiesMatchingTask;

const prototypeSource: TaskSource = {
  type: "prototype",
  name: "Собственное тестовое задание для разработки",
  catalogBasis: "Структура каталога ЕГЭ по обществознанию",
  catalogUrl: "https://soc-ege.sdamgia.ru/prob_catalog",
};

export const socialStudiesTaskKindLabels: Record<SocialStudiesTaskKind, string> = {
  social_choose_exactly_2: "Выбрать ровно 2 номера",
  social_choose_2_to_4: "Выбрать от 2 до 4 номеров",
  social_matching: "Соотношение",
};

export const socialStudiesTasks: SocialStudiesTask[] = [
  {
    id: "social-ege-01-politics-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 1,
    topic: "Политика",
    taskKind: "social_choose_exactly_2",
    title: "Признаки государства",
    question: "Выберите два признака государства как политического института.",
    content: {
      options: [
        { id: "1", text: "Наличие публичной власти" },
        { id: "2", text: "Обязательное участие граждан в предпринимательстве" },
        { id: "3", text: "Суверенитет" },
        { id: "4", text: "Отсутствие правовых норм" },
        { id: "5", text: "Полное равенство всех доходов населения" },
        { id: "6", text: "Запрет любых общественных объединений" },
      ],
    },
    answer: { value: ["1", "3"], min: 2, max: 2, orderMatters: false },
    explanation: "Государство характеризуется публичной властью и суверенитетом. Остальные варианты не являются обязательными признаками государства.",
    difficulty: "easy",
    source: prototypeSource,
  },
  {
    id: "social-ege-01-law-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 1,
    topic: "Право",
    taskKind: "social_choose_exactly_2",
    title: "Признаки права",
    question: "Выберите два признака права.",
    content: {
      options: [
        { id: "1", text: "Общеобязательность" },
        { id: "2", text: "Устная форма существования всех норм" },
        { id: "3", text: "Охрана силой государства" },
        { id: "4", text: "Полная независимость от государства" },
        { id: "5", text: "Регулирование только семейных отношений" },
        { id: "6", text: "Отсутствие формальной определённости" },
      ],
    },
    answer: { value: ["1", "3"], min: 2, max: 2, orderMatters: false },
    explanation: "Право общеобязательно и обеспечивается государственным принуждением.",
    difficulty: "easy",
    source: prototypeSource,
  },
  {
    id: "social-ege-01-economy-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 1,
    topic: "Экономика",
    taskKind: "social_choose_exactly_2",
    title: "Факторы производства",
    question: "Выберите два фактора производства.",
    content: {
      options: [
        { id: "1", text: "Труд" },
        { id: "2", text: "Темперамент" },
        { id: "3", text: "Капитал" },
        { id: "4", text: "Дружба" },
        { id: "5", text: "Настроение потребителя" },
        { id: "6", text: "Цвет упаковки товара" },
      ],
    },
    answer: { value: ["1", "3"], min: 2, max: 2, orderMatters: false },
    explanation: "К базовым факторам производства относят труд, землю, капитал и предпринимательские способности.",
    difficulty: "easy",
    source: prototypeSource,
  },
  {
    id: "social-ege-02-human-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 2,
    topic: "Человек и общество",
    taskKind: "social_choose_2_to_4",
    title: "Деятельность человека",
    question: "Выберите верные суждения о деятельности человека.",
    content: {
      options: [
        { id: "1", text: "Деятельность обычно имеет осознанную цель." },
        { id: "2", text: "К видам деятельности относят игру, учение и труд." },
        { id: "3", text: "Деятельность всегда происходит без использования средств." },
        { id: "4", text: "Мотив может побуждать человека к деятельности." },
        { id: "5", text: "Результат деятельности всегда совпадает с её мотивом." },
        { id: "6", text: "Деятельность невозможна в обществе." },
      ],
    },
    answer: { value: ["1", "2", "4"], min: 2, max: 4, orderMatters: false },
    explanation: "Верны 1, 2 и 4: деятельность целенаправленна, имеет мотивы и включает разные виды.",
    difficulty: "medium",
    source: prototypeSource,
  },
  {
    id: "social-ege-02-relations-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 2,
    topic: "Социальные отношения",
    taskKind: "social_choose_2_to_4",
    title: "Социальная стратификация",
    question: "Выберите верные суждения о социальной стратификации.",
    content: {
      options: [
        { id: "1", text: "Стратификация отражает деление общества на социальные слои." },
        { id: "2", text: "Доход может быть критерием социальной стратификации." },
        { id: "3", text: "Социальная стратификация исключает различия в образовании." },
        { id: "4", text: "Власть может влиять на положение человека в обществе." },
        { id: "5", text: "Стратификация существует только в первобытном обществе." },
        { id: "6", text: "Престиж профессии не связан с социальным статусом." },
      ],
    },
    answer: { value: ["1", "2", "4"], min: 2, max: 4, orderMatters: false },
    explanation: "Стратификацию описывают через доход, власть, образование, престиж и другие социальные критерии.",
    difficulty: "medium",
    source: prototypeSource,
  },
  {
    id: "social-ege-02-economy-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 2,
    topic: "Экономика",
    taskKind: "social_choose_2_to_4",
    title: "Рыночная экономика",
    question: "Выберите верные суждения о рыночной экономике.",
    content: {
      options: [
        { id: "1", text: "Конкуренция является одним из признаков рынка." },
        { id: "2", text: "Спрос показывает готовность и возможность купить товар." },
        { id: "3", text: "Рыночная цена может изменяться под влиянием спроса и предложения." },
        { id: "4", text: "В рыночной экономике полностью отсутствует частная собственность." },
        { id: "5", text: "Производитель не может выбирать объём выпуска." },
        { id: "6", text: "Государство никогда не участвует в экономике смешанного типа." },
      ],
    },
    answer: { value: ["1", "2", "3"], min: 2, max: 4, orderMatters: false },
    explanation: "Конкуренция, спрос и взаимодействие спроса с предложением — важные элементы рыночной экономики.",
    difficulty: "medium",
    source: prototypeSource,
  },
  {
    id: "social-ege-03-politics-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 3,
    topic: "Политика",
    taskKind: "social_matching",
    title: "Формы государства",
    question: "Установите соответствие между характеристиками и формами государства.",
    content: {
      leftColumn: [
        { id: "A", text: "Верховная власть передаётся по наследству" },
        { id: "B", text: "Глава государства избирается на определённый срок" },
        { id: "C", text: "Субъекты обладают признаками политической самостоятельности" },
      ],
      rightColumn: [
        { id: "1", text: "Республика" },
        { id: "2", text: "Монархия" },
        { id: "3", text: "Федерация" },
        { id: "4", text: "Унитарное государство" },
      ],
    },
    answer: { value: ["2", "1", "3"], orderMatters: true },
    explanation: "A — монархия, B — республика, C — федерация. Ответ записывается по порядку левого столбца.",
    difficulty: "medium",
    source: prototypeSource,
  },
  {
    id: "social-ege-03-law-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 3,
    topic: "Право",
    taskKind: "social_matching",
    title: "Отрасли права",
    question: "Установите соответствие между ситуациями и отраслями права.",
    content: {
      leftColumn: [
        { id: "A", text: "Заключение брака" },
        { id: "B", text: "Кража чужого имущества" },
        { id: "C", text: "Покупка квартиры по договору" },
      ],
      rightColumn: [
        { id: "1", text: "Гражданское право" },
        { id: "2", text: "Семейное право" },
        { id: "3", text: "Уголовное право" },
        { id: "4", text: "Финансовое право" },
      ],
    },
    answer: { value: ["2", "3", "1"], orderMatters: true },
    explanation: "Брак регулирует семейное право, преступление — уголовное, имущественный договор — гражданское.",
    difficulty: "medium",
    source: prototypeSource,
  },
  {
    id: "social-ege-03-human-001",
    subject: "social_studies",
    exam: "ege",
    part: 1,
    number: 3,
    topic: "Человек и общество",
    taskKind: "social_matching",
    title: "Формы познания",
    question: "Установите соответствие между признаками и формами познания.",
    content: {
      leftColumn: [
        { id: "A", text: "Опора на художественный образ" },
        { id: "B", text: "Стремление к объективности и доказательности" },
        { id: "C", text: "Формирование в повседневном опыте" },
      ],
      rightColumn: [
        { id: "1", text: "Научное познание" },
        { id: "2", text: "Обыденное познание" },
        { id: "3", text: "Художественное познание" },
        { id: "4", text: "Мифологическое познание" },
      ],
    },
    answer: { value: ["3", "1", "2"], orderMatters: true },
    explanation: "Художественный образ связан с искусством, доказательность — с наукой, повседневный опыт — с обыденным познанием.",
    difficulty: "medium",
    source: prototypeSource,
  },
];

export const socialStudiesTopics = Array.from(new Set(socialStudiesTasks.map((task) => task.topic)));
export const socialStudiesNumbers = Array.from(new Set(socialStudiesTasks.map((task) => task.number))).sort((a, b) => a - b);
