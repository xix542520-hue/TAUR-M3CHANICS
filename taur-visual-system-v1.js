/* TAUR VISUAL SYSTEM V1 — industrial card aesthetic + efficiency-first UI */
(()=>{
 const style=document.createElement('style');
 style.id='taur-visual-system-v1';
 style.textContent=`
:root{--bg:#070707;--panel:#101010;--panel2:#151515;--line:#292929;--text:#f2f2f2;--muted:#8b8b8b;--red:#d71920;--red2:#a90f15;--silver:#bdbdbd;--green:#8fd18f;--amber:#e0bd68}
html{background:var(--bg)}body{background:radial-gradient(circle at 50% -15%,#1a0a0b 0,#090909 34%,#070707 65%);letter-spacing:.01em}
header{height:74px;padding:14px 16px 10px;background:rgba(7,7,7,.96);border-bottom:1px solid #292929;box-shadow:0 5px 22px rgba(0,0,0,.35)}
.logo{font-size:22px;letter-spacing:2.4px;line-height:1}.logo span{color:var(--red)}.tag{font-weight:800;color:#777;letter-spacing:2.2px;font-size:8px;margin-top:6px}
main{max-width:1080px;padding:18px 14px 108px}
h2{font-size:17px;letter-spacing:1.3px;text-transform:uppercase}h3{letter-spacing:.7px;text-transform:uppercase}
.section{margin:15px 0}.card,.item{background:linear-gradient(145deg,#131313,#0d0d0d);border:1px solid #282828;border-radius:10px;box-shadow:0 7px 20px rgba(0,0,0,.18);position:relative;overflow:hidden}
.card:before,.item:before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:#242424}.item:has(button:not(.ghost)):before,.card:has(button:not(.ghost)):before{background:var(--red)}
.stat{font-size:27px;letter-spacing:-.5px}.muted{color:#8b8b8b}.small{color:#aaa}
button{min-height:42px;border-radius:7px;background:var(--red);box-shadow:0 2px 0 #780d11;font-size:11px;letter-spacing:.55px;text-transform:uppercase;padding:10px 13px}button:hover{filter:brightness(1.08)}button.secondary{background:#242424;box-shadow:none}button.ghost{background:#111;border:1px solid #3a3a3a;box-shadow:none}button.danger{background:#591217;box-shadow:none}
input,select,textarea{background:#090909;border-color:#303030;border-radius:7px;min-height:43px}input:focus,select:focus,textarea:focus{outline:1px solid #8d171b;border-color:var(--red)}label{font-weight:800;letter-spacing:1px;color:#777}
.badge{background:#222;border:1px solid #333;text-transform:uppercase;letter-spacing:.5px}.redbadge{background:#3c0d10;border-color:#67151a;color:#ffb5b8}
.total{letter-spacing:.2px}.progress{background:#202020}.progress i{background:linear-gradient(90deg,var(--red2),var(--red))}
nav{background:rgba(10,10,10,.98);border-top:1px solid #303030;box-shadow:0 -8px 25px rgba(0,0,0,.4)}nav button{min-height:52px;color:#777;font-size:8px;font-weight:900;letter-spacing:.8px}nav button.active{color:#fff;border-top-color:var(--red);background:#171010;box-shadow:inset 0 2px 0 var(--red)}
.row{gap:7px}.grid,.grid3{gap:9px}
/* Make repeated lists scannable instead of decorative. */
.list{gap:7px}.item{padding:12px}.item .row:first-child b{letter-spacing:.3px}
/* Compact action rows. */
.item button,.card button{min-height:38px;padding:8px 10px}
/* Hide nonessential empty visual noise. */
.hide{display:none!important}
@media(max-width:560px){html,body{width:100%;min-width:0;overflow-x:hidden;-webkit-text-size-adjust:100%}main{padding:10px 10px 118px}.grid{grid-template-columns:1fr}.grid3{grid-template-columns:1fr}.card,.item{padding:13px;border-radius:13px}.row{flex-wrap:wrap}.stat{font-size:24px}h2{font-size:15px}button{min-height:48px;padding:11px 13px}input,select,textarea{min-height:48px;font-size:16px!important;padding:11px 12px}textarea{min-height:108px}.item .row:last-child{align-items:stretch}.item .row:last-child button{flex:0 1 auto}}
@media(min-width:800px){nav{position:fixed;top:0;bottom:auto;left:auto;right:18px;width:auto;border:0;background:transparent;box-shadow:none;display:flex;padding:13px 0}nav button{min-height:36px;padding:8px 10px;border:1px solid #252525;border-radius:6px;background:#0d0d0d;font-size:9px}nav button.active{border:1px solid var(--red);border-top-color:var(--red);background:#180b0c}}
`;
 document.head.appendChild(style);

 // Replace the oversized header label with a tighter brand lockup while retaining the existing DOM contract.
 const compactBrand=()=>{const tag=document.querySelector('.tag');if(tag&&!tag.dataset.taurStyled){tag.textContent='MOBILE AUTO SERVICES  •  DIAGNOSE. DON\'T GUESS.';tag.dataset.taurStyled='1'}};
 const boot=()=>{compactBrand();new MutationObserver(compactBrand).observe(document.body,{childList:true,subtree:true})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
