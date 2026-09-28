/* TAUR DISPATCH BOARD V1
 * Read-only operational board over durable detailing bookings.
 */
(()=>{
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const esc=x=>String(x??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const money=n=>'$'+Number(n||0).toFixed(2);
  const dateKey=()=>new Date().toISOString().slice(0,10);
  const jobs=()=>root.jobs?.list?.()||[];
  const customer=id=>root.customers?.get?.(id);
  const vehicle=id=>root.vehicles?.get?.(id);

  function open(){
    document.getElementById('taurDispatchModal')?.remove();
    const d=document.createElement('div');d.id='taurDispatchModal';
    d.style.cssText='position:fixed;inset:0;z-index:5250;background:rgba(0,0,0,.86);overflow:auto;padding:16px';
    d.innerHTML=`<div class="card" style="max-width:900px;margin:0 auto"><div class="row"><h2>TAUR DISPATCH</h2><button class="ghost" id="tdClose">CLOSE</button></div>
      <div class="row" style="gap:8px"><input id="tdDate" type="date" value="${dateKey()}"><button id="tdToday" class="secondary">TODAY</button></div>
      <div id="tdSummary" style="margin-top:10px"></div><div id="tdList" class="list" style="margin-top:10px"></div>
    </div>`;
    document.body.appendChild(d);
    d.querySelector('#tdClose').onclick=()=>d.remove();
    d.querySelector('#tdToday').onclick=()=>{d.querySelector('#tdDate').value=dateKey();render();};
    d.querySelector('#tdDate').onchange=render;

    function render(){
      const date=d.querySelector('#tdDate').value;
      const rows=jobs().filter(j=>j.type==='DETAILING'&&j.bookingStatus==='SCHEDULED'&&j.bookingDate===date)
        .sort((a,b)=>String(a.bookingTime||'').localeCompare(String(b.bookingTime||'')));
      d.querySelector('#tdSummary').innerHTML=`<div class="grid"><div class="card"><div class="stat">${rows.length}</div><div class="muted">BOOKED JOBS</div></div><div class="card"><div class="stat">${rows.reduce((n,j)=>n+Number(j.bookingDurationMinutes||0),0)}</div><div class="muted">BOOKED MINUTES</div></div><div class="card"><div class="stat">${money(rows.reduce((n,j)=>n+Number(j.total||0),0))}</div><div class="muted">BOOKED VALUE</div></div></div>`;
      d.querySelector('#tdList').innerHTML=rows.map(j=>{
        const c=customer(j.customerId),v=vehicle(j.vehicleId);
        return `<div class="item"><div class="row"><b>${esc(j.bookingTime||'—')} — ${esc(j.title||'Untitled Job')}</b><span class="badge">${esc(j.stage||'INTAKE')}</span></div>
          <div class="muted">${esc(c?.name||'No customer')} • ${esc(v?[v.year,v.make,v.model].filter(Boolean).join(' '):'No vehicle')}</div>
          <div class="small" style="margin-top:6px">${esc(j.bookingDurationMinutes||0)} min • ${esc(j.bookingAddress||'No address')} • ${money(j.total)}</div>
          <div class="row" style="margin-top:9px"><button class="ghost" data-open="${esc(j.id)}">OPEN FILE</button></div></div>`;
      }).join('')||'<div class="card muted">No scheduled detailing jobs for this date.</div>';
      d.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{d.remove();window.taurOpenJobFile?.(b.dataset.open);});
    }
    render();
  }
  root.dispatch={version:'1.0.0',open};
  window.taurOpenDispatch=open;
})();
