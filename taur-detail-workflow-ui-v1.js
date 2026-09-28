/* TAUR DETAIL WORKFLOW UI V1
 * Lightweight stage/QC controls for the existing Job File.
 */
(()=> {
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const escW=x=>typeof esc==='function'?esc(x??''):String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const close=()=>document.querySelector('.taur-flow-modal')?.remove();
  const open=jobId=>{
    const j=root.jobs?.get?.(jobId);if(!j||j.type!=='DETAILING')return;
    const wf=root.detailWorkflow;if(!wf)return;
    const req=wf.requirements(jobId), stages=wf.stages(), allowed=wf.allowed()[j.stage||'INTAKE']||[];
    const modal=document.createElement('div');modal.className='taur-flow-modal';
    modal.innerHTML=`<div class="taur-flow-card"><div class="row"><div><b>DETAIL WORKFLOW</b><div class="muted">${escW(j.title||'Detail Job')}</div></div><button class="secondary" id="flowClose">CLOSE</button></div>
      <div class="taur-flow-track">${stages.map(s=>`<span class="${s===(j.stage||'INTAKE')?'current':''} ${stages.indexOf(s)<stages.indexOf(j.stage||'INTAKE')?'done':''}">${escW(s.replace('_',' '))}</span>`).join('')}</div>
      <div class="taur-flow-grid"><div><b>SERVICE</b><span>${escW(j.serviceName||j.serviceId||'NOT DEFINED')}</span></div><div><b>QC</b><span>${escW(j.qcStatus||'PENDING')}</span></div><div><b>QUOTE</b><span>${req.quoteExists?'EXISTS':'MISSING'}</span></div><div><b>NEXT</b><span>${allowed.map(escW).join(' · ')||'NONE'}</span></div></div>
      <div class="taur-flow-actions">${allowed.map(s=>`<button data-next="${escW(s)}">${escW(s==='QC'?'OPEN QC':s==='APPROVE'?'APPROVE QUOTE':'ADVANCE → '+s.replace('_',' '))}</button>`).join('')}</div>
      <div class="taur-flow-qc" style="display:${j.stage==='QC'?'block':'none'}"><b>QC GATE</b><textarea id="flowQcNote" placeholder="Record inspection result, remaining defects, rework required…">${escW(j.qcNote||'')}</textarea><div class="taur-flow-actions"><button id="flowFail" class="secondary">FAIL / REWORK</button><button id="flowPass">PASS QC</button></div></div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#flowClose').onclick=close;
    modal.querySelectorAll('[data-next]').forEach(btn=>btn.onclick=()=>{
      const to=btn.dataset.next;
      if(to==='BOOK'){close();return window.taurOpenDetailBooking?.(jobId,()=>{const r=wf.transition(jobId,'BOOK');if(!r.ok)return alert(r.message);open(jobId);});}
      if(to==='QC'){const r=wf.transition(jobId,to);if(!r.ok)return alert(r.message);close();open(jobId);return}
      if(to==='APPROVE'){const r=wf.transition(jobId,to);if(!r.ok)return alert(r.message);close();open(jobId);return}
      const r=wf.transition(jobId,to);if(!r.ok)return alert(r.message);close();open(jobId);
    });
    modal.querySelector('#flowPass')?.addEventListener('click',()=>{const r=wf.setQC(jobId,'PASS',modal.querySelector('#flowQcNote').value.trim());if(!r.ok)return alert(r.message);const a=wf.transition(jobId,'COMPLETE');if(!a.ok){close();open(jobId);return alert(a.message)}close();if(typeof taurXipOpenJobFile==='function')taurXipOpenJobFile(jobId)});
    modal.querySelector('#flowFail')?.addEventListener('click',()=>{const r=wf.setQC(jobId,'REWORK',modal.querySelector('#flowQcNote').value.trim());if(!r.ok)return alert(r.message);close();open(jobId)});
  };
  window.taurOpenDetailWorkflow=open;
})();
