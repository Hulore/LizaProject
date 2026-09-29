import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth";
import { getTaskRecords, type ManagedTask, type TaskStatus } from "@/lib/task-bank";
import { getPostgresPool } from "@/lib/postgres";

export async function GET(request: Request) {
  if (!await getTeacherSession()) return NextResponse.json({ error: "Нужен вход учителя." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  let records = await getTaskRecords();
  const id = params.get("id");
  if (id) return NextResponse.json({ record: records.find(record => record.task.id === id) ?? null });
  const q = (params.get("q") ?? "").toLocaleLowerCase("ru");
  const exam = params.get("exam");
  const number = params.get("number");
  const status = params.get("status") ?? "active";
  records = records.filter(({ task, status: state }) =>
    (!exam || task.exam === exam) && (!number || task.number === Number(number)) &&
    (status === "all" || (status === "active" ? state !== "archived" : state === status)) &&
    (!q || [task.id, task.sourceId, task.title, task.topic, task.question, task.taskKind==='oge_terms_definition' ? task.terms.join(' ') : task.prompt].join(" ").toLocaleLowerCase("ru").includes(q)),
  ).sort((a,b)=>a.task.exam.localeCompare(b.task.exam) || a.task.number-b.task.number || a.task.id.localeCompare(b.task.id));
  const page = Math.max(1, Number(params.get("page")) || 1);
  return NextResponse.json({ total: records.length, records: records.slice((page-1)*30,page*30), page });
}

function validate(task: ManagedTask) {
  if (!task || task.subject !== "social_studies" || !["ege", "oge"].includes(task.exam)) return "Выберите экзамен.";
  if (!Number.isInteger(task.number) || task.number < 1 || task.number > (task.exam === "ege" ? 25 : 24)) return "Неверный номер задания.";
  if (![1,2].includes(task.part)) return "Неверная часть экзамена.";
  for (const value of [task.title, task.topic, task.question, task.explanation, task.sourceId, task.source?.name, task.source?.file]) {
    if (typeof value !== "string" || value.length > 100000) return "Проверьте текстовые поля.";
  }
  if (!task.title.trim() || !task.topic.trim() || !task.question.trim()) return "Укажите название, тему и условие.";
  if (!task.answer || typeof task.source.sourceId !== 'string') return "Проверьте ответ и источник.";
  if (task.taskKind === "oge_terms_definition") {
    if (task.exam !== "oge" || task.number !== 1 || task.part !== 1) return "Выбор понятий ОГЭ поддерживается для №1.";
    if (!Array.isArray(task.terms) || task.terms.length < 2 || !task.terms.every(v=>typeof v==='string' && v.trim())) return "Укажите варианты понятий.";
    if (!Array.isArray(task.answer?.concepts) || task.answer.concepts.length !== 2 || !task.answer.concepts.every(v=>typeof v==='string' && task.terms.some(t=>t.toLowerCase()===v.toLowerCase())) || new Set(task.answer.concepts.map(v=>v.toLowerCase())).size!==2) return "Ответ должен содержать два разных понятия из вариантов.";
    if (typeof task.instruction!=='string' || typeof task.codifier!=='string' || !Number.isInteger(task.page) || task.page<1) return "Проверьте инструкцию и страницу источника.";
  } else {
    if (task.exam !== "ege" || !["ege_imported_text_answer", "ege_imported_free_answer"].includes(task.taskKind)) return "Неверный формат задания.";
    if (typeof task.prompt !== "string" || !Array.isArray(task.answer?.value) || !task.answer.value.every(v=>typeof v==='string')) return "Проверьте условие и ответы.";
    if (typeof task.taskKindLabel!=='string' || typeof task.answer.autoCheck!=='boolean' || typeof task.answer.orderMatters!=='boolean' || (task.images !== undefined && !Array.isArray(task.images))) return "Проверьте формат ответа и изображения.";
    if (task.answer.autoCheck && !task.answer.value.some(v=>v.trim())) return "Для автоматической проверки нужен правильный ответ.";
    if ((task.images ?? []).some(url=>typeof url!=='string' || !/^\/(?!\/)[^\s]+$/.test(url))) return "Картинки должны иметь путь внутри сайта, например /imported/image.png.";
  }
  return null;
}

export async function POST(request: Request) {
  const teacher = await getTeacherSession();
  if (!teacher) return NextResponse.json({ error: "Нужен вход учителя." }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({error:"Неверные данные."},{status:400}); }
  if (!body || typeof body!=='object') return NextResponse.json({error:"Неверные данные."},{status:400});
  const task = body.task as ManagedTask;
  const error = validate(task);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const status = body.status as TaskStatus;
  if (!["published", "draft", "archived"].includes(status)) return NextResponse.json({error:"Неверный статус."},{status:400});
  const existing = body.isNew ? null : (await getTaskRecords()).find(record=>record.task.id===task.id);
  if (!body.isNew && !existing) return NextResponse.json({error:"Задание не найдено."},{status:404});
  if (body.isNew) task.id = `teacher-${randomUUID()}`;
  const client = await getPostgresPool().connect();
  try {
    await client.query("begin");
    if (!body.isNew) {
      // Serialize edits, including the first override of an imported task.
      await client.query("select pg_advisory_xact_lock(hashtext($1))", [task.id]);
      const current = await client.query("select revision from public.task_overrides where id=$1", [task.id]);
      if ((current.rows[0]?.revision ?? 0) !== body.revision) {
        await client.query("rollback");
        return NextResponse.json({error:"Задание уже изменено в другой вкладке. Откройте его заново."},{status:409});
      }
      await client.query("insert into public.task_change_history(task_id,data,status,revision,changed_by) values($1,$2,$3,$4,$5)", [task.id, JSON.stringify(existing!.task), existing!.status, body.revision, teacher.login]);
    }
    const revision = (existing?.revision ?? 0) + 1;
    await client.query("insert into public.task_overrides(id,data,status,revision,updated_by) values($1,$2,$3,$4,$5) on conflict(id) do update set data=excluded.data,status=excluded.status,revision=excluded.revision,updated_by=excluded.updated_by,updated_at=now()", [task.id,JSON.stringify(task),status,revision,teacher.login]);
    await client.query("commit");
    return NextResponse.json({record:{task,status,revision}});
  } catch (error) { await client.query("rollback"); throw error; }
  finally { client.release(); }
}
