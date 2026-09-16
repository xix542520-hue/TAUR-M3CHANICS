/* TAUR XIP JOB FILE V1
   Lightweight drop-in module. Does not alter existing data schema.
   Exposes window.taurXipOpenJobFile(id) for the live app.
*/
(()=>{
 const escX=x=>typeof esc==='function'?esc(x??''):String(x??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
 const moneyX=n=>typeof money==='function'?money(n):'$'+Number(n||0).toFixed(2);
 const JX=id=>typeof J==='function'?J(id):db.jobs.find(x=>x.id===id);
 const paidX=id=>typeof jobPaid==='function'?jobPaid(id):db.payments.filter(p=>p.jobId===id).reduce((n,p)=>n+Number(p.amount||0),0);
 const close=()=>document.querySelector('.taur-jobfile-xip')?.remove();
 function open(id){
  const j=JX(id); if(!j)return;
  const c=typeof C==='function'?C(j.customerId):db.customers.find(x=>x.id===j.customerId);
  const v=typeof V==='function'?V(j.vehicleId):db.vehicles.find(x=>x.id===j.vehicleId);
  const paid=paidX(id), balance=Math.max(0,Number(j.total||0)-paid);
  close();
  const w=document.createElement('div');w.className='taur-jobfile-xip';
  w.innerHTML=`<div class="taur-jfx-card">
   <div class="taur-jfx-head"><div><div class="taur-jfx-title">${escX(j.title||'JOB FILE')}</div><div class="taur-jfx-sub">${escX(c?.name||'No customer')} • ${escX(v?`${v.year} ${v.make} ${v.model}`:'No vehicle')}</div></div><button class="secondary" id="jfxClose">CLOSE</button></div>
   <div class="taur-jfx-grid">
    <div class="taur-jfx-stat"><b>${escX(j.stage||'INTAKE')}</b><span>STAGE</span></div>
    <div class="taur-jfx-stat"><b>${escX(j.status||'OPEN')}</b><span>STATUS</span></div>
    <div class="taur-jfx-stat"><b>${moneyX(j.total)}</b><span>TOTAL</span></div>
    <div class="taur-jfx-stat"><b>${moneyX(balance)}</b><span>BALANCE</span></div>
   </div>
   <section><label>STAGE</label><select id="jfxStage">${stages.map(x=>`<option ${x===j.stage?'selected':''}>${x}</option>`).join('')}</select></section>
   <section><label>STATUS</label><select id="jfxStatus">${statuses.map(x=>`<option ${x===j.status?'selected':''}>${x}</option>`).join('')}</select></section>
   <section class="taur-jfx-money"><div><label>TOTAL</label><input id="jfxTotal" type="number" min="0" step="0.01" value="${Number(j.total||0)}"></div><div><label>LABOR HOURS</label><input id="jfxHours" type="number" min="0" step="0.1" value="${Number(j.laborHours||0)}"></div><div><label>MATERIALS</label><input id="jfxMaterials" type="number" min="0" step="0.01" value="${Number(j.materialsCost||0)}"></div></section>
   <section><label>COMPLAINT / NOTES</label><textarea id="jfxNotes">${escX(j.complaint||'')}</textarea></section>
   <section><label>FOLLOW-UP</label><input id="jfxFollow" type="date" value="${escX(j.followUpDate||'')}"></section>
   <div class="taur-jfx-actions"><button class="secondary" id="jfxSave">SAVE</button><button id="jfxPay">RECORD PAYMENT</button></div>
   <div class="taur-jfx-eff"><b>EFFICIENCY</b><span id="jfxRate">${Number(j.laborHours||0)>0?moneyX(Number(j.total||0)/Number(j.laborHours||0))+'/hr':'Add labor hours'}</span></div>
  </div>`;
  document.body.appendChild(w);
  w.querySelector('#jfxClose').onclick=close;
  const calc=()=>{const h=Number(w.querySelector('#jfxHours').value||0),t=Number(w.querySelector('#jfxTotal').value||0);w.querySelector('#jfxRate').textContent=h>0?moneyX(t/h)+'/hr':'Add labor hours'};
  w.querySelector('#jfxHours').oninput=calc;w.querySelector('#jfxTotal').oninput=calc;
  w.querySelector('#jfxSave').onclick=()=>{j.stage=w.querySelector('#jfxStage').value;j.status=w.querySelector('#jfxStatus').value;j.total=Number(w.querySelector('#jfxTotal').value||0);j.laborHours=Number(w.querySelector('#jfxHours').value||0);j.materialsCost=Number(w.querySelector('#jfxMaterials').value||0);j.complaint=w.querySelector('#jfxNotes').value.trim();j.followUpDate=w.querySelector('#jfxFollow').value;j.updated=new Date().toISOString();save();close();render()};
  w.querySelector('#jfxPay').onclick=()=>{const amount=prompt('Payment amount',String(balance));if(amount===null)return;const n=Number(amount);if(!Number.isFinite(n)||n<=0)return alert('Enter a valid payment.');db.payments.push({id:uid(),jobId:id,amount:n,created:new Date().toISOString(),method:'OTHER'});save();open(id)};
 }
 window.taurXipOpenJobFile=open;
})();
