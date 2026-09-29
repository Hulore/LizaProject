"use client";

import { useEffect, useState, useRef } from "react";
import type { ManagedTask, TaskRecord, TaskStatus } from "@/lib/task-bank";

const statusNames = { published: "Опубликовано", draft: "Черновик", archived: "Удалено" };
const lines = (text: FormDataEntryValue | null) => String(text ?? "").split("\n").map(s=>s.trim()).filter(Boolean);

function blankTask(exam: "ege" | "oge"): TaskRecord {
  const common = { id: "", subject: "social_studies" as const, sourceId: "", topic: "", title: "", question: "", explanation: "", part: 1 as const, number: 1 };
  const task: ManagedTask = exam === "ege" ? {
    ...common, exam, taskKind: "ege_imported_text_answer", taskKindLabel: "Ответ цифрами", prompt: "", images: [],
    answer: {value: [], orderMatters: false, orderConfigured: true, autoCheck: true}, source: {name:"Собственное задание",sourceId:"",file:""},
  } : {
    ...common, number: 1, exam, taskKind: "oge_terms_definition", terms: [], instruction: "Выпишите два понятия и раскройте смысл одного из них.", page: 1, codifier: "",
    answer: {concepts:[],maxScore:2,autoCheck:"concepts_only"}, source:{name:"Собственное задание",sourceId:"",file:"",page:1},
  };
  return {task, status:"draft",revision:0};
}

