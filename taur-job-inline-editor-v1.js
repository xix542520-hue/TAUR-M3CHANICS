/* TAUR INLINE JOB EDITOR V1
 * Small direct-edit surface for the Job File.
 */
(()=>{
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const esc=x=>String(x??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  function open(id){
    const j=root.jobs?.get?.(id);
    if(!j)return alert('Job record not found.');
    const existing=document.getElementById('taurInlineJobEditor');
    existing?.remove();
    const d=document.createElement('div');
    d.id='taurInlineJobEditor';
    d.style.cssText='position:fixed;inset:0;z-index:5450;background:rgba(0,0,0,.82);overflow:auto;padding:18px';
    const fields=(Array.isArray(j.customFields)?j.customFields:[]);
    d.innerHTML='<div class="card" style="max-width:680px;margin:20px auto">'+
      '<div class="row"><h2>EDIT DETAILS</h2><button class="ghost" id="tieClose">CLOSE</button></div>'+
      '<label>TITLE</label><input id="tieTitle" value="'+esc(j.title)+'">'+
      '<label>COMPLAINT / WORK</label><textarea id="tieComplaint" style="min-height:110px">'+esc(j.complaint)+'</textarea>'+
      '<label>NOTES</label><textarea id="tieNotes" style="min-height:110px">'+esc(j.notes)+'</textarea>'+
      '<label>FREEFORM JOB DETAILS</label><textarea id="tieFreeform" style="min-height:150px">'+esc(j.freeformDetails)+'</textarea>'+
      '<div class="row" style="margin-top:10px"><button class="secondary" id="tieFull">OPEN FULL EDITOR</button><button id="tieSave">SAVE DETAILS</button></div>'+
      '</div>';
    document.body.appendChild(d);
    d.querySelector('#tieClose').onclick=()=>d.remove();
    d.querySelector('#tieFull').onclick=()=>{d.remove();window.taurEditJob?.(id);};
    d.querySelector('#tieSave').onclick=()=>{
      const patch={
        title:d.querySelector('#tieTitle').value.trim(),
        complaint:d.querySelector('#tieComplaint').value,
        notes:d.querySelector('#tieNotes').value,
        freeformDetails:d.querySelector('#tieFreeform').value
      };
      const updated=root.jobs?.update?.(id,patch);
      if(!updated)return alert('Job update was rejected by the Data Core; nothing was changed.');
      const saved=root.jobs?.get?.(id);
      if(!saved)return alert('Job saved but could not be re-read from the canonical record.');
      for(const key of Object.keys(patch)){
        if(JSON.stringify(saved[key])!==JSON.stringify(patch[key]))
          return alert('SAVE VERIFICATION FAILED on "'+key+'". Your changes were not confirmed.');
      }
      d.remove();
      window.render?.();
      window.taurOpenJobFile?.(id);
    };
  }
  window.taurInlineEditJob=open;
})();