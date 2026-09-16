/* TAUR PRICE BOOK BRIDGE V2 — main DB pricing is canonical; legacy cache mirrors it */
(()=>{
 const KEY='TAUR_M3CHANICS_FINAL_V1',PB='TAUR_PRICEBOOK_V1';
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const raw=localStorage.setItem.bind(localStorage);
 const mirror=(pricing)=>{if(Array.isArray(pricing))raw(PB,JSON.stringify(pricing))};
 const reconcile=()=>{const d=read(KEY)||{},pb=read(PB);if(Array.isArray(d.pricing)&&d.pricing.length){mirror(d.pricing);return}if(Array.isArray(pb)&&pb.length){d.pricing=pb;raw(KEY,JSON.stringify(d));mirror(pb)}};
 const oldSet=localStorage.setItem.bind(localStorage);
 localStorage.setItem=function(k,v){oldSet(k,v);if(k===KEY){try{const d=JSON.parse(v);if(Array.isArray(d?.pricing)&&d.pricing.length)raw(PB,JSON.stringify(d.pricing))}catch{}}else if(k===PB){try{const p=JSON.parse(v);if(Array.isArray(p)){const d=read(KEY)||{};if(!Array.isArray(d.pricing)||!d.pricing.length){d.pricing=p;raw(KEY,JSON.stringify(d))}}}catch{}}};
 reconcile();window.addEventListener('taur-cloud-sync',reconcile);setTimeout(reconcile,1500);
})();
