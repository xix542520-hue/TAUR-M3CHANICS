/* TAUR DATA CONTROLS + TIP LEDGER V2 — exact Job ID controls */
(()=>{
 const escX=x=>typeof esc==='function'?esc(x??''):String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const moneyX=n=>typeof money==='function'?money(n):'$'+Number(n||0).toFixed(2);
 const close=()=>document.querySelector('.taur-dc-modal')?.remove();
 const job=id=>typeof J==='function'?J(id):window.db.jobs.find(x=>x.id===id);
 const customer=id=>typeof C==='function'?C(id):window.db.customers.find(x=>x.id===id);
 const vehicle=id=>typeof V==='function'?V(id):window.db.vehicles.find(x=>x.id===id);
 const saveX=()=>typeof save==='function'?save():localStorage.setItem('TAUR_M3CHANICS_FINAL_V1',JSON.stringify(window.db));
 const paymentsFor=id=>window.TAUR?.payments?.forJob?.(id)||window.db.payments.filter(p=>p.jobId===id);
 const tipFor=id=>paymentsFor(id).reduce((n,p)=>n+Number(p.tip||0),0);
 const detailQcGate=j=>{if(j?.type!=='DETAILING')return {ok:true};if(typeof taurDetailQcCanCompleteV2!=='function')return {ok:false,reason:'QC ENGINE NOT LOADED'};if(j.qc?.status!=='VERIFIED')return {ok:false,reason:'FINAL QC VERIFICATION REQUIRED'};return {ok:true}};
 function modal(title,body,actions){close();const w=document.createElement('div');w.className='taur-dc-modal';w.innerHTML=`<div class="taur-dc-card"><div class="taur-dc-head"><b>${title}</b><button class="secondary" id="dcClose">CLOSE</button></div>${body}<div class="taur-dc-actions">${actions||''}</div></div>`;document.body.appendChild(w);w.querySelector('#dcClose').onclick=close;w.addEventListener('click',e=>{if(e.target===w)close()});return w}
 function tipPayment(id){const j=job(id);if(!j)return;const quoted=Number(j.total||0),paid=typeof jobPaid==='function'?jobPaid(id):paymentsFor(id).reduce((n,p)=>n+Number(p.amount||0),0),tip=tipFor(id),balance=Math.max(0,quoted-paid);const w=modal('RECORD PAYMENT + TIP',`<div class="taur-dc-stats"><div><b>${moneyX(quoted)}</b><span>QUOTE</span></div><div><b>${moneyX(balance)}</b><span>QUOTE BALANCE</span></div><div><b>${moneyX(tip)}</b><span>TIPS TO DATE</span></div></div><div class="taur-dc-grid"><div><label>PAYMENT TOWARD QUOTE</label><input id="dcBase" type="number" min="0" step="0.01" value="${balance.toFixed(2)}"></div><div><label>TIP</label><input id="dcTip" type="number" min="0" step="0.01" value="0.00"></div><div class="taur-dc-full"><label>METHOD</label><select id="dcMethod"><option>CASH</option><option>CARD</option><option>VENMO</option><option>CASH APP</option><option>ZELLE</option><option>OTHER</option></select></div></div><div class="taur-dc-hint">Tip is tracked separately from the quoted job price.</div>`,`<button class="secondary" id="dcCancel">CANCEL</button><button id="dcSave">RECORD</button>`);w.querySelector('#dcCancel').onclick=close;w.querySelector('#dcSave').onclick=async()=>{const base=Number(w.querySelector('#dcBase').value||0),t=Number(w.querySelector('#dcTip').value||0);if(!Number.isFinite(base)||base<0||!Number.isFinite(t)||t<0||base+t<=0)return alert('Enter a payment and/or tip.');if(base>balance)return alert('Quote payment cannot exceed the remaining quote balance. Put the extra amount in TIP.');const paymentData={jobId:id,amount:base+t,baseAmount:base,tip:t,created:new Date().toISOString(),method:w.querySelector('#dcMethod').value};const coreAvailable=typeof window.TAUR?.payments?.create==='function';const payment=coreAvailable?window.TAUR.payments.create(paymentData):null;if(coreAvailable&&!payment)return alert('Payment was rejected by the Data Core; nothing was recorded.');if(!coreAvailable){return alert('TAUR Data Core is unavailable; payment recording is disabled to protect canonical data.');}const cloudSync=window.taurCloud&&typeof window.taurCloud.sync==='function'?window.taurCloud.sync():null;if(cloudSync&&typeof cloudSync.then==='function')await cloudSync;close();if(typeof taurXipOpenJobFile==='function')taurXipOpenJobFile(id);else if(typeof render==='function')render()}}
 function editJob(id){
  const j=job(id);if(!j)return;
  const pricing=window.TAUR?.pricebook?.list?.()||(()=>{try{const x=JSON.parse(localStorage.getItem('TAUR_PRICEBOOK_V1')||'[]');return Array.isArray(x)?x:[]}catch{return []}})();
  const currentPicks=Array.isArray(j.priceBookSelections)?j.priceBookSelections:(Array.isArray(j.addOns)?j.addOns:[]);
  const customerOptions=(window.TAUR?.customers?.list?.()||window.db.customers||[]).map(c=>`<option value="${escX(c.id)}" ${c.id===j.customerId?'selected':''}>${escX(c.name||'Unnamed customer')}</option>`).join('');
  const vehicleOptions=()=>`<option value="">No vehicle</option>${(window.db.vehicles||[]).filter(v=>!wCustomer||v.customerId===wCustomer).map(v=>`<option value="${escX(v.id)}" ${v.id===j.vehicleId?'selected':''}>${escX([v.year,v.make,v.model].filter(Boolean).join(' ')||'Vehicle')}</option>`).join('')}`;
  const type=j.type||'MECHANICS';
  const services=pricing.filter(x=>x.type===type);
  const pickIds=new Set(currentPicks.map(x=>x?.id).filter(Boolean));
  const serviceCards=services.map(x=>`<label class="taur-dc-pick"><input type="checkbox" data-pick="${escX(x.id)}" ${pickIds.has(x.id)?'checked':''}><span><b>${escX(x.name)}</b><small>${moneyX(x.price)} • ${escX(x.description||'')}</small></span><strong>${moneyX(x.price)}</strong></label>`).join('');
  const w=modal('EDIT JOB',`<div class="taur-dc-grid">
    <div class="taur-dc-full"><label>CUSTOMER</label><select id="eCustomer"><option value="">No customer</option>${customerOptions}</select></div>
    <div class="taur-dc-full"><label>VEHICLE</label><select id="eVehicle"><option value="">No vehicle</option></select></div>
    <div><label>DIVISION</label><select id="eType"><option value="MECHANICS" ${type==='MECHANICS'?'selected':''}>MECHANIC</option><option value="DETAILING" ${type==='DETAILING'?'selected':''}>DETAILING</option></select></div>
    <div><label>LEAD SOURCE</label><select id="eLead"><option value="">Not specified</option>${['D2D','CARD','REFERRAL','ONLINE','EXISTING TAUR CUSTOMER','OTHER'].map(x=>`<option ${x===(j.leadSource||'')?'selected':''}>${x}</option>`).join('')}</select></div>
    <div class="taur-dc-full"><label>JOB / SERVICE</label><input id="eTitle" value="${escX(j.title||'')}"></div>
    <div class="taur-dc-full"><label>SERVICE PACKAGE / ADD-ONS</label><div id="ePackages" class="taur-dc-picks">${serviceCards||'<div class="taur-dc-hint">No price-book services for this division.</div>'}</div><div class="taur-dc-hint">Selecting services updates the total. Leave selections alone to preserve a custom/manual total.</div></div>
    <div><label>STAGE</label><select id="eStage">${(stages||[]).map(x=>`<option ${x===j.stage?'selected':''}>${escX(x)}</option>`).join('')}</select></div>
    <div><label>STATUS</label><select id="eStatus">${(statuses||[]).map(x=>`<option ${x===j.status?'selected':''}>${escX(x)}</option>`).join('')}</select></div>
    <div><label>QUOTE / TOTAL</label><input id="eTotal" type="number" min="0" step="0.01" value="${Number(j.total||0)}"></div>
    <div><label>LABOR HOURS</label><input id="eHours" type="number" min="0" step="0.1" value="${Number(j.laborHours||0)}"></div>
    <div><label>MATERIALS COST</label><input id="eMaterials" type="number" min="0" step="0.01" value="${Number(j.materialsCost||0)}"></div>
    <div><label>FOLLOW-UP</label><input id="eFollow" type="date" value="${escX(j.followUpDate||'')}"></div>
    <div><label>CONDITION</label><select id="eCondition"><option value="">Not specified</option>${['C1 Maintenance','C2 Moderate','C3 Heavy','C4 Extreme'].map(x=>`<option ${x===(j.condition||'')?'selected':''}>${x}</option>`).join('')}</select></div>
    <div><label>VEHICLE SIZE</label><select id="eSize"><option value="">Not specified</option>${['Sedan / Coupe','SUV / Crossover','Truck / Large SUV'].map(x=>`<option ${x===(j.vehicleSize||'')?'selected':''}>${x}</option>`).join('')}</select></div>
    <div class="taur-dc-full"><label>NOTES / CUSTOMER CONCERN</label><textarea id="eNotes">${escX(j.complaint||'')}</textarea></div>
  </div>`,`<button class="secondary" id="dcCancel">CANCEL</button><button id="dcSave">SAVE CHANGES</button>`);
  let wCustomer=j.customerId||'';
  const refreshVehicles=()=>{const sel=w.querySelector('#eVehicle');sel.innerHTML=vehicleOptions();};
  refreshVehicles();
  w.querySelector('#eCustomer').onchange=e=>{wCustomer=e.target.value;refreshVehicles();};
  const typeEl=w.querySelector('#eType'),packages=w.querySelector('#ePackages');
  const refillPackages=()=>{
    const t=typeEl.value;
    const picks=Array.isArray(j.__editPackageSelection)?j.__editPackageSelection:currentPicks;
    packages.innerHTML=pricing.filter(x=>x.type===t).map(x=>`<label class="taur-dc-pick"><input type="checkbox" data-pick="${escX(x.id)}" ${picks.some(p=>p?.id===x.id)?'checked':''}><span><b>${escX(x.name)}</b><small>${moneyX(x.price)} • ${escX(x.description||'')}</small></span><strong>${moneyX(x.price)}</strong></label>`).join('')||'<div class="taur-dc-hint">No price-book services for this division.</div>';
    packages.querySelectorAll('[data-pick]').forEach(box=>box.onchange=()=>{
      const selected=[...packages.querySelectorAll('[data-pick]:checked')].map(b=>pricing.find(x=>x.id===b.dataset.pick)).filter(Boolean);
      j.__editPackageSelection=selected;
      const sum=selected.reduce((n,x)=>n+Number(x.price||0),0);
      w.querySelector('#eTotal').value=sum.toFixed(2)
    });
  };
  typeEl.onchange=()=>{j.__editPackageSelection=[];refillPackages();};
  refillPackages();
  w.querySelector('#dcCancel').onclick=close;
  w.querySelector('#dcSave').onclick=()=>{
    const nextStage=w.querySelector('#eStage').value,nextStatus=w.querySelector('#eStatus').value,nextType=typeEl.value;
    if(nextType==='DETAILING'&&(nextStage==='COMPLETE'||nextStatus==='COMPLETE')){const gate=detailQcGate({...j,type:nextType});if(!gate.ok)return alert(gate.reason+'. Use VERIFY FINAL QC before completing this detail job.')}
    const selected=j.__editPackageSelection;
    const patch={
      customerId:w.querySelector('#eCustomer').value,
      vehicleId:w.querySelector('#eVehicle').value,
      type:nextType,
      title:w.querySelector('#eTitle').value.trim()||'Untitled Job',
      stage:nextStage,status:nextStatus,
      total:Math.max(0,Number(w.querySelector('#eTotal').value||0)),
      laborHours:Math.max(0,Number(w.querySelector('#eHours').value||0)),
      materialsCost:Math.max(0,Number(w.querySelector('#eMaterials').value||0)),
      complaint:w.querySelector('#eNotes').value.trim(),
      followUpDate:w.querySelector('#eFollow').value,
      condition:w.querySelector('#eCondition').value,
      vehicleSize:w.querySelector('#eSize').value,
      leadSource:w.querySelector('#eLead').value
    };
    if(Array.isArray(selected)){
      patch.priceBookSelections=selected.map(x=>({id:x.id,name:x.name,price:Number(x.price||0),type:x.type}));
      patch.addOns=patch.priceBookSelections.slice();
    }else if(nextType!==type){
      patch.priceBookSelections=[];patch.addOns=[];
    }
    const coreAvailable=typeof window.TAUR?.jobs?.update==='function';const updated=coreAvailable?window.TAUR.jobs.update(id,patch):null;if(coreAvailable&&!updated)return alert('Job update was rejected by the Data Core; nothing was changed.');
    if(!coreAvailable)return alert('TAUR Data Core is unavailable; job updates are disabled to protect canonical data.');
    delete j.__editPackageSelection;
    close();render();
  };
 }
 function delJob(id){const j=job(id);if(!j)return;if(!confirm(`DELETE JOB?\n\n${j.title||'Untitled Job'}\n\nThis removes the job only. Linked payment/history records are preserved.`))return;if(typeof window.TAUR?.jobs?.remove!=='function')return alert('TAUR Data Core is unavailable; job deletion is disabled to protect history.');const removed=window.TAUR.jobs.remove(id);if(!removed)return alert('This job has linked records. Remove or reassign those records first so TAUR does not orphan history.');close();render()}
 function delCustomer(id){const c=customer(id);if(!c)return;const hasJobs=window.db.jobs.some(j=>j.customerId===id),hasVehicles=window.db.vehicles.some(v=>v.customerId===id),hasReferrals=window.db.referrals?.some(r=>r.customerId===id);if(hasJobs||hasVehicles||hasReferrals)return alert('This customer has linked vehicles, jobs, or referrals. Delete or reassign those records first.');if(!confirm(`DELETE CUSTOMER?\n\n${c.name||'Unnamed customer'}`))return;const coreAvailable=typeof window.TAUR?.customers?.remove==='function';const removed=coreAvailable?window.TAUR.customers.remove(id):null;if(coreAvailable&&!removed)return alert('Customer deletion was rejected by the Data Core; nothing was changed.');if(!coreAvailable)return alert('TAUR Data Core is unavailable; customer deletion is disabled to protect canonical data.');render()}
 function delVehicle(id){const v=vehicle(id);if(!v)return;const hasJobs=(window.TAUR?.jobs?.list?.()||window.db.jobs).some(j=>j.vehicleId===id),hasReferrals=(window.TAUR?.referrals?.list?.()||window.db.referrals||[]).some(r=>r.vehicleId===id);if(hasJobs||hasReferrals)return alert('This vehicle has linked jobs or referrals. Delete or reassign those records first.');if(!confirm(`DELETE VEHICLE?\n\n${v.year||''} ${v.make||''} ${v.model||''}`))return;const coreAvailable=typeof window.TAUR?.vehicles?.remove==='function';const removed=coreAvailable?window.TAUR.vehicles.remove(id):null;if(coreAvailable&&!removed)return alert('Vehicle deletion was rejected by the Data Core; nothing was changed.');if(!coreAvailable)return alert('TAUR Data Core is unavailable; vehicle deletion is disabled to protect canonical data.');render()}
 function enhanceJobFile(){const m=document.querySelector('.taur-jobfile-xip');if(!m)return;const id=m.dataset.jobId||window.taurCurrentJobId||'';const jx=id?job(id):null;if(!jx)return;const pay=m.querySelector('#jfxPay');if(pay&&!pay.dataset.dcTip){pay.onclick=()=>tipPayment(jx.id);pay.dataset.dcTip='1'}if(!m.querySelector('#jfxEdit')){const a=m.querySelector('.taur-jfx-actions');if(a){const e=document.createElement('button');e.className='secondary';e.id='jfxEdit';e.textContent='EDIT';e.onclick=()=>editJob(jx.id);const d=document.createElement('button');d.className='danger';d.id='jfxDelete';d.textContent='DELETE';d.onclick=()=>delJob(jx.id);a.insertBefore(e,a.firstChild);a.appendChild(d)}}}
 function augment(){document.querySelectorAll('.item').forEach(item=>{if(item.dataset.dcDone)return;const buttons=[...item.querySelectorAll('button')],edit=buttons.find(b=>b.textContent.trim()==='EDIT');if(edit){const onclick=edit.getAttribute('onclick')||'';const m=onclick.match(/editCustomer\('([^']+)'\)/)||onclick.match(/editVehicle\('([^']+)'\)/);if(m){const isC=onclick.includes('editCustomer');const d=document.createElement('button');d.className='danger';d.textContent='DELETE';d.onclick=()=>isC?delCustomer(m[1]):delVehicle(m[1]);edit.parentElement.appendChild(d)}}const open=buttons.find(b=>b.textContent.trim()==='OPEN FILE');if(open){const onclick=open.getAttribute('onclick')||'';const m=onclick.match(/jobFile\('([^']+)'\)/);if(m){const id=m[1];open.onclick=e=>{e.preventDefault();if(typeof taurXipOpenJobFile==='function')taurXipOpenJobFile(id);else if(typeof jobFile==='function')jobFile(id)}}}item.dataset.dcDone='1'});enhanceJobFile()}
 function mountStyle(){if(document.getElementById('taur-dc-style'))return;const s=document.createElement('style');s.id='taur-dc-style';s.textContent=`.taur-dc-modal{position:fixed;inset:0;z-index:130;background:rgba(0,0,0,.84);display:flex;align-items:flex-end;justify-content:center}.taur-dc-card{width:100%;max-width:650px;max-height:94vh;overflow:auto;background:#101010;border:1px solid #333;border-radius:18px 18px 0 0;padding:16px 14px calc(22px + env(safe-area-inset-bottom));box-shadow:0 -18px 50px rgba(0,0,0,.55)}.taur-dc-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:18px}.taur-dc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.taur-dc-full{grid-column:1/-1}.taur-dc-card input,.taur-dc-card select,.taur-dc-card textarea{margin:3px 0 8px}.taur-dc-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.taur-dc-actions button{width:100%}.taur-dc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:10px}.taur-dc-stats div{background:#171717;border:1px solid #303030;border-radius:10px;padding:9px}.taur-dc-stats b{display:block;font-size:16px}.taur-dc-stats span{font-size:9px;color:#999}.taur-dc-hint{font-size:10px;color:#999;margin:3px 0 8px}.taur-dc-picks{display:grid;gap:7px;margin:4px 0 8px}.taur-dc-pick{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:9px;background:#151515;border:1px solid #303030;border-radius:10px;padding:9px;cursor:pointer}.taur-dc-pick input{min-height:20px;margin:0}.taur-dc-pick b,.taur-dc-pick small{display:block}.taur-dc-pick small{font-size:10px;color:#888;margin-top:2px}.taur-dc-pick>strong{font-size:12px}@media(max-width:430px){.taur-dc-grid{grid-template-columns:1fr}.taur-dc-full{grid-column:auto}.taur-dc-stats{grid-template-columns:1fr 1fr}.taur-dc-stats div:last-child{grid-column:1/-1}}`;document.head.appendChild(s)}
 function patch(){mountStyle();augment();window.taurEditJob=editJob;window.taurDeleteJob=delJob;window.taurRecordPayment=tipPayment;window.taurDeleteCustomer=delCustomer;window.taurDeleteVehicle=delVehicle;const oldRender=window.render;if(oldRender&&!oldRender.__taurDC){const r=oldRender;window.render=function(){r();setTimeout(augment,0)};window.render.__taurDC=true}}
 window.taurDataControlsReady=true;patch();new MutationObserver(()=>{augment();enhanceJobFile()}).observe(document.body,{childList:true,subtree:true});
})();