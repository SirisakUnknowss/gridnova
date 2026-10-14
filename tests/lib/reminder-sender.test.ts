import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { allowedPushEndpoint } from '../../supabase/functions/_shared/web-push';
function handler(project = 'https://xrtgcxofjisqaigaaboy.supabase.co', tokens: object[] = []) {
  let callback: (req: Request) => Promise<Response> = async () => new Response('Not loaded');
  const rpc = vi.fn(async (name: string) => ({ error: null, data: name === 'staging_automation_config' ? { scheduler_token: 'test-secret', vapid_public: 'public', vapid_private: {} } : name === 'claim_staging_daily_reminders' ? tokens : null }));
  const source = readFileSync('supabase/functions/send-push-reminders/index.ts','utf8').replace(/^import .*;\r?\n/gm,'');
  const code = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
  new Function('Deno','createClient','allowedPushEndpoint','encryptPush','vapidAuthorization',code)(
    {env:{get:(key:string)=>key==='SUPABASE_URL'?project:'service'},serve:(fn:typeof callback)=>{callback=fn;}},
    ()=>({rpc}),allowedPushEndpoint,async()=>new Uint8Array([1,2,3]),async()=>'vapid test'
  );
  return {callback,rpc};
}
afterEach(()=>{vi.unstubAllGlobals();});
describe('staging reminder sender',()=>{
  it('refuses other projects and unauthorized requests',async()=>{
    expect((await handler('https://other.supabase.co').callback(new Request('https://test',{method:'POST'}))).status).toBe(403);
    const {callback,rpc}=handler();
    expect((await callback(new Request('https://test',{method:'POST'}))).status).toBe(401);
    expect(rpc).not.toHaveBeenCalledWith('claim_staging_daily_reminders');
  });
  it('reports no sends when the eligibility RPC returns no subscribers',async()=>{
    const {callback}=handler();
    expect(await (await callback(new Request('https://test',{method:'POST',headers:{'x-gridnova-scheduler':'test-secret'}}))).json()).toEqual({sent:0,failed:0,total:0});
  });
  it('sends encrypted binary, forbids redirects and records service acceptance',async()=>{
    const fetchMock=vi.fn(async()=>new Response(null,{status:201}));vi.stubGlobal('fetch',fetchMock);
    const {callback,rpc}=handler(undefined,[{id:'qa',token:'https://fcm.googleapis.com/test',p256dh:'key',auth:'auth',reminder_date:'2026-10-15'}]);
    expect(await (await callback(new Request('https://test',{method:'POST',headers:{'x-gridnova-scheduler':'test-secret'}}))).json()).toEqual({sent:1,failed:0,total:1});
    expect(fetchMock).toHaveBeenCalledWith('https://fcm.googleapis.com/test',expect.objectContaining({redirect:'error',body:expect.any(Uint8Array),headers:expect.objectContaining({'Content-Encoding':'aes128gcm'})}));
    expect(rpc).toHaveBeenCalledWith('finish_staging_daily_reminder',{p_token_id:'qa',p_date:'2026-10-15',p_status:201});
  });
});

