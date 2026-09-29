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
  console.log('PASS: access control, creation, drafts, publishing, editing, conflict protection, deletion, restore, search, history, images, OGE and full variant.');
} finally {
  for(const id of created){await pool.query('delete from public.task_change_history where task_id=$1',[id]);await pool.query('delete from public.task_overrides where id=$1',[id]);}
  if(imageId) await pool.query('delete from public.task_images where id=$1',[imageId]);
  await pool.end();
}
