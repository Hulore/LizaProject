import { getPostgresPool } from "@/lib/postgres";
export async function GET(_request: Request,{params}:{params:Promise<{id:string}>}) {
  const {id} = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response(null,{status:404});
  const result = await getPostgresPool().query<{content:Buffer;mime_type:string}>('select content,mime_type from public.task_images where id=$1',[id]);
  if (!result.rows[0]) return new Response(null,{status:404});
  return new Response(new Uint8Array(result.rows[0].content),{headers:{'Content-Type':result.rows[0].mime_type,'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});
}
