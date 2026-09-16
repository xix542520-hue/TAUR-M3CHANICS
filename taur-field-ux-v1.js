/* TAUR FIELD UX V1 — fast job-site context + touch-first controls */
(()=>{
 const KEY='TAUR_M3CHANICS_FINAL_V1';
 const db=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{customers:[],vehicles:[],jobs:[]}}catch{return {customers:[],vehicles:[],jobs:[]}}};
 const openCustomer=id=>{if(id&&typeof window.taurOpenCustomerTimeline==='function')window.taurOpenCustomerTimeline(id)};
 const openVehicle=id=>{if(id&&typeof window.taurOpenVehicleHistory==='function')window.taurOpenVehicleHistory(id)};
 const style=()=>{if(document.getElementById('taur-field-ux-style'))return;const s=document.createElement('style');s.id='taur-field-ux-style';s.textContent=`.taur-field-context{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0}.taur-field-context button{min-height:44px;font-size:11px}.taur-field-quick{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.taur-field-quick button{min-height:46px;font-size:12px}@media(max-width:430px){.taur-field-context{grid-template-columns:1fr}.taur-field-quick{grid-template-columns:1fr}}` ;document.head.appendChild(s)};
 function enhance(){const w=document.querySelector('.taur-jobfile-xip');if(!w||w.dataset.fieldUx)return;const id=w.dataset.jobId||window.taurCurrentJobId;if(!id)return;const d=db(),j=d.jobs.find(x=>x.id===id);if(!j)return;const c=d.customers.find(x=>x.id===j.customerId),v=d.vehicles.find(x=>x.id===j.vehicleId);style();const head=w.querySelector('.taur-jfx-head');if(head){const box=document.createElement('div');box.className='taur-field-context';if(c){const b=document.createElement('button');b.className='secondary';b.textContent='CUSTOMER HISTORY';b.onclick=()=>openCustomer(c.id);box.appendChild(b)}if(v){const b=document.createElement('button');b.className='secondary';b.textContent='VEHICLE HISTORY';b.onclick=()=>openVehicle(v.id);box.appendChild(b)}head.after(box)}const actions=w.querySelector('.taur-jfx-actions');if(actions){actions.querySelectorAll('button').forEach(b=>b.style.minHeight='46px');}w.dataset.fieldUx='1'}
 function run(){enhance()};
 run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();
