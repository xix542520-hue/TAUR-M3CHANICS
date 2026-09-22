/* TAUR PAYMENT LEDGER V2 — payment truth delegated to Data Core */
(()=>{
 const legacyBase=p=>Number(p?.baseAmount??(p?.tip!=null?Number(p?.amount||0)-Number(p.tip||0):p?.amount??0));
 const base=p=>window.TAUR?.payments?.baseAmount?.(p) ?? legacyBase(p);
 const original=window.jobPaid;
 window.jobPaid=id=>{
  const rows=window.TAUR?.payments?.forJob?.(id);
  if(Array.isArray(rows))return rows.reduce((s,p)=>s+Math.max(0,base(p)),0);
  return typeof original==='function'?Number(original(id)||0):0;
 };
 window.taurPaymentBase=base;
 window.taurPaymentCollected=id=>{
  const rows=window.TAUR?.payments?.forJob?.(id);
  if(Array.isArray(rows))return rows.reduce((s,p)=>s+Math.max(0,Number(p?.amount||0)),0);
  return 0;
 };
})();