/* TAUR PRICE BOOK BRIDGE V3 — compatibility mirror only; Data Core is authoritative */
(()=>{
 const KEY='TAUR_M3CHANICS_FINAL_V1',PB='TAUR_PRICEBOOK_V1';
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const raw=localStorage.setItem.bind(localStorage);
 const mirror=pricing=>{if(Array.isArray(pricing))raw(PB,JSON.stringify(pricing))};
 const reconcile=()=>{
  const d=read(KEY)||{}, pricing=d.pricing;
  if(Array.isArray(pricing)&&pricing.length){mirror(pricing);return}
  const legacy=read(PB);
  if(!Array.isArray(legacy)||!legacy.length)return;
  const core=window.TAUR?.pricebook;
  if(core){
   let accepted=false;
   for(const item of legacy){
    if(item?.id&&!core.get(item.id)){
     const created=core.create(item);
     if(created)accepted=true;
    }
   }
   const canonical=core.list?.()||[];
   if(canonical.length)mirror(canonical);
   else if(accepted)mirror(legacy);
  }
 };
 const oldSet=localStorage.setItem.bind(localStorage);
 localStorage.setItem=function(k,v){
  oldSet(k,v);
  if(k!==KEY)return;
  try{
   const d=JSON.parse(v);
   if(Array.isArray(d?.pricing)&&d.pricing.length)raw(PB,JSON.stringify(d.pricing));
  }catch{}
 };
 reconcile();
 window.addEventListener('taur-cloud-sync',reconcile);
 setTimeout(reconcile,1500);
})();