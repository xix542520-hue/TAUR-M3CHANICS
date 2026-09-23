/* TAUR CLOUD SYNC V3 — shared partner network collections */
(()=>{
 const SUPABASE_URL='https://pgvicmzjrrqimwftftuj.supabase.co',SUPABASE_KEY='sb_publishable_P8alxVgoTTthhJVXABHQWQ_YyK3rt8h',KEY='TAUR_M3CHANICS_FINAL_V1';
 const COLLECTIONS=['customers','vehicles','jobs','quotes','payments','parts','pricing','tools','research','settings','leads','estimates','partners','referrals','tombstones'];
 const LEGACY_GROWTH_COLLECTIONS=['growth_leads','growth_estimates'];
 let client=null,businessId=localStorage.getItem('TAUR_BUSINESS_ID')||'',timer=null,remoteReady=false,syncing=false,loadingRemote=false,channel=null,coreSyncTimer=null,coreSyncBound=false,coreSyncQueued=false;
let lastReconciliationPlan=null;
 const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const legacyLocalDb=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
 const localDb=()=>window.TAUR?.data?window.TAUR.data.db:legacyLocalDb();
 const localSave=db=>{if(typeof window.taurSetDb==='function')window.taurSetDb(db);else localStorage.setItem(KEY,JSON.stringify(db))};
 const newerRecord=TAUR_CLOUD_RECONCILIATION.newerRecord;
 const mergeRecords=TAUR_CLOUD_RECONCILIATION.mergeRecords;
 const applyTombstones=TAUR_CLOUD_RECONCILIATION.applyTombstones;
  const toast=(msg,good=false)=>{let x=document.getElementById('taurCloudToast');if(!x){x=document.createElement('div');x.id='taurCloudToast';x.style.cssText='position:fixed;left:12px;right:12px;bottom:78px;z-index:300;padding:11px 13px;border:1px solid #333;border-radius:10px;background:#151515;color:#eee;font-size:11px;text-align:center';document.body.appendChild(x)}x.textContent=msg;x.style.borderColor=good?'#315b31':'#4a2b2b';clearTimeout(timer);timer=setTimeout(()=>x.remove(),3500)};
 async function loadSdk(){if(window.supabase)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
 function scheduleCoreSync(){
  if(!remoteReady||loadingRemote||!client||!businessId)return;
  if(syncing){coreSyncQueued=true;return}
  clearTimeout(coreSyncTimer);
  coreSyncTimer=setTimeout(()=>{coreSyncTimer=null;syncNow()},350);
}
function bindCoreSync(){
  if(coreSyncBound||!window.TAUR?.on)return;
  window.TAUR.on('DATA_SAVED',scheduleCoreSync);
  window.TAUR.on('TRANSACTION_COMMITTED',scheduleCoreSync);
  coreSyncBound=true;
}
async function init(){try{await loadSdk();client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const {data:{session}}=await client.auth.getSession();if(session)await signedIn(session);else statusBar(false);client.auth.onAuthStateChange((event,session)=>setTimeout(()=>session?signedIn(session):statusBar(false),0));window.taurCloud={open:openPanel,signOut,sync:syncNow,migrate:migrateLocal,invite};}catch(e){console.error(e);toast('Cloud initialization failed')}}
 function statusBar(on,state){let h=document.getElementById('taurCloudHeader');if(!h){h=document.createElement('div');h.id='taurCloudHeader';h.style.cssText='position:fixed;right:10px;top:76px;z-index:40;font-size:9px;font-weight:900;letter-spacing:1px;background:#171717;border:1px solid #333;border-radius:20px;padding:6px 9px;color:#aaa;cursor:pointer';document.body.appendChild(h);h.onclick=openPanel}h.textContent=on?('☁ '+(state||'SYNCED')):'☁ SIGN IN';h.style.color=on?'#bfe6bf':'#ddd'}
 async function signedIn(session){remoteReady=false;try{const {data,error}=await client.rpc('bootstrap_taur_business',{business_name:'TAUR M3CHANICS'});if(error)throw error;businessId=data;localStorage.setItem('TAUR_BUSINESS_ID',businessId);await loadRemote();subscribe();remoteReady=true;bindCoreSync();await syncNow();statusBar(true);toast('TAUR CLOUD connected',true)}catch(e){console.error(e);toast('Cloud connection error: '+(e.message||e))}}
 function mergeRemoteRowsIntoLocal(local,rows){
   const merged={...(local||{})};
   for(const row of rows||[]){
     if(!COLLECTIONS.includes(row.collection))continue;
     if(row.collection==='settings'){
       if(row.payload&&typeof row.payload==='object'&&!Array.isArray(row.payload))
         merged.settings={...(merged.settings||{}),...(row.payload||{}),...((!row.payload?.updated&&row.updated_at)?{updated:row.updated_at}:{})};
       continue;
     }
     if(Array.isArray(row.payload)){
       const remoteRecords=row.payload.map(record=>({...record,...(!record?.updated&&row.updated_at?{updated:row.updated_at}:{})}));
       merged[row.collection]=mergeRecords(merged[row.collection],remoteRecords);
     }else if(row.payload&&typeof row.payload==='object'){
       const remoteRecord={...row.payload,...(!row.payload.updated&&row.updated_at?{updated:row.updated_at}:{})};
       merged[row.collection]=mergeRecords(merged[row.collection],[remoteRecord]);
     }
   }
   return Object.assign(merged,applyTombstones(merged));
 }
 function migrateLegacyGrowthToCore(db){
   const raw=localStorage.getItem('TAUR_GROWTH_V1');
   if(!raw)return db;
   let growth;
   try{growth=JSON.parse(raw)}catch{return db}
   const legacyLeads=Array.isArray(growth?.leads)?growth.leads:[];
   const legacyEstimates=Array.isArray(growth?.estimates)?growth.estimates:[];
   if(legacyLeads.length)db.leads=mergeRecords(db.leads,legacyLeads);
   if(legacyEstimates.length)db.estimates=mergeRecords(db.estimates,legacyEstimates);
   localStorage.setItem('TAUR_GROWTH_V1_MIGRATED_AT',new Date().toISOString());
   return db;
 }
 async function loadRemote(){
  loadingRemote=true;
  try{
   const before=localDb();
   if(before)localStorage.setItem('TAUR_LOCAL_BACKUP_V1',JSON.stringify({savedAt:new Date().toISOString(),data:before}));
   const {data,error}=await client.from('app_records').select('collection,record_id,payload,updated_at').eq('business_id',businessId);
   if(error)throw error;
   const db=mergeRemoteRowsIntoLocal(localDb()||{},data||[]);
   migrateLegacyGrowthToCore(db);
   localSave(db);
   if(typeof window.taurSetDb==='function')window.taurSetDb(db);
   localStorage.removeItem('TAUR_GROWTH_V1');
   if(typeof window.render==='function')window.render();
  }finally{loadingRemote=false}
 }
 window.taurCloudDiagnostics=()=>({remoteReady,businessId:!!businessId,syncing,loadingRemote,lastReconciliationPlan:lastReconciliationPlan?JSON.parse(JSON.stringify(lastReconciliationPlan)):null});
 async function syncNow(){if(!client||!businessId||syncing)return false;const local=localDb();if(!local)return false;syncing=true;try{
   const {data:remoteRows,error:remoteError}=await client.from('app_records').select('collection,record_id,payload,updated_at').eq('business_id',businessId);
   if(remoteError)throw remoteError;
   const merged=mergeRemoteRowsIntoLocal(local,remoteRows);
   localSave(merged);if(typeof window.taurSetDb==='function')window.taurSetDb(merged);
   const reconciliationPlan=TAUR_CLOUD_RECONCILIATION.buildReconciliationPlan(merged,remoteRows,COLLECTIONS); lastReconciliationPlan={at:new Date().toISOString(),plan:reconciliationPlan};
   const staleByCollection={};
   for(const collection of COLLECTIONS){
     if(collection==='settings'){
       const {error}=await client.from('app_records').upsert({business_id:businessId,collection,record_id:collection,payload:(merged.settings||{}),updated_at:(merged.settings?.updated||merged.settings?.created||new Date().toISOString())},{onConflict:'business_id,collection,record_id'});
       if(error)throw error;
       continue;
     }
     const rows=Array.isArray(merged[collection])?merged[collection]:[];
     const localIds=new Set(rows.filter(r=>r?.id).map(r=>String(r.id)));
     const planCollection=reconciliationPlan.collections[collection]||{actions:{},ids:{create:[],update:[],keep:[],delete:[]}};
     const writeIds=new Set([...(planCollection.ids?.create||[]),...(planCollection.ids?.update||[])].map(String));
     const payloadRows=rows.filter(record=>{
       if(!record?.id)return false;
       return writeIds.has(String(record.id));
     }).map(record=>({
       business_id:businessId,
       collection,
       record_id:String(record.id),
       payload:record,
       updated_at:(record.updated||record.created||new Date().toISOString())
     }));
     if(payloadRows.length){
       const {error}=await client.from('app_records').upsert(payloadRows,{onConflict:'business_id,collection,record_id'});
       if(error)throw error;
     }
     const staleIds=(planCollection.ids?.delete||[]).filter(id=>id!==collection).map(String);
     if(staleIds.length)staleByCollection[collection]=staleIds;
   }
   for(const [collection,ids] of Object.entries(staleByCollection)){
     const {error:staleDeleteError}=await client.from('app_records').delete().eq('business_id',businessId).eq('collection',collection).in('record_id',ids);
     if(staleDeleteError)throw staleDeleteError;
   }
   for(const collection of COLLECTIONS){
     const {error:legacyDeleteError}=await client.from('app_records').delete().eq('business_id',businessId).eq('collection',collection).eq('record_id',collection);
     if(legacyDeleteError)throw legacyDeleteError;
   }
   remoteReady=true;statusBar(true,'SYNCED');return true;
 }catch(e){console.error(e);toast('Cloud sync failed: '+(e.message||e));return false}finally{syncing=false;if(coreSyncQueued){coreSyncQueued=false;scheduleCoreSync()}}}
 async function migrateLocal(){if(!client||!businessId)return;const db=localDb();if(!db)return;const {data,error}=await client.from('app_records').select('collection').eq('business_id',businessId).limit(1);if(error)return toast('Could not check cloud: '+error.message);if((data||[]).length&&!confirm('Cloud data already exists. Replace it with this device\'s current data?'))return;if(await syncNow()){toast('Local TAUR data uploaded to shared cloud',true);openPanel()}}
 function openPanel(){const p=document.getElementById('taurCloudPanel');if(p)p.remove();const w=document.createElement('div');w.id='taurCloudPanel';w.style.cssText='position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.86);display:flex;align-items:flex-end;justify-content:center';w.innerHTML='<div id="taurCloudCard" style="width:100%;max-width:620px;max-height:94vh;overflow:auto;background:#101010;border:1px solid #333;border-radius:18px 18px 0 0;padding:16px 14px 24px"><div class="row"><div><h2>TAUR CLOUD</h2><div id="taurCloudStatus">Checking connection…</div></div><button class="secondary" id="tcClose">CLOSE</button></div><div id="tcBody"></div></div>';document.body.appendChild(w);w.querySelector('#tcClose').onclick=()=>w.remove();w.addEventListener('click',e=>{if(e.target===w)w.remove()});renderPanelBody()}
 async function renderPanelBody(){const body=document.getElementById('tcBody');if(!body)return;const {data:{session}}=await client.auth.getSession();if(!session){body.innerHTML='<div class="muted">Sign in to the TAUR business account.</div><label>EMAIL</label><input id="tcEmail" type="email"><label>PASSWORD</label><input id="tcPass" type="password"><button id="tcSignIn">SIGN IN</button><button class="secondary" id="tcSignUp">CREATE ACCOUNT</button>';tcSignIn.onclick=()=>auth(false);tcSignUp.onclick=()=>auth(true);return}const {data:members}=await client.from('business_members').select('user_id,role,created_at').eq('business_id',businessId);const isAdmin=(members||[]).some(m=>m.user_id===session.user.id&&['owner','admin','partner'].includes(m.role));body.innerHTML='<div class="taur-cloud-user"><b>'+esc(session.user.email||'')+'</b><br>BUSINESS: TAUR M3CHANICS<br>STATUS: '+(remoteReady?'SYNCED':'CONNECTING')+'</div><button id="tcSync">SYNC NOW</button><button class="secondary" id="tcMigrate">UPLOAD THIS DEVICE</button>'+(isAdmin?'<button class="secondary" id="tcInvite">INVITE / ADD PARTNER</button>':'')+'<button class="danger" id="tcOut">SIGN OUT</button>';tcSync.onclick=async()=>{if(await syncNow())toast('Cloud sync complete',true);renderPanelBody()};tcMigrate.onclick=migrateLocal;tcOut.onclick=signOut;if(isAdmin)tcInvite.onclick=invite}
 async function auth(signup){const e=tcEmail.value.trim(),p=tcPass.value;if(!e||!p)return alert('Enter email and password.');const r=signup?await client.auth.signUp({email:e,password:p}):await client.auth.signInWithPassword({email:e,password:p});if(r.error)return alert(r.error.message);if(signup&&!r.data.session)alert('Account created. Check email if confirmation is enabled.')}
 if(!document.getElementById('taur-cloud-invite-style')){const s=document.createElement('style');s.id='taur-cloud-invite-style';s.textContent='.taur-cloud-invite{position:fixed;inset:0;z-index:180;background:rgba(0,0,0,.82);display:flex;align-items:flex-end;justify-content:center;padding:0}.taur-cloud-invite-card{width:100%;max-width:560px;background:#101010;border:1px solid #333;border-radius:18px 18px 0 0;padding:18px 15px calc(22px + env(safe-area-inset-bottom));box-sizing:border-box}.taur-cloud-invite-card label{display:block;margin:12px 0 4px;font-size:10px}.taur-cloud-invite-card input{width:100%;box-sizing:border-box;min-height:48px;padding:10px 12px;font-size:16px;background:#171717;color:inherit;border:1px solid #444;border-radius:10px}.taur-cloud-invite-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.taur-cloud-invite-actions button{min-height:48px}@media(min-width:700px){.taur-cloud-invite{align-items:center;padding:16px}.taur-cloud-invite-card{border-radius:18px}}';document.head.appendChild(s)}
 async function signOut(){await client.auth.signOut();localStorage.removeItem('TAUR_BUSINESS_ID');document.getElementById('taurCloudPanel')?.remove();toast('Signed out');statusBar(false)}
 async function invite(){const w=document.createElement('div');w.className='taur-cloud-invite';w.innerHTML='<div class="taur-cloud-invite-card"><b>INVITE PARTNER</b><label>PARTNER EMAIL</label><input id="taurInviteEmail" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"><div class="taur-cloud-invite-actions"><button class="secondary" id="taurInviteCancel">CANCEL</button><button id="taurInviteSend">SEND INVITE</button></div></div>';document.body.appendChild(w);w.querySelector('#taurInviteCancel').onclick=()=>w.remove();w.querySelector('#taurInviteSend').onclick=async()=>{const email=w.querySelector('#taurInviteEmail').value.trim();if(!email)return alert('Enter a partner email.');const {error}=await client.rpc('invite_business_member',{invite_email:email,member_role:'partner'});if(error)return alert(error.message);w.remove();toast('Partner added.');renderPanelBody()};w.querySelector('#taurInviteEmail').focus()}
 function subscribe(){
  if(!client||!businessId)return;
  if(channel)client.removeChannel(channel);
  channel=client.channel('taur-cloud-records').on('postgres_changes',{event:'*',schema:'public',table:'app_records',filter:`business_id=eq.${businessId}`},()=>{
    if(syncing||loadingRemote){coreSyncQueued=true;return}
    clearTimeout(coreSyncTimer);
    coreSyncTimer=setTimeout(()=>{coreSyncTimer=null;loadRemote().catch(console.error)},350);
  }).subscribe();
}
 let scheduled=null;const queue=()=>{if(!remoteReady||syncing||loadingRemote)return;statusBar(true,'SAVING');clearTimeout(scheduled);scheduled=setTimeout(()=>{scheduled=null;syncNow()},1200)};const originalSet=localStorage.setItem.bind(localStorage);localStorage.setItem=function(k,v){originalSet(k,v);if(k===KEY)queue()};window.addEventListener('beforeunload',()=>{if(remoteReady)syncNow()});window.addEventListener('taur-cloud-sync',queue);

 window.taurCloudTests={run:()=>{
   const results=[];const assert=(name,ok)=>results.push({name,pass:!!ok});
   const a={id:'a',updated:'2026-01-01T00:00:00Z',value:1},b={id:'b',updated:'2026-01-01T00:00:00Z',value:2};
   const merged=mergeRecords([a],[b]);assert('different records both survive',merged.length===2);
   const newer=mergeRecords([a],[{...a,updated:'2026-01-02T00:00:00Z',value:3}]);assert('newer update wins',newer[0].value===3);
   const older=mergeRecords([a],[{...a,updated:'2025-12-01T00:00:00Z',value:9}]);assert('older update loses',older[0].value===1);
   const tie=mergeRecords([a],[{...a,updated:'2026-01-01T00:00:00Z',value:7}]);assert('equal timestamps remain deterministic',tie[0].value===1);
   const tomb={id:'customers:a',collection:'customers',recordId:'a',deletedAt:'2026-01-03T00:00:00Z'};
   const freshDb={customers:[{id:'a',updated:'2026-01-04T00:00:00Z',value:4}],tombstones:[tomb]};
   applyTombstones(freshDb);assert('newer recreation beats tombstone',freshDb.customers.some(x=>x.id==='a')&&!freshDb.tombstones.some(x=>x.id===tomb.id));
   const staleDb={customers:[{id:'a',updated:'2026-01-02T00:00:00Z',value:9}],tombstones:[tomb]};
   applyTombstones(staleDb);assert('tombstone removes stale recreation',!staleDb.customers.some(x=>x.id==='a')&&staleDb.tombstones.some(x=>x.id===tomb.id));
   return {ok:results.every(x=>x.pass),results};
 }};
 if(window.TAUR?.on){window.TAUR.on('*',e=>{if(!e?.type)return;if(/_(CREATED|UPDATED|REMOVED)$/.test(e.type)||e.type==='TOMBSTONE_CREATED'||e.type==='DATA_SAVED')queue()});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();