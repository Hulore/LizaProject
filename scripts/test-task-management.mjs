import assert from 'node:assert/strict';
import pg from 'pg';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const base = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000';
const pool = new pg.Pool({connectionString:process.env.SUPABASE_DB_URL,ssl:{rejectUnauthorized:false}});
const created = [];
let imageId;
try {
  assert.equal((await fetch(base+'/api/teacher/tasks')).status,401);
  assert.equal((await fetch(base+'/api/teacher/tasks',{method:'POST',body:'{}',headers:{'Content-Type':'application/json'}})).status,401);
  const loginHtml = await (await fetch(base+'/login')).text();
  const ids = [...loginHtml.matchAll(/name="(\$ACTION_ID_[^"]+)"/g)].map(m=>m[1]);
  const form = new FormData(); form.set(ids[1],'');form.set('login','TestTeacher');form.set('password','123321');
  const login = await fetch(base+'/login',{method:'POST',body:form,redirect:'manual',headers:{Origin:base}});
  assert.equal(login.headers.get('location'),'/teacher');
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const headers = {Cookie:cookie,'Content-Type':'application/json'};
  const teacherPage = await (await fetch(base+'/teacher',{headers})).text();
  assert.ok(teacherPage.includes('Сменить пароль учителя'));
  async function save(record,isNew=false,expected=200) {
    const response=await fetch(base+'/api/teacher/tasks',{method:'POST',headers,body:JSON.stringify({...record,isNew})});
    const data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));return data.record;
  }
  const topic=`TEST_${Date.now()}`;
  const existingRecords=await (await fetch(base+'/api/teacher/tasks?exam=ege',{headers})).json();
  const imported=existingRecords.records.find(record=>record.revision===0);
  if(imported){const saved=await save(imported);created.push(saved.task.id);assert.equal(saved.revision,1);}
  let record=await save({task:{id:'',subject:'social_studies',exam:'ege',part:1,number:10,sourceId:topic,topic,title:'Проверка управления',question:'Тестовое условие',prompt:'1) Первый\n2) Второй',taskKind:'ege_imported_text_answer',taskKindLabel:'Выбор позиций',answer:{value:['12'],autoCheck:true,orderMatters:false,orderConfigured:true},explanation:'Тест',source:{name:'Тест',sourceId:topic,file:''}},status:'draft',revision:0},true);
  created.push(record.task.id);
  const studentUrl=base+'/api/social-studies/ege-tasks?mode=topic&topic='+encodeURIComponent(topic);
  assert.equal((await (await fetch(studentUrl)).json()).tasks.length,0);
  record=await save({...record,status:'published'});
  assert.equal((await (await fetch(studentUrl)).json()).tasks.length,1);
  const stale=structuredClone(record);
  record=await save({...record,task:{...record.task,question:'Изменённое условие',answer:{...record.task.answer,value:['21'],orderMatters:true}}});
  assert.equal((await (await fetch(studentUrl)).json()).tasks[0].question,'Изменённое условие');
  await save(stale,false,409);
  record=await save({...record,status:'archived'});
  assert.equal((await (await fetch(studentUrl)).json()).tasks.length,0);
  record=await save({...record,status:'draft'});
  assert.equal(record.status,'draft');
  const search=await (await fetch(base+'/api/teacher/tasks?q='+topic,{headers})).json();
  assert.equal(search.total,1);
  const history=await pool.query('select count(*)::int as count from public.task_change_history where task_id=$1',[record.task.id]);assert.ok(history.rows[0].count>=4);
  const uploadForm=new FormData();uploadForm.set('image',new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64')],'test.png',{type:'image/png'}));
  const upload=await fetch(base+'/api/teacher/task-images',{method:'POST',headers:{Cookie:cookie},body:uploadForm});assert.equal(upload.status,200);
  const image=await upload.json();imageId=image.url.split('/').pop();assert.equal((await fetch(base+image.url)).headers.get('content-type'),'image/png');
  const oge=await save({task:{id:'',subject:'social_studies',exam:'oge',part:1,number:1,taskKind:'oge_terms_definition',sourceId:topic,topic,title:'Тест ОГЭ',question:'Выберите понятия',terms:['Наука','Религия','Доход'],instruction:'Выберите два',answer:{concepts:['Наука','Религия'],maxScore:2,autoCheck:'concepts_only'},explanation:'Тест',page:1,codifier:'',source:{name:'Тест',sourceId:topic,file:'',page:1}},status:'published',revision:0},true);created.push(oge.task.id);
  assert.ok((await (await fetch(base+'/social-studies/oge')).text()).includes(topic));
  assert.equal((await (await fetch(base+'/api/social-studies/ege-tasks?mode=variant')).json()).tasks.length,25);
  const testVariant=await (await fetch(base+'/api/social-studies/ege-tasks?mode=variant&part=1')).json();
  assert.equal(testVariant.tasks.length,16);
  assert.deepEqual(testVariant.tasks.map(task=>task.number),Array.from({length:16},(_,i)=>i+1));
  assert.ok(testVariant.tasks.every(task=>task.part===1));
  const codifierList=await (await fetch(base+'/api/teacher/tasks?exam=ege&sort=subtopic',{headers})).json();
  assert.ok(codifierList.subtopics.some(Boolean));
  assert.ok(codifierList.subtopics.every(section=>!/[;\n]\s*\d+\.\d+/.test(section)));
  const subtopic=codifierList.subtopics.find(Boolean);
  assert.ok(subtopic);
  const filtered=await (await fetch(base+'/api/teacher/tasks?exam=ege&subtopic='+encodeURIComponent(subtopic),{headers})).json();
  assert.ok(filtered.records.length && filtered.records.every(record=>record.task.subtopic.split('; ').includes(subtopic)));
  const training=await (await fetch(base+'/api/social-studies/ege-tasks?mode=topic&topic='+encodeURIComponent(filtered.records[0].task.topic)+'&subtopic='+encodeURIComponent(subtopic))).json();
  assert.ok(training.tasks.length && training.tasks.every(task=>task.subtopic.split('; ').includes(subtopic)));
  const sections=['1.8 Тестовый раздел', '2.7 Тестовый раздел'];
  record=await save({...record,status:'published',task:{...record.task,subtopic:sections.join('; ')+'; '+sections[0]+'.'}});
  for(const section of sections){
    const result=await (await fetch(studentUrl+'&subtopic='+encodeURIComponent(section))).json();
    assert.equal(result.tasks.length,1);
    assert.equal(result.tasks[0].subtopic,sections.join('; '));
    const teacherResult=await (await fetch(base+'/api/teacher/tasks?q='+topic+'&subtopic='+encodeURIComponent(section),{headers})).json();
    assert.equal(teacherResult.total,1);
    assert.equal(teacherResult.subtopics.filter(value=>value===section).length,1);
    assert.ok(!teacherResult.subtopics.includes(sections.join('; ')));
  }
  const catalog=await (await fetch(base+'/social-studies/ege?catalogView=topics&subtopic='+encodeURIComponent(subtopic))).text();
  assert.ok(catalog.includes('Подтема кодификатора'));
  console.log('PASS: access control, creation, drafts, publishing, editing, conflict protection, deletion, restore, search, history, images, OGE and full variant.');
} finally {
  for(const id of created){await pool.query('delete from public.task_change_history where task_id=$1',[id]);await pool.query('delete from public.task_overrides where id=$1',[id]);}
  if(imageId) await pool.query('delete from public.task_images where id=$1',[imageId]);
  await pool.end();
}
