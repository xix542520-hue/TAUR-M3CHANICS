/* TAUR BOOKING V1
 * Operational appointment record for detailing jobs.
 */
(()=>{
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const esc=x=>String(x??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const close=()=>document.querySelector('.taur-booking-modal')?.remove();
  const get=id=>root.jobs?.get?.(id)||null;

  function save(jobId,data){
    const job=get(jobId); if(!job||job.type!=='DETAILING') return null;
    const date=String(data?.date||'').trim(), time=String(data?.time||'').trim();
    if(!date||!time) return null;
    return root.jobs.update(jobId,{
      bookingDate:date,
      bookingTime:time,
      bookingDurationMinutes:Math.max(30,Number(data?.durationMinutes||180)),
      bookingAddress:String(data?.address||'').trim(),
      bookingNotes:String(data?.notes||'').trim(),
      bookingStatus:'SCHEDULED'
    });
  }

  function open(jobId,onSaved){
    const j=get(jobId); if(!j||j.type!=='DETAILING') return;
    close();
    const d=document.createElement('div'); d.className='taur-booking-modal';
    d.style.cssText='position:fixed;inset:0;z-index:5300;background:rgba(0,0,0,.84);display:flex;align-items:flex-end;justify-content:center';
    d.innerHTML=`<div class="card" style="width:100%;max-width:560px;margin:0;padding:16px;border-radius:18px 18px 0 0">
      <div class="row"><h2>BOOK DETAILING JOB</h2><button class="ghost" id="tbClose">CLOSE</button></div>
      <div class="muted">${esc(j.title||'Detail Job')}</div>
      <label>DATE</label><input id="tbDate" type="date" value="${esc(j.bookingDate||'')}">
      <label>START TIME</label><input id="tbTime" type="time" value="${esc(j.bookingTime||'')}">
      <label>DURATION (MINUTES)</label><input id="tbDuration" type="number" min="30" step="15" value="${Number(j.bookingDurationMinutes||180)}">
      <label>SERVICE ADDRESS</label><input id="tbAddress" value="${esc(j.bookingAddress||'')}" placeholder="Customer/job location">
      <label>BOOKING NOTES</label><textarea id="tbNotes" placeholder="Arrival notes, access, customer instructions…">${esc(j.bookingNotes||'')}</textarea>
      <button id="tbSave" style="width:100%;margin-top:10px;padding:12px">SAVE BOOKING</button>
    </div>`;
    document.body.appendChild(d);
    d.querySelector('#tbClose').onclick=close;
    d.querySelector('#tbSave').onclick=()=>{
      const updated=save(jobId,{
        date:d.querySelector('#tbDate').value,
        time:d.querySelector('#tbTime').value,
        durationMinutes:d.querySelector('#tbDuration').value,
        address:d.querySelector('#tbAddress').value,
        notes:d.querySelector('#tbNotes').value
      });
      if(!updated)return alert('Date and start time are required.');
      root.emit?.('DETAIL_BOOKING_SAVED',{jobId});
      close(); if(typeof onSaved==='function')onSaved(updated);
    };
  }

  root.booking={version:'1.0.0',get:id=>get(id),save,open};
  window.taurOpenDetailBooking=open;
})();
