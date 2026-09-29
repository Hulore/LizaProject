import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth";
import { getPostgresPool } from "@/lib/postgres";

export async function POST(request: Request) {
  const teacher = await getTeacherSession();
  if (!teacher) return NextResponse.json({error:"Нужен вход учителя."},{status:401});
  if (Number(request.headers.get('content-length')) > 6*1024*1024) return NextResponse.json({error:"Максимальный размер картинки — 5 МБ."},{status:413});
  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || !file.size || file.size>5*1024*1024) return NextResponse.json({error:"Выберите картинку до 5 МБ."},{status:400});
  const content = Buffer.from(await file.arrayBuffer());
  const mime = content.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png' :
    content[0]===255 && content[1]===216 && content[2]===255 ? 'image/jpeg' :
    content.subarray(0,4).toString()==='RIFF' && content.subarray(8,12).toString()==='WEBP' ? 'image/webp' : null;
  if (!mime) return NextResponse.json({error:"Поддерживаются PNG, JPG и WebP."},{status:400});
  const id = randomUUID();
  await getPostgresPool().query('insert into public.task_images(id,mime_type,content,created_by) values($1,$2,$3,$4)',[id,mime,content,teacher.login]);
  return NextResponse.json({url:`/api/task-images/${id}`});
}
