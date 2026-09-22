/* TAUR NEW JOB LINKING V2 — exact customer/vehicle IDs + direct Job File handoff */
(()=>{
 const core=()=>window.TAUR||null,read=()=>{const t=core();return {customers:t?.customers?.list?.()||[],vehicles:t?.vehicles?.list?.()||[],jobs:t?.jobs?.list?.()||[]}};
 const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const label=v=>[v.year,v.make,v.model].filter(Boolean).join(' ')||'Vehicle';
 function inject(){
  const m=document.querySelector('.taur-xip-modal');
  if(!m||m.querySelector('#taurNewJobCustomer'))return;
  const type=m.querySelector('#xType'),title=m.querySelector('#xTitle');
  if(!type||!title)return;
  const d=read();
  const wrap=document.createElement('div');wrap.className='taur-xip-full';
  wrap.innerHTML=`<label>CUSTOMER</label><select id="taurNewJobCustomer"><option value="">NO CUSTOMER / ADD LATER</option>${(d.customers||[]).map(c=>`<option value="${esc(c.id)}">${esc(c.name||'Unnamed')} · ${esc(c.phone||'No phone')}</option>`).join('')}</select><label>VEHICLE</label><select id="taurNewJobVehicle"><option value="">NO VEHICLE / ATTACH LATER</option></select><div style="font-size:9px;color:#888;margin:-2px 0 8px">Vehicle list is filtered to the selected customer. Existing records are never duplicated.</div>`;
  title.parentElement.parentElement.parentElement.insertBefore(wrap,title.parentElement.parentElement);
  const cs=m.querySelector('#taurNewJobCustomer'),vs=m.querySelector('#taurNewJobVehicle');
  const fill=()=>{const now=read(),cid=cs.value;vs.innerHTML='<option value="">NO VEHICLE / ATTACH LATER</option>'+(now.vehicles||[]).filter(v=>v.customerId===cid).map(v=>`<option value="${esc(v.id)}">${esc(label(v))} · ${esc(v.mileage||'')} mi</option>`).join('')};
  cs.onchange=fill;fill();
  const buttons=[...m.querySelectorAll('button')],saveBtn=buttons.find(b=>/SAVE|CREATE|ADD JOB/i.test(b.textContent.trim())&&!/CLOSE|CANCEL/i.test(b.textContent.trim()));
  if(!saveBtn)return;
  saveBtn.addEventListener('click',()=>{
   const cid=cs.value,vid=vs.value,before=new Set(read().jobs.map(j=>j.id));
   setTimeout(()=>{
    const d2=read(),created=(d2.jobs||[]).filter(j=>!before.has(j.id));
    const j=created[created.length-1];if(!j)return;
    if(cid){const patch={customerId:cid,updated:new Date().toISOString()};if(vid&&d2.vehicles.some(v=>v.id===vid&&v.customerId===cid))patch.vehicleId=vid;const updated=core()?.jobs?.update?.(j.id,patch);if(core()?.jobs?.update&&!updated){alert('TAUR Data Core rejected the job links.');return;}}
    if(typeof render==='function')render();
    setTimeout(()=>{if(typeof taurXipOpenJobFile==='function')taurXipOpenJobFile(j.id)},0);
   },40);
  },{once:true});
 }
 const boot=()=>{inject();new MutationObserver(inject).observe(document.body,{childList:true,subtree:true})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
