/* TAUR VISUAL SYSTEM V2 — red mechanic / blue detailing, efficiency-first */
(()=>{
 const css=`
 :root{--taur-red:#d71920;--taur-blue:#1677ff;--taur-blue2:#0b4fb3;--taur-black:#080808;--taur-panel:#111;--taur-panel2:#171717;--taur-line:#292929}
 body{background:var(--taur-black)}
 .taur-detail-accent,.detail-accent{--accent:var(--taur-blue)}
 .taur-mechanic-accent,.mechanic-accent{--accent:var(--taur-red)}
 [data-service-type="DETAILING"],.job-detailing{--accent:var(--taur-blue)}
 [data-service-type="MECHANICS"],.job-mechanic{--accent:var(--taur-red)}
 .badge-detailing{background:rgba(22,119,255,.18)!important;color:#8dbbff!important;border:1px solid rgba(22,119,255,.35)}
 .badge-mechanic{background:rgba(215,25,32,.18)!important;color:#ff8b8f!important;border:1px solid rgba(215,25,32,.35)}
 button.detail-action,.detail-action{background:var(--taur-blue)!important}
 .taur-detailing-header{border-left:3px solid var(--taur-blue);padding-left:10px}
 .taur-mechanic-header{border-left:3px solid var(--taur-red);padding-left:10px}
 `;
 const s=document.createElement('style');s.id='taur-visual-system-v2';s.textContent=css;document.head.appendChild(s);
 const paint=()=>{
  document.querySelectorAll('.item,.card').forEach(el=>{
   const t=el.textContent||'';
   const detail=/\bDETAILING\b|\bDETAIL\b/.test(t), mech=/\bMECHANIC\b/.test(t);
   if(detail&&!mech)el.classList.add('taur-detail-accent');
   if(mech&&!detail)el.classList.add('taur-mechanic-accent');
  });
 };
 paint();new MutationObserver(paint).observe(document.body,{childList:true,subtree:true});
 window.taurVisualSystemV2=true;
})();
