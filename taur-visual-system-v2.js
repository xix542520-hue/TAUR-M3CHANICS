/* TAUR VISUAL SYSTEM V3 — efficiency UI / red mechanic / blue detailing */
(()=>{
 document.title='TAUR AUTOMOTIVE';
 const brand=document.querySelector('.logo');if(brand)brand.innerHTML='TAUR <span>AUTOMOTIVE</span>';
 const style=document.createElement('style');style.id='taur-visual-system-v3';style.textContent=`
 :root{--taur-red:#d71920;--taur-blue:#1677ff;--taur-blue-soft:rgba(22,119,255,.14);--taur-red-soft:rgba(215,25,32,.14);--taur-black:#080808;--taur-panel:#111;--taur-panel2:#171717;--taur-line:#292929}
 body{background:var(--taur-black);letter-spacing:.01em}
 header{padding:13px 15px 10px;backdrop-filter:blur(10px)}
 .logo{font-size:23px;letter-spacing:2.5px}.tag{letter-spacing:2.4px}
 main{padding:12px 12px 92px;max-width:920px}
 h2{font-size:16px;letter-spacing:.7px;text-transform:uppercase}h3{letter-spacing:.4px}
 .section{margin:14px 0}.grid{gap:8px}.card,.item{border-radius:10px;padding:11px;background:linear-gradient(145deg,var(--panel2),var(--panel));box-shadow:0 1px 0 rgba(255,255,255,.025) inset}
 .stat{font-size:22px}.muted{font-size:11px}.small{font-size:10px}
 button{min-height:44px;border-radius:8px;padding:10px 12px;letter-spacing:.25px}button.secondary{background:#252525}button.ghost{background:#121212;border-color:#333}
 input,select,textarea{min-height:44px;border-radius:8px;margin:4px 0 8px}
 nav{background:rgba(13,13,13,.97);backdrop-filter:blur(12px)}
 nav button{min-height:52px;padding:8px 1px;font-size:8px;font-weight:900;letter-spacing:.35px}
 nav button.active{color:#fff;background:#151515}
 .taur-detail-accent,.detail-accent{--accent:var(--taur-blue)}
 .taur-mechanic-accent,.mechanic-accent{--accent:var(--taur-red)}
 .taur-detail-accent{border-left:3px solid var(--taur-blue)!important;background:linear-gradient(90deg,var(--taur-blue-soft),var(--panel))}
 .taur-mechanic-accent{border-left:3px solid var(--taur-red)!important;background:linear-gradient(90deg,var(--taur-red-soft),var(--panel))}
 .badge-detailing{background:var(--taur-blue-soft)!important;color:#8dbbff!important;border:1px solid rgba(22,119,255,.38)}
 .badge-mechanic{background:var(--taur-red-soft)!important;color:#ff9a9e!important;border:1px solid rgba(215,25,32,.38)}
 .taur-division-strip{display:flex;gap:7px;margin:0 0 12px}.taur-division-strip button{flex:1;background:#151515;border:1px solid #303030}.taur-division-strip .mech{border-color:rgba(215,25,32,.55);color:#ff8b8f}.taur-division-strip .det{border-color:rgba(22,119,255,.55);color:#8dbbff}
 .taur-quick-action{width:100%;margin:4px 0 8px;font-size:14px;min-height:48px}
 .taur-empty{padding:22px 12px;text-align:center;border:1px dashed #303030;border-radius:10px;color:#777}
 .section{margin:18px 0}
 .row{gap:10px;align-items:center}
 .card,.item{border-radius:14px;padding:14px}
 .card .row,.item .row{margin-bottom:4px}
 button{min-height:46px;border-radius:10px;padding:11px 14px;font-weight:850}
 button.wide{min-height:50px}
 input,select,textarea{min-height:46px;border-radius:10px;padding:11px 12px}
 textarea{min-height:96px}
 label{display:block;margin-top:7px;font-size:10px;font-weight:900;letter-spacing:.7px}
 .taur-xip-modal{align-items:center!important;padding:16px!important}
 .taur-xip-card{max-width:760px!important;max-height:calc(100vh - 32px)!important;border-radius:18px!important;padding:20px!important}
 .taur-xip-title{font-size:21px!important;margin-bottom:16px!important}
 .taur-xip-grid{gap:10px!important}
 .taur-xip-actions{position:sticky;bottom:0;padding-top:10px;background:linear-gradient(transparent,#101010 18%);z-index:2}
 .taur-pb-modal{align-items:center!important;padding:16px!important}
 .taur-pb-card{max-width:760px!important;max-height:calc(100vh - 32px)!important;border-radius:18px!important;padding:20px!important}
 .taur-pb-choice{min-height:58px!important;border-radius:12px!important}
 .taur-pb-choice input{accent-color:var(--taur-blue);transform:scale(1.15)}
 .taur-jfx-card{border-radius:18px!important}
 .taur-dc-modal{align-items:center!important;padding:16px!important}
 .taur-dc-card{max-width:700px!important;max-height:calc(100vh - 32px)!important;border-radius:18px!important}
 @media(min-width:700px){main{padding-left:24px;padding-right:24px}.grid{gap:12px}}
 @media(max-width:600px){main{padding-bottom:105px}.taur-xip-card,.taur-pb-card{padding:15px!important}.taur-xip-actions{grid-template-columns:1fr 1fr}.taur-xip-actions button{min-height:50px}}
 `;document.head.appendChild(style);
 const classify=()=>document.querySelectorAll('.item,.card').forEach(el=>{const t=(el.textContent||'').toUpperCase();const detail=/\bDETAILING\b|\bDETAIL JOBS\b|\bNEW DETAIL\b/.test(t),mech=/\bMECHANIC\b/.test(t);el.classList.toggle('taur-detail-accent',detail&&!mech);el.classList.toggle('taur-mechanic-accent',mech&&!detail)});
 classify();new MutationObserver(classify).observe(document.body,{childList:true,subtree:true});window.taurVisualSystemV3=true;
})();
