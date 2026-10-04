/* TAUR QUOTE BUILDER V1
 * Service definition -> scope snapshot -> quote record.
 * Price values remain sourced from the shared price book.
 */
(()=> {
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const escQ=x=>typeof esc==='function'?esc(x??''):String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const moneyQ=n=>typeof money==='function'?money(n):'$'+Number(n||0).toFixed(2);
  const close=()=>document.querySelector('.taur-qb-modal')?.remove();
  const serviceBook=()=>root.serviceCatalog?.list?.()||[];
  const conditions=()=>root.serviceCatalog?.conditions?.()||[];
  const sizes=()=>root.serviceCatalog?.sizes?.()||[];

  function openQuote(jobId){
    const job=root.jobs?.get?.(jobId)||null;
    if(!job)return;
    const existing=(root.quotes?.listByJob?.(jobId)||[]).slice().reverse()[0]||null;
    const catalog=serviceBook(), current=job.serviceId||existing?.serviceId||'';
    const currentService=catalog.find(s=>s.id===current)||catalog[0];
    const currentCondition=job.inspectionCondition||job.condition||existing?.condition||'C1 — MAINTENANCE';
    const currentSize=job.vehicleSize||existing?.vehicleSize||'SEDAN / COUPE';
    const inspectionFindings=job.inspectionFindings||[];
    const inspectionExclusions=job.inspectionExclusions||[];
    const lineItems=existing?.lineItems||job.priceBookSelections||[];
    const selectedIds=new Set(lineItems.map(x=>x.id));
    const body=`<div class="taur-qb-grid">
      <div class="taur-qb-full"><label>SERVICE DEFINITION</label><select id="qbService">${catalog.map(s=>`<option value="${escQ(s.id)}" ${s.id===(currentService?.id||'')?'selected':''}>${escQ(s.id+' — '+s.name)}</option>`).join('')}</select></div>
      <div><label>CONDITION</label><select id="qbCondition">${conditions().map(c=>`<option value="${escQ(c.id)}" ${c.id===currentCondition?'selected':''}>${escQ(c.label)}</option>`).join('')}</select></div>
      <div><label>VEHICLE SIZE</label><select id="qbSize">${sizes().map(s=>`<option ${s===currentSize?'selected':''}>${escQ(s)}</option>`).join('')}</select></div>
      <div class="taur-qb-full"><label>PRICE-BOOK ITEMS</label><div id="qbItems" class="taur-qb-items"></div></div>
      <div><label>LABOR TARGET (HRS)</label><input id="qbLabor" type="number" min="0" step=".1" value="${Number(existing?.laborHours??job.laborHours??0)}"></div>
      <div><label>MATERIAL ESTIMATE</label><input id="qbMaterials" type="number" min="0" step=".01" value="${Number(existing?.materialsCost??job.materialsCost??0)}"></div>
      <div><label>TRAVEL (MIN)</label><input id="qbTravel" type="number" min="0" step="1" value="${Number(existing?.travelMinutes??job.travelMinutes??0)}"></div>
      <div><label>QUOTE TOTAL</label><input id="qbTotal" type="number" min="0" step=".01" value="${Number(existing?.total??job.total??0)}"></div>
      <div class="taur-qb-full"><div id="qbScope" class="taur-qb-scope"></div></div><div class="taur-qb-full"><div class="taur-qb-scope"><b>INSPECTION HANDOFF</b><div class="small">Condition: ${escQ(currentCondition)} • Findings: ${inspectionFindings.length} • Exclusions: ${inspectionExclusions.length}</div></div></div>
      <div class="taur-qb-full"><label>QUOTE NOTE / SCOPE CHANGE</label><textarea id="qbNote" placeholder="Document why the quote differs from the standard definition.">${escQ(existing?.note||'')}</textarea></div>
      <div class="taur-qb-full"><div id="qbWarning" class="taur-qb-warning"></div></div>
    </div>`;
    close();
    const w=document.createElement('div');w.className='taur-qb-modal';w.innerHTML=`<div class="taur-qb-card"><div class="taur-qb-head"><b>QUOTE BUILDER</b><button class="secondary" id="qbClose">CLOSE</button></div>${body}<div class="taur-qb-actions"><button class="secondary" id="qbSaveDraft">SAVE DRAFT</button><button id="qbSaveQuote">SAVE QUOTE</button></div></div>`;
    document.body.appendChild(w);
    const svc=w.querySelector('#qbService'),cond=w.querySelector('#qbCondition'),items=w.querySelector('#qbItems'),scope=w.querySelector('#qbScope'),warning=w.querySelector('#qbWarning'),total=w.querySelector('#qbTotal');

    function refreshItems(){
      const type=job.type||'DETAILING';
      const pb=(root.pricebook?.list?.()||[]).filter(x=>x.type===type);
      items.innerHTML=pb.map(x=>`<label class="taur-qb-item"><input type="checkbox" data-id="${escQ(x.id)}" ${selectedIds.has(x.id)?'checked':''}><span><b>${escQ(x.name)}</b><small>${moneyQ(x.price)}</small></span></label>`).join('')||'<div class="muted">No price-book items for this division.</div>';
      items.querySelectorAll('[data-id]').forEach(box=>box.onchange=updateTotal);
      updateTotal();
    }
    function updateTotal(){
      const pb=root.pricebook?.list?.()||[];
      const picks=[...items.querySelectorAll('input[data-id]:checked')].map(b=>pb.find(x=>x.id===b.dataset.id)).filter(Boolean);
      const sum=picks.reduce((n,x)=>n+Number(x.price||0),0);
      if(!existing && sum>0)total.value=sum.toFixed(2);
      w.__quoteItems=picks.map(x=>({id:x.id,name:x.name,type:x.type,price:Number(x.price||0)}));
    }
    function refreshScope(){
      const s=catalog.find(x=>x.id===svc.value);
      if(!s){scope.innerHTML='';return}
      scope.innerHTML=`<div class="taur-qb-scope-title">${escQ(s.id)} — ${escQ(s.name)} <span class="badge">${escQ(s.family)}</span></div>
        <div class="taur-qb-columns"><div><b>PURPOSE</b><p>${escQ(s.purpose)}</p><b>INCLUDED</b><ul>${s.procedures.map(x=>'<li>'+escQ(x)+'</li>').join('')}</ul></div><div><b>EXCLUSIONS</b><ul>${s.exclusions.map(x=>'<li>'+escQ(x)+'</li>').join('')}</ul><b>QC</b><ul>${s.qc.map(x=>'<li>'+escQ(x)+'</li>').join('')}</ul></div></div>`;
      validate();
    }
    function validate(){
      const s=catalog.find(x=>x.id===svc.value),c=cond.value;
      const result=root.serviceCatalog?.validate?.(svc.value,c);
      if(!result?.ok){warning.textContent='Selected service does not support this condition. Choose another service or condition.';return false}
      const extreme=c==='C4 — EXTREME / INSPECTION REQUIRED';
      const inspected=job.inspectionStatus==='COMPLETE' && job.inspectionScopeApproved===true;
      warning.textContent=extreme&&!inspected?'C4 requires a completed, explicitly scoped inspection before approval. Save as DRAFT until inspection is complete.':extreme?'C4 inspection complete. Fixed quote may proceed with the documented scope.':'Scope is traceable to the selected service definition. Price remains editable from the price book and field data.';
      return !extreme||inspected;
    }
    function saveQuote(status){
      const service=catalog.find(x=>x.id===svc.value), ok=!!service;
      if(!ok)return alert('Select a service definition.');
      const fixedOk=validate();
      if(status==='APPROVED'&&!fixedOk)return alert('Complete and explicitly scope the inspection before approving this quote.');
      const quoteData={
        jobId:jobId,customerId:job.customerId,vehicleId:job.vehicleId,status,
        serviceId:service.id,serviceVersion:service.version,serviceName:service.name,serviceFamily:service.family,
        condition:cond.value,vehicleSize:w.querySelector('#qbSize').value,
        serviceSnapshot:root.serviceCatalog.snapshot(service.id),
        lineItems:w.__quoteItems||[],total:Number(total.value||0),
        laborHours:Number(w.querySelector('#qbLabor').value||0),
        materialsCost:Number(w.querySelector('#qbMaterials').value||0),
        travelMinutes:Number(w.querySelector('#qbTravel').value||0),
        note:w.querySelector('#qbNote').value.trim(),updated:new Date().toISOString()
      };
      let q;
      if(existing && root.quotes?.update)q=root.quotes.update(existing.id,quoteData);
      else if(root.quotes?.create)q=root.quotes.create(quoteData);
      else q=null;
      if(!q)return alert('Quote was rejected by the Data Core; nothing was changed.');
      // Saving a quote must not silently rewrite a manually fixed Job File total.
      // The quote owns its own total; the job only receives quote metadata/scope.
      if(root.jobs?.update){
        const patch={serviceId:service.id,serviceVersion:service.version,serviceFamily:service.family,condition:cond.value,vehicleSize:w.querySelector('#qbSize').value,priceBookSelections:w.__quoteItems||[],laborHours:Number(w.querySelector('#qbLabor').value||0),materialsCost:Number(w.querySelector('#qbMaterials').value||0),travelMinutes:Number(w.querySelector('#qbTravel').value||0),quoteId:q.id};
        const updatedJob=root.jobs.update(jobId,patch);
        if(!updatedJob)return alert('Quote saved, but the Job File metadata update was rejected.');
      }
      close();if(typeof taurXipOpenJobFile==='function')taurXipOpenJobFile(jobId);else if(typeof jobFile==='function')jobFile(jobId);
    }
    w.querySelector('#qbClose').onclick=close;
    w.querySelector('#qbSaveDraft').onclick=()=>saveQuote('DRAFT');
    w.querySelector('#qbSaveQuote').onclick=()=>saveQuote('SENT');
    svc.onchange=()=>{refreshScope();refreshItems()};
    cond.onchange=validate;
    refreshScope();refreshItems();
  }
  window.taurOpenQuoteBuilder=openQuote;
  if(root.on)root.on('DATA_CORE_READY',()=>root.emit('QUOTE_BUILDER_READY',{version:'1.0.0'}));
})();
