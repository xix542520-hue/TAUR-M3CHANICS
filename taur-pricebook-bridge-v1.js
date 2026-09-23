/* TAUR PRICE BOOK BRIDGE V4 — compatibility mirror only; Data Core is authoritative */
(()=>{
 const KEY='TAUR_M3CHANICS_FINAL_V1',PB='TAUR_PRICEBOOK_V1';
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const raw=localStorage.setItem.bind(localStorage);
 const mirror=pricing=>{if(Array.isArray(pricing))raw(PB,JSON.stringify(pricing))};
 const reconcile=()=>{
  const core=window.TAUR?.pricebook;
  if(!core)return;
  const canonical=core.list?.()||[];
  if(canonical.length){mirror(canonical);return}
  const legacy=read(PB);
  if(!Array.isArray(legacy)||!legacy.length)return;
  let accepted=false;
  for(const item of legacy){
   if(item?.id&&!core.get(item.id)){
    const created=core.create(item);
    if(created)accepted=true;
   }
  }
  const after=core.list?.()||[];
  if(after.length)mirror(after);
  else if(accepted)mirror(legacy);
 };
 reconcile();
 if(window.TAUR?.on){
  window.TAUR.on('DATA_CORE_READY',reconcile);
  window.TAUR.on('DATA_SAVED',reconcile);
  window.TAUR.on('TRANSACTION_COMMITTED',reconcile);
 }
 window.addEventListener('taur-cloud-sync',reconcile);
 setTimeout(reconcile,1500);
})();
