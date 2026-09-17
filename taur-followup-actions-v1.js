/* TAUR FOLLOW-UP ACTIONS V1 — exact Job ID handoff */
(()=>{
 const openJob=id=>{if(!id)return;if(typeof window.taurXipOpenJobFile==='function')window.taurXipOpenJobFile(id);else if(typeof window.jobFile==='function')window.jobFile(id)};
 const mount=()=>{
  const w=document.getElementById('taurOps');
  if(!w)return;
  w.querySelectorAll('.to-row').forEach(row=>{
   if(row.dataset.taurFollowAction)return;
   const text=row.textContent||'';
   const jobs=(()=>{try{const d=JSON.parse(localStorage.getItem('TAUR_M3CHANICS_FINAL_V1')||'{}');return d.jobs||[]}catch{return []}})();
   const hit=jobs.find(j=>text.includes(j.title||'__never__') && text.includes(j.followUpDate||'__never__'));
   if(!hit)return;
   const b=document.createElement('button');b.className='ghost';b.textContent='OPEN JOB FILE';b.style.marginTop='7px';b.onclick=()=>openJob(hit.id);row.appendChild(b);row.dataset.taurFollowAction='1';
  });
 };
 mount();new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
})();
