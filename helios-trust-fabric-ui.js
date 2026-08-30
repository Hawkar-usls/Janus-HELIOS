(() => {
  'use strict';

  const VERSION='1.0.0';
  const state={attached:false,host:null,observer:null,lastRoute:null};

  const text=(tag,value,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=String(value??'');return el;};
  const activeRoute=()=>document.querySelector('#route-grid .route.active')?.dataset.route||'market';
  const resourceState=()=>window.HELIOS_RESOURCE_POLICY?.getState?.()||null;

  function injectStyles(){
    if(document.getElementById('helios-trust-fabric-ui-styles'))return;
    const style=document.createElement('style');style.id='helios-trust-fabric-ui-styles';style.textContent=`
      .helios-trust-fabric-card{border:1px solid #263943;border-radius:10px;background:radial-gradient(circle at 12% 0%,#5ee7ff0d,transparent 35%),linear-gradient(180deg,#071119,#050a0f);padding:8px;overflow:hidden;position:relative}.helios-trust-fabric-card:before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 0 44%,#ffffff05 50%,transparent 56%);transform:translateX(-55%);animation:heliosTrustSweep 11s ease-in-out infinite}.helios-trust-fabric-head{display:flex;justify-content:space-between;gap:8px;align-items:center;position:relative}.helios-trust-fabric-head h4{margin:0;color:#c6d4db;font:900 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.11em}.helios-trust-fabric-head b{color:var(--good);font:850 6px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-trust-fabric-grid{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}.helios-trust-fabric-chip{min-width:0;border:1px solid #20313b;border-radius:8px;background:#050b10c9;padding:6px}.helios-trust-fabric-chip span{display:block;color:#637681;font:750 5.3px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}.helios-trust-fabric-chip b{display:block;margin-top:2px;color:#aebfc8;font:850 6.3px ui-monospace,SFMono-Regular,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.helios-trust-fabric-chip.guard b{color:#80d7ff}.helios-trust-fabric-chip.deny b{color:#ffd36a}.helios-trust-fabric-chip.good b{color:var(--good)}.helios-trust-lineage{position:relative;display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:3px;margin-top:7px}.helios-trust-node{border-top:2px solid #263942;padding-top:4px;text-align:center;color:#677b86;font:700 4.7px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-trust-node:nth-child(4),.helios-trust-node:nth-child(6),.helios-trust-node:nth-child(8){border-color:var(--mode);color:#a9bbc5}.helios-trust-fabric-note{position:relative;margin-top:6px;color:#6c7e88;font:5.8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-trust-fabric-note strong{color:#9fb1bb}.helios-trust-live{position:relative;margin-top:6px;border-top:1px solid #17252e;padding-top:5px;display:flex;justify-content:space-between;gap:7px;color:#657781;font:5.8px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-trust-live b{color:#aebdc6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.helios-trust-live b.denied{color:#ffd36a}@keyframes heliosTrustSweep{0%,74%,100%{transform:translateX(-65%)}86%{transform:translateX(65%)}}@media(max-width:620px){.helios-trust-fabric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.helios-trust-lineage{grid-template-columns:repeat(5,minmax(0,1fr))}.helios-trust-node:nth-child(n+6){margin-top:2px}}@media(prefers-reduced-motion:reduce){.helios-trust-fabric-card:before{animation:none;display:none}}
    `;document.head.appendChild(style);
  }

  function build(){
    const body=document.querySelector('#helios-buyer-lab .helios-buyer-lab-body');if(!body||document.getElementById('helios-trust-fabric-card'))return false;
    const card=document.createElement('section');card.id='helios-trust-fabric-card';card.className='helios-trust-fabric-card';card.innerHTML=`
      <div class="helios-trust-fabric-head"><h4>TRUST FABRIC · DEVICE-SOVEREIGN COMPUTE</h4><b>P0A ACTIVE IN CORE</b></div>
      <div class="helios-trust-fabric-grid">
        <div class="helios-trust-fabric-chip deny"><span>PROVIDER AUTHORITY</span><b>DEFAULT DENY · EPOCH-BOUND</b></div>
        <div class="helios-trust-fabric-chip guard"><span>HOST-FIRST QOS</span><b>EXTERNAL WORK YIELDS FIRST</b></div>
        <div class="helios-trust-fabric-chip good"><span>RECEIPT PROVENANCE</span><b>IDENTITY + DIGEST ENVELOPE</b></div>
        <div class="helios-trust-fabric-chip guard"><span>DEVICE HEALTH PASSPORT</span><b>OBSERVATION CHAIN · HUMAN-BLIND</b></div>
        <div class="helios-trust-fabric-chip good"><span>VERIFIER LAW</span><b>NO SILENT ASSURANCE REGRESSION</b></div>
        <div class="helios-trust-fabric-chip"><span>TRUE WORK ACCOUNTING</span><b>ASSIGNED ≠ VERIFIED</b></div>
      </div>
      <div class="helios-trust-lineage">
        ${['CONSENT','PROVIDER','LEASE','GUARDIAN','EXECUTOR','RESULT','VERIFIER','RECEIPT','PASSPORT'].map(x=>`<div class="helios-trust-node">${x}</div>`).join('')}
      </div>
      <div class="helios-trust-live"><span>ACTIVE ROUTE</span><b id="helios-trust-route">—</b></div>
      <div class="helios-trust-live"><span>PUBLIC PAGE AUTHORITY</span><b class="denied">NONE · ARCHITECTURE DEMO</b></div>
      <div class="helios-trust-fabric-note"><strong>Truth boundary:</strong> this static slot demonstrates the maintained contracts only. It does not issue a real provider lease, invent sensor readings, claim measured watt-hours, or turn a DEMO/MOCK receipt into authoritative settlement.</div>`;
    body.prepend(card);state.host=card;state.attached=true;update();
    const routeGrid=document.getElementById('route-grid');if(routeGrid){state.observer=new MutationObserver(update);state.observer.observe(routeGrid,{subtree:true,attributes:true,attributeFilter:['class']});}
    window.addEventListener('helios:resource-policy',update);
    window.HELIOS_TRUST_FABRIC_UI=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,route:activeRoute(),resource_policy:resourceState(),provider_admission:'DEFAULT_DENY_STATIC_DEMO',real_provider_authority:false,human_blind:true,game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE'})});
    window.dispatchEvent(new CustomEvent('helios:trust-fabric-ui-ready',{detail:{version:VERSION,provider_default_deny:true,authority_epoch:true,host_first_qos:true,receipt_provenance:true,device_health_passport:true,verifier_assurance_monotonicity:true,true_work_accounting:true,public_authority:'NONE',presentation_only:true,game_effect:'NONE'}}));
    return true;
  }

  function update(){
    if(!state.host)return;const route=activeRoute();state.lastRoute=route;const el=state.host.querySelector('#helios-trust-route');const p=resourceState();const cpu=p?.cpu_percent??p?.cpuPercent??0;const gpu=p?.gpu_percent??p?.gpuPercent??0;if(el)el.textContent=`${String(route).toUpperCase()} · REGISTERED / NOT ADMITTED · CPU ${cpu}% GPU ${gpu}%`;
  }

  function init(){let attempts=0;const retry=()=>{injectStyles();if(build()||++attempts>=160)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();