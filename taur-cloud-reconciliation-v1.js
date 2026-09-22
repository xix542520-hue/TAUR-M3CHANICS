const TAUR_CLOUD_RECONCILIATION=(function(){
 const stableStringify=(value)=>{
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(stableStringify).join(',')+']';
  return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableStringify(value[k])).join(',')+'}';
 };
 const newerRecord=(a,b)=>{
  const ta=Date.parse(a?.updated||a?.created||a?.deletedAt||0)||0,tb=Date.parse(b?.updated||b?.created||b?.deletedAt||0)||0;
  if(tb>ta)return b;if(ta>tb)return a;
  const as=stableStringify(a),bs=stableStringify(b);
  return bs>as?b:a;
 };
 const mergeRecords=(left,right)=>{const map=new Map();(Array.isArray(left)?left:[]).forEach(x=>{if(x?.id)map.set(x.id,x)});(Array.isArray(right)?right:[]).forEach(x=>{if(!x?.id)return;map.set(x.id,map.has(x.id)?newerRecord(map.get(x.id),x):x)});return [...map.values()]};
 const compareRecordState=(localRecord,remoteRow)=>{
  const localPayload=localRecord||{},remotePayload=remoteRow?.payload||{};
  if(stableStringify(localPayload)===stableStringify(remotePayload))return 'KEEP';
  const lt=Date.parse(localPayload.updated||localPayload.created||0)||0;
  const rt=Date.parse(remoteRow?.updated_at||remotePayload.updated||remotePayload.created||0)||0;
  if(lt>rt)return 'UPDATE';
  if(rt>lt)return 'KEEP';
  const ls=stableStringify(localPayload),rs=stableStringify(remotePayload);
  return ls>=rs?'UPDATE':'KEEP';
 };

 const buildReconciliationPlan=(local,remoteRows,collections)=>{
  const cols=Array.isArray(collections)?collections:['customers','vehicles','jobs','quotes','payments','parts','pricing','tools','research','settings','leads','estimates','partners','referrals','tombstones'];
  const plan={collections:{},totals:{upserts:0,staleDeletes:0,legacyDeletes:0,create:0,update:0,keep:0,delete:0}},remoteByCollection={};
  for(const row of remoteRows||[])if(cols.includes(row.collection))(remoteByCollection[row.collection]||(remoteByCollection[row.collection]=[])).push(row);
  for(const collection of cols){
   if(collection==='settings'){
    const legacy=(remoteByCollection[collection]||[]).some(row=>String(row.record_id)===collection);
    plan.collections[collection]={upserts:1,staleDeletes:0,legacyDeletes:legacy?1:0,actions:{create:1,update:0,keep:0,delete:0},ids:{create:[collection],update:[],keep:[],delete:[]}};
    plan.totals.upserts++;plan.totals.create++;plan.totals.legacyDeletes+=legacy?1:0;continue;
   }
   const rows=Array.isArray(local?.[collection])?local[collection]:[],localMap=new Map(),remoteMap=new Map(),actions={create:0,update:0,keep:0,delete:0},ids={create:[],update:[],keep:[],delete:[]};
   rows.filter(r=>r?.id).forEach(record=>{const id=String(record.id);localMap.set(id,localMap.has(id)?newerRecord(localMap.get(id),record):record)});
   (remoteByCollection[collection]||[]).filter(r=>String(r.record_id)!==collection).forEach(row=>{
    const id=String(row.record_id||row.payload?.id||'');
    if(!id)return;
    remoteMap.set(id,remoteMap.has(id)?(newerRecord(remoteMap.get(id).payload||{},row.payload||{})===row.payload?row:remoteMap.get(id)):row);
   });
   for(const [id,record] of localMap){
    const remote=remoteMap.get(id);
    if(!remote){actions.create++;continue}
    if(compareRecordState(record,remote)==='UPDATE')actions.update++;else actions.keep++;
   }
   const staleIds=[...remoteMap.keys()].filter(id=>!localMap.has(id));actions.delete=staleIds.length;ids.delete.push(...staleIds);
   const legacyDeletes=(remoteByCollection[collection]||[]).some(row=>String(row.record_id)===collection)?1:0;
   plan.collections[collection]={upserts:actions.create+actions.update,staleDeletes:staleIds.length,legacyDeletes,actions,ids};
   plan.totals.upserts+=actions.create+actions.update;plan.totals.staleDeletes+=staleIds.length;plan.totals.legacyDeletes+=legacyDeletes;
   plan.totals.create+=actions.create;plan.totals.update+=actions.update;plan.totals.keep+=actions.keep;plan.totals.delete+=actions.delete;
  } return plan;
 };
 const applyTombstones=(db)=>{
  const tombstones=Array.isArray(db?.tombstones)?db.tombstones:[];
  const next={...db};
  for(const t of tombstones){
   if(!t?.collection||!t?.recordId||!Array.isArray(next[t.collection]))continue;
   const deletedAt=Date.parse(t.deletedAt||0)||0;
   next[t.collection]=next[t.collection].filter(record=>{
    if(String(record?.id)!==String(t.recordId))return true;
    const updatedAt=Date.parse(record.updated||record.created||0)||0;
    return updatedAt>deletedAt;
   });
  }
  next.tombstones=tombstones.filter(t=>{
   const record=Array.isArray(next[t?.collection])?next[t.collection].find(x=>String(x?.id)===String(t?.recordId)):null;
   if(!record)return true;
   const deletedAt=Date.parse(t.deletedAt||0)||0;
   const updatedAt=Date.parse(record.updated||record.created||0)||0;
   if(updatedAt>deletedAt)return false;
   if(updatedAt<deletedAt)return true;
   const recordKey=stableStringify(record),tombstoneKey=stableStringify(t);
   return recordKey<tombstoneKey;
  });
  return next;
 };
 return {newerRecord,mergeRecords,compareRecordState,buildReconciliationPlan,applyTombstones};
})();
globalThis.TAUR_CLOUD_RECONCILIATION=TAUR_CLOUD_RECONCILIATION;
