/* TAUR JOB EDITOR V1
 * Simple unrestricted editing surface for the existing job record.
 */
(()=>{
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const esc=x=>String(x??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const close=()=>document.querySelector('.taur-job-editor')?.remove();
  function open(id){
    const j=root.jobs?.get?.(id);
    if(!j)return alert('Job record not found.');
    close();
    const customers=root.customers?.list?.()||[];
    const vehicles=root.vehicles?.list?.()||[];
    const d=document.createElement('div');
    d.className='taur-job-editor';
    d.style.cssText='position:fixed;inset:0;z-index:5400;background:rgba(0,0,0,.86);overflow:auto;padding:18px';
    d.innerHTML='<div class="card" style="max-width:680px;margin:20px auto"><div class="row"><h2>EDIT JOB</h2><button class="ghost" id="jeClose">CLOSE</button></div>'+
      '<label>JOB TYPE</label><input id="jeType" value="'+esc(j.type)+'">'+
      '<label>TITLE</label><input id="jeTitle" value="'+esc(j.title)+'">'+
      '<label>CUSTOMER</label><select id="jeCustomer"><option value="">No customer</option>'+customers.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===j.customerId?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select>'+
      '<label>VEHICLE</label><select id="jeVehicle"><option value="">No vehicle</option>'+vehicles.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===j.vehicleId?'selected':'')+'>'+esc([x.year,x.make,x.model].filter(Boolean).join(' '))+'</option>').join('')+'</select>'+
      '<label>COMPLAINT / WORK</label><textarea id="jeComplaint">'+esc(j.complaint)+'</textarea>'+
      '<label>TOTAL</label><input id="jeTotal" type="number" step=".01" value="'+Number(j.total||0)+'">'+
      '<label>STATUS</label><input id="jeStatus" value="'+esc(j.status)+'">'+
      '<label>STAGE</label><input id="jeStage" value="'+esc(j.stage)+'">'+
      '<label>WARRANTY</label><input id="jeWarranty" value="'+esc(j.warranty)+'">'+
      '<label>CONDITION</label><input id="jeCondition" value="'+esc(j.condition)+'">'+
      '<label>VEHICLE SIZE</label><input id="jeSize" value="'+esc(j.vehicleSize)+'">'+
      '<label>LEAD SOURCE</label><input id="jeLead" value="'+esc(j.leadSource)+'">'+
      '<label>LABOR HOURS</label><input id="jeLabor" type="number" step=".1" value="'+Number(j.laborHours||0)+'">'+
      '<label>TRAVEL MINUTES</label><input id="jeTravel" type="number" value="'+Number(j.travelMinutes||0)+'">'+
      '<label>MATERIALS COST</label><input id="jeMaterials" type="number" step=".01" value="'+Number(j.materialsCost||0)+'">'+
      '<label>FOLLOW-UP DATE</label><input id="jeFollow" type="date" value="'+esc(String(j.followUpDate||'').slice(0,10))+'">'+
      '<label>NOTES</label><textarea id="jeNotes">'+esc(j.notes)+'</textarea>'+
      '<button id="jeSave" class="wide" style="margin-top:10px">SAVE JOB</button></div>';
    document.body.appendChild(d);
    d.querySelector('#jeClose').onclick=close;
    d.querySelector('#jeSave').onclick=()=>{
      const patch={
        type:d.querySelector('#jeType').value.trim(),
        title:d.querySelector('#jeTitle').value.trim(),
        customerId:d.querySelector('#jeCustomer').value,
        vehicleId:d.querySelector('#jeVehicle').value,
        complaint:d.querySelector('#jeComplaint').value.trim(),
        total:Number(d.querySelector('#jeTotal').value||0),
        status:d.querySelector('#jeStatus').value.trim(),
        stage:d.querySelector('#jeStage').value.trim(),
        warranty:d.querySelector('#jeWarranty').value.trim(),
        condition:d.querySelector('#jeCondition').value.trim(),
        vehicleSize:d.querySelector('#jeSize').value.trim(),
        leadSource:d.querySelector('#jeLead').value.trim(),
        laborHours:Number(d.querySelector('#jeLabor').value||0),
        travelMinutes:Number(d.querySelector('#jeTravel').value||0),
        materialsCost:Number(d.querySelector('#jeMaterials').value||0),
        followUpDate:d.querySelector('#jeFollow').value,
        notes:d.querySelector('#jeNotes').value.trim()
      };
      const updated=root.jobs?.update?.(id,patch);
      if(!updated)return alert('Job update was rejected by the Data Core; nothing was changed.');
      close();
      window.taurOpenJobFile?.(id);
    };
  }
  window.taurEditJob=open;
})();