export function TaskManager() {
  const [q,setQ] = useState("");
  const [exam,setExam] = useState("");
  const [number,setNumber] = useState("");
  const [status,setStatus] = useState("active");
  const [page,setPage] = useState(1);
  const [records,setRecords] = useState<TaskRecord[]>([]);
  const [total,setTotal] = useState(0);
  const [editing,setEditing] = useState<TaskRecord | null>(null);
  const [version,setVersion] = useState(0);
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const imagePaths = useRef<HTMLTextAreaElement>(null);
  const [uploading,setUploading] = useState(false);
  const [confirmDelete,setConfirmDelete] = useState<string | null>(null);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);setError('');
    try {
      const form = new FormData();form.set('image',file);
      const result = await fetch('/api/teacher/task-images',{method:'POST',body:form});
      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? 'Не удалось загрузить картинку.');
      if (imagePaths.current) imagePaths.current.value = [imagePaths.current.value.trim(),data.url].filter(Boolean).join('\n');
    } catch(e) {setError(e instanceof Error ? e.message : 'Ошибка загрузки.');}
    finally {setUploading(false);}
  }

  useEffect(()=>{
    const controller = new AbortController();
    const timer = setTimeout(async()=>{
      setLoading(true);
      try {
        const params = new URLSearchParams({q,exam,number,status,page:String(page)});
        const result = await fetch(`/api/teacher/tasks?${params}`, {signal:controller.signal});
        const data = await result.json();
        if (!result.ok) throw new Error(data.error ?? "Не удалось загрузить задания.");
        setRecords(data.records); setTotal(data.total); setError("");
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Ошибка загрузки."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    },200);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[q,exam,number,status,page,version]);

  async function save(record: TaskRecord, isNew: boolean) {
    setBusy(true);setError("");setMessage("");
    try {
      const response = await fetch('/api/teacher/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...record,isNew})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Не удалось сохранить задание.");
      setEditing(null);setVersion(v=>v+1);setMessage(record.status === 'archived' ? 'Задание удалено из тренажёров. Его можно восстановить через фильтр «Удалённые».' : 'Задание сохранено.');
    } catch(e) {setError(e instanceof Error ? e.message : 'Ошибка сохранения.');}
    finally {setBusy(false);}
  }

  function submit(form: FormData) {
    if (!editing) return;
    const original = editing.task;
    const common = {
      ...original, title:String(form.get('title')), topic:String(form.get('topic')), number:Number(form.get('number')),
      part:Number(form.get('part')) as 1|2, question:String(form.get('question')), explanation:String(form.get('explanation')),
      sourceId:String(form.get('sourceId')), source:{...original.source,name:String(form.get('sourceName')),sourceId:String(form.get('sourceId')),file:String(form.get('sourceFile'))},
    };
    const task = original.taskKind === 'oge_terms_definition' ? {
      ...common, terms:lines(form.get('terms')), instruction:String(form.get('instruction')), codifier:String(form.get('codifier')), page:Number(form.get('page')),
      source:{...common.source,page:Number(form.get('page'))}, answer:{...original.answer,concepts:lines(form.get('answers'))},
    } : {
      ...common, prompt:String(form.get('prompt')), images:lines(form.get('images')), taskKind:String(form.get('taskKind')), taskKindLabel:String(form.get('taskKindLabel')),
      answer:{value:lines(form.get('answers')),autoCheck:form.get('autoCheck')==='on',orderMatters:form.get('orderMatters')==='on',orderConfigured:true},
    };
    void save({task:task as ManagedTask,status:form.get('status') as TaskStatus,revision:editing.revision},!original.id);
  }

  const task = editing?.task;
  return <>
    <p>Обществознание · ЕГЭ и ОГЭ. Изменения опубликованных заданий сразу доступны ученикам.</p>
    <div className="manager-toolbar">
      <button onClick={()=>{setEditing(blankTask('ege'));setError('');}}>+ Задание ЕГЭ</button>
      <button onClick={()=>{setEditing(blankTask('oge'));setError('');}}>+ Задание ОГЭ №1</button>
    </div>
    {message && <p role="status" className="auth-success">{message}</p>}
    {error && <p role="alert" className="auth-error">{error}</p>}
    {editing && task ? <section className="manager-editor" key={task.id || task.exam}>
      <h2>{task.id ? `Редактирование ${task.exam==='ege'?'ЕГЭ':'ОГЭ'} №${task.number}` : 'Новое задание'}</h2>
      <form onSubmit={event=>{event.preventDefault();submit(new FormData(event.currentTarget));}}>
        <div className="manager-fields">
          <label>Название<input name="title" defaultValue={task.title} required /></label>
          <label>Тема<input name="topic" defaultValue={task.topic} required /></label>
          <label>Номер задания<input name="number" type="number" min="1" max={task.exam==='ege'?25:1} defaultValue={task.number} required /></label>
          <label>Часть<select name="part" defaultValue={task.part}><option value="1">Первая</option>{task.exam==='ege' && <option value="2">Вторая</option>}</select></label>
          <label>Статус<select name="status" defaultValue={editing.status}>{Object.entries(statusNames).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        <label>Условие / вопрос<textarea name="question" defaultValue={task.question} rows={4} required /></label>
        {task.taskKind==='oge_terms_definition' ? <>
          <label>Понятия — каждое с новой строки<textarea name="terms" defaultValue={task.terms.join('\n')} rows={6} required /></label>
          <label>Инструкция<textarea name="instruction" defaultValue={task.instruction} rows={2} /></label>
          <label>Два правильных понятия — каждое с новой строки<textarea name="answers" defaultValue={task.answer.concepts.join('\n')} rows={2} required /></label>
          <div className="manager-fields"><label>Кодификатор<input name="codifier" defaultValue={task.codifier} /></label><label>Страница источника<input name="page" type="number" min="1" defaultValue={task.page} /></label></div>
        </> : <>
          <label>Текст задания, варианты ответа или таблица<textarea name="prompt" defaultValue={task.prompt} rows={12} /></label>
          <div className="manager-fields">
            <label>Формат ответа<select name="taskKind" defaultValue={task.taskKind}><option value="ege_imported_text_answer">Краткий ответ</option><option value="ege_imported_free_answer">Развёрнутый ответ</option></select></label>
            <label>Название типа задания<input name="taskKindLabel" defaultValue={task.taskKindLabel} /></label>
          </div>
          <label>Правильный ответ — допустимые альтернативы с новой строки<textarea name="answers" defaultValue={task.answer.value.join('\n')} rows={3} /></label>
          <label className="manager-check"><input type="checkbox" name="autoCheck" defaultChecked={task.answer.autoCheck} /> Проверять ответ автоматически</label>
          <label className="manager-check"><input type="checkbox" name="orderMatters" defaultChecked={task.answer.orderConfigured ? task.answer.orderMatters : [3,6,13,14,15].includes(task.number)} /> Порядок символов в ответе важен</label>
          <label>Добавить изображение (PNG, JPG, WebP, до 5 МБ)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={e=>void upload(e.target.files?.[0])} /></label>
          {uploading && <p role="status">Загружаю изображение…</p>}
          <label>Изображения — путь каждого с новой строки<textarea ref={imagePaths} name="images" defaultValue={task.images?.join('\n')} rows={3} placeholder="/imported/ege-social/9/image.png" /></label>
        </>}
        <label>Пояснение / критерии оценивания<textarea name="explanation" defaultValue={task.explanation} rows={8} /></label>
        <div className="manager-fields">
          <label>Источник<input name="sourceName" defaultValue={task.source.name} /></label>
          <label>Номер задания в источнике<input name="sourceId" defaultValue={task.sourceId} /></label>
          <label>Файл / ссылка на источник<input name="sourceFile" defaultValue={task.source.file} /></label>
        </div>
        <div className="manager-toolbar"><button type="submit" disabled={busy || uploading}>{busy?'Сохраняю…':'Сохранить'}</button><button type="button" disabled={busy || uploading} onClick={()=>setEditing(null)}>Отмена</button></div>
      </form>
    </section> : null}
    <div className="manager-filters">
      <label>Поиск<input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} placeholder="Текст, тема или номер источника" /></label>
      <label>Экзамен<select value={exam} onChange={e=>{setExam(e.target.value);setPage(1);}}><option value="">Все</option><option value="ege">ЕГЭ</option><option value="oge">ОГЭ</option></select></label>
      <label>Номер<input type="number" min="1" max="25" value={number} onChange={e=>{setNumber(e.target.value);setPage(1);}} /></label>
      <label>Статус<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="active">Все действующие</option><option value="published">Опубликованные</option><option value="draft">Черновики</option><option value="archived">Удалённые</option><option value="all">Все</option></select></label>
    </div>
    <p>{loading?'Загрузка…':`Найдено заданий: ${total}`}</p>
    <div className="manager-list">{records.map(record=><article key={record.task.id}>
      <div><strong>{record.task.exam==='ege'?'ЕГЭ':'ОГЭ'} №{record.task.number} · {record.task.title}</strong><p>{record.task.topic} · Источник №{record.task.sourceId || '—'} · {statusNames[record.status]}</p><p>{(record.task.taskKind==='oge_terms_definition' ? record.task.question : record.task.prompt || record.task.question).slice(0,180)}</p></div>
      <div className="manager-row-actions"><button disabled={busy} onClick={()=>{setEditing(record);setError('');window.scrollTo({top:0,behavior:'smooth'});}}>Редактировать</button>
        {record.status==='archived' ? <button disabled={busy} onClick={()=>save({...record,status:'draft'},false)}>Восстановить</button> : confirmDelete===record.task.id ? <><button disabled={busy} onClick={()=>{setConfirmDelete(null);void save({...record,status:'archived'},false);}}>Подтвердить удаление</button><button onClick={()=>setConfirmDelete(null)}>Отмена удаления</button></> : <button disabled={busy} onClick={()=>setConfirmDelete(record.task.id)}>Удалить</button>}
      </div>
    </article>)}</div>
    <div className="manager-toolbar"><button disabled={page===1 || loading} onClick={()=>setPage(p=>p-1)}>Назад</button><span>Страница {page} из {Math.max(1,Math.ceil(total/30))}</span><button disabled={page*30>=total || loading} onClick={()=>setPage(p=>p+1)}>Дальше</button></div>
  </>;
}
