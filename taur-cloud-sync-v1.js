/* TAUR CLOUD SYNC V1
   Shared app-record cache. Growth and pricing collections are included.
*/
(()=>{
 const SUPABASE_URL='https://pgvicmzjrrqimwftftuj.supabase.co';
 const SUPABASE_KEY='sb_publishable_P8alxVgoTTthhJVXABHQWQ_YyK3rt8h';
 const KEY='TAUR_M3CHANICS_FINAL_V1';
 const COLLECTIONS=['customers','vehicles','jobs','quotes','payments','parts','pricing','tools','research','settings','growth_leads','growth_estimates'];
 let client=null,businessId=localStorage.getItem('TAUR_BUSINESS_ID')||'',timer=null,remoteReady=false,syncing=false,loadingRemote=false,channel=null;
 const localDb=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
 async function init(){if(client)return true;if(!window.supabase)return false;client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const {data:{session}}=await client.auth.getSession();if(!session)return false;businessId=localStorage.getItem('TAUR_BUSINESS_ID')||'';if(!businessId){const r=await client.rpc('bootstrap_taur_business',{business_name:'TAUR M3CHANICS'});if(r.error)return false;businessId=r.data;localStorage.setItem('TAUR_BUSINESS_ID',businessId)}remoteReady=true;return true}
 async function syncNow(){if(syncing||loadingRemote||!await init())return false;const d=localDb();if(!d)return false;syncing=true;try{for(const c of COLLECTIONS){const payload=c.startsWith('growth_')?(JSON.parse(localStorage.getItem('TAUR_GROWTH_V1')||'{}')[c.replace('growth_','')]||[]):(d[c]??[]);await client.from('app_records').upsert({business_id:businessId,collection:c,record_id:c,payload,updated_at:new Date().toISOString()},{onConflict:'business_id,collection,record_id'})}return true}finally{syncing=false}}
 async function pullRemote(){if(loadingRemote||!await init())return false;loadingRemote=true;try{const r=await client.from('app_records').select('collection,payload').eq('business_id',businessId).in('collection',COLLECTIONS);if(r.error)return false;const d=localDb()||{};let growth=JSON.parse(localStorage.getItem('TAUR_GROWTH_V1')||'{"leads":[],"estimates":[]}');(r.data||[]).forEach(x=>{if(x.collection.startsWith('growth_'))growth[x.collection.replace('growth_','')]=Array.isArray(x.payload)?x.payload:[];else d[x.collection]=x.payload});localStorage.setItem(KEY,JSON.stringify(d));localStorage.setItem('TAUR_GROWTH_V1',JSON.stringify(growth));return true}finally{loadingRemote=false}}
 window.taurCloud={init,syncNow,pullRemote,isReady:()=>remoteReady,getBusinessId:()=>businessId};
})();