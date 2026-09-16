/* TAUR FIELD UX V2 — touch-first Job File, exact context, fast contact */
(()=>{
 const KEY='TAUR_M3CHANICS_FINAL_V1';
 const db=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{customers:[],vehicles:[],jobs:[]}}catch{return {customers:[],vehicles:[],jobs:[]}}};
 const openCustomer=id=>{if(id&&typeof window.taurOpenCustomerTimeline==='function')window.taurOpenCustomerTimeline(id)};
 const openVehicle=id=>{if(id&&typeof window.taurOpenVehicleHistory==='function')window.taurOpenVehicleHistory(id)};
 const callCustomer=phone=>{const p=String(phone||'').trim();if(p)window.location.href='tel:'+p.replace(/[^+\d]/g,'')};
 const style=()=>{if(document.getElementById('taur-field-ux-style'))return;const s=document.createElement('style');s.id='taur-field-ux-style';s.textContent=`.taur-jobfile-xip .taur-jfx-card{padding-bottom:22px}.taur-jobfile-xip .taur-jfx-head button{min-height:44px}.taur-jobfile-xip input,.taur-jobfile-xip select,.taur-jobfile-xip textarea{font-size:16px}.taur-jobfile-xip input,.taur-jobfile-xip select{min-height:44px}.taur-jobfile-xip textarea{min-height:110px}.taur-field-context{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:8px 0}.taur-field-context button{min-height:46px;font-size:11px;width:100%}.taur-field-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}.taur-field-actions button{min-height:46px;width:100%;font-size:11px}.taur-field-primary{grid-column:1/-1}.taur-field-primary button{min-height:50px;font-size:13px}.taur-jobfile-xip .taur-jfx-qc-item{min-height:46px;padding:9px}.taur-jobfile-xip .taur-jfx-qc-item input{min-height:20px;width:20px}.taur-jobfile-xip .taur-jfx-timer button{min-height:48px}.taur-jobfile-xip .taur-jfx-actions{gap:7px}.taur-jobfile-xip .taur-jfx-actions button{min-height:48px}@media(max-width:430px){.taur-field-context{grid-template-columns:1fr}.taur-field-actions{grid-template-columns:1fr}.taur-field-primary{grid-column:auto}}`;document.head.appendChild(s)};
 function enhance(){const w=document.querySelector('.taur-jobfile-xip');if(!w||w.dataset.fieldUx)return;const id=w.dataset.jobId||window.taurCurrentJobId;if(!id)return;const d=db(),j=d.jobs.find(x=>x.id===id);if(!j)return;const c=d.customers.find(x=>x.id===j.customerId),v=d.vehicles.find(x=>x.id===j.vehicleId);style();
  const head=w.querySelector('.taur-jfx-head');
  if(head){const box=document.createElement('div');box.className='taur-field-context';if(c){const b=document.createElement('button');b.className='secondary';b.textContent='CUSTOMER HISTORY';b.onclick=()=>openCustomer(c.id);box.appendChild(b);if(c.phone){const call=document.createElement('button');call.className='secondary';call.textContent='CALL CUSTOMER';call.onclick=()=>callCustomer(c.phone);box.appendChild(call)}}if(v){const b=document.createElement('button');b.className='secondary';b.textContent='VEHICLE HISTORY';b.onclick=()=>openVehicle(v.id);box.appendChild(b)}head.after(box)}
  const actions=w.querySelector('.taur-jfx-actions');if(actions){actions.querySelectorAll('button').forEach(b=>{b.style.minHeight='48px';b.style.width='100%'})}
  const pay=w.querySelector('#jfxPay');if(pay)pay.classList.add('taur-field-primary');
  w.dataset.fieldUx='1';
 }
 const run=()=>enhance();run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();
