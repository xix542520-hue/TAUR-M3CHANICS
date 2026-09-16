/* TAUR PRICE BOOK BRIDGE V1 — keeps legacy price-book cache aligned with shared DB */
(()=>{
 const KEY='TAUR_M3CHANICS_FINAL_V1',PB='TAUR_PRICEBOOK_V1';
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const reconcile=()=>{const d=read(KEY)||{},pb=read(PB);if(Array.isArray(pb)&&pb.length){if(JSON.stringify(d.pricing||[])!==JSON.stringify(pb)){d.pricing=pb;write(KEY,d)}return}if(Array.isArray(d.pricing)&&d.pricing.length)write(PB,d.pricing)};
 reconcile();
 const oldSet=localStorage.setItem.bind(localStorage);localStorage.setItem=function(k,v){oldSet(k,v);if(k===PB){const d=read(KEY)||{};try{d.pricing=JSON.parse(v);oldSet(KEY,JSON.stringify(d))}catch{}}};
 window.addEventListener('taur-cloud-sync',reconcile);
 setTimeout(reconcile,1500);
})();