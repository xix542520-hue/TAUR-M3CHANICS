const TAUR_CLOUD_RECONCILIATION=(function(){
 const compareRecordState=(localRecord,remoteRow)=>{
  const localPayload=localRecord||{},remotePayload=remoteRow?.payload||{};
  if(JSON.stringify(localPayload)===JSON.stringify(remotePayload))return 'KEEP';
  const lt=Date.parse(localPayload.updated||localPayload.created||0)||0;
  const rt=Date.parse(remoteRow?.updated_at||remotePayload.updated||remotePayload.created||0)||0;
  if(lt>rt)return 'UPDATE';
  if(rt>lt)return 'KEEP';
  const ls=JSON.stringify(localPayload),rs=JSON.stringify(remotePayload);
  return ls>=rs?'UPDATE':'KEEP';
 };

 const buildReconciliationPlan=(local,remoteRows,collections)=>{
  const cols=Array.isArray(collections)?collections:['customers','vehicles','jobs','quotes','payments','parts','pricing','tools','research','settings','leads','estimates','partners','referrals','tombstones'];
  const plan={collections:{},totals:{upserts:0,staleDeletes:0,legacyDeletes:0,create:0,update:0,keep:0,delete:0}},remoteByCollection={};
  for(const row of remoteRows||[])if(cols.includes(row.collection))(remoteByCollection[row.collection]||(remoteByCollection[row.collection]=[])).push(row);
  for(const collection of cols){
   if(collection==='settings'){
    const legacy=(remoteByCollection[collection]||[]).some(row=>String(row.record_id)===collection);
    plan.collections[collection]={upserts:1,staleDeletes:0,legacyDeletes:legacy?1:0,actions:{create:1,update:0,keep:0,delete:0}};
    plan.totals.upserts++;plan.totals.create++;plan.totals.legacyDeletes+=legacy?1:0;continue;
   }
   const rows=Array.isArray(local?.[collection])?local[collection]:[],remoteMap=new Map((remoteByCollection[collection]||[]).filter(r=>String(r.record_id)!==collection).map(r=>[String(r.record_id),r])),actions={create:0,update:0,keep:0,delete:0};
   rows.filter(r=>r?.id).forEach(record=>{const id=String(record.id),remote=remoteMap.get(id);if(!remote){actions.create++;return}if(compareRecordState(record,remote)==='UPDATE')actions.update++;else actions.keep++});
   const staleIds=[...remoteMap.keys()].filter(id=>!rows.some(r=>r?.id&&String(r.id)===id));actions.delete=staleIds.length;
   const legacyDeletes=(remoteByCollection[collection]||[]).some(row=>String(row.record_id)===collection)?1:0;
   plan.collections[collection]={upserts:actions.create+actions.update,staleDeletes:staleIds.length,legacyDeletes,actions};
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
  return next;
 };
 return {compareRecordState,buildReconciliationPlan,applyTombstones};
})();
window.TAUR_CLOUD_RECONCILIATION=TAUR_CLOUD_RECONCILIATION;
