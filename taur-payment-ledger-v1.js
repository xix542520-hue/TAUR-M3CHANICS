/* TAUR PAYMENT LEDGER V1 — quote payments exclude tips */
(()=>{
 const KEY='TAUR_M3CHANICS_FINAL_V1';
 const db=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{payments:[]}}catch{return {payments:[]}}};
 const base=p=>Number(p?.baseAmount??(p?.tip!=null?Number(p?.amount||0)-Number(p.tip||0):p?.amount??0));
 const original=window.jobPaid;
 window.jobPaid=id=>{
  const d=db(),rows=(d.payments||[]).filter(p=>p.jobId===id);
  if(rows.length)return rows.reduce((s,p)=>s+Math.max(0,base(p)),0);
  return typeof original==='function'?Number(original(id)||0):0;
 };
 window.taurPaymentBase=base;
})();
