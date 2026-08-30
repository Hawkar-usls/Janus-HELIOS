(() => {
  'use strict';

  const VERSION='1.0.0';
  const state={attached:false,host:null,core:null,lastPlan:null};
  const text=(tag,value,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=String(value??'');return el;};

  function injectStyles(){
    if(document.getElementById('helios-edge-hash-lab-styles'))return;
    const s=document.createElement('style');s.id='helios-edge-hash-lab-styles';s.textContent=`
      .helios-edge-hash-card{border:1px solid #3c3428;border-radius:10px;background:radial-gradient(circle at 88% 0%,#ffc24b0f,transparent 38%),linear-gradient(180deg,#0a100f,#050a0f);padding:8px;position:relative;overflow:hidden}.helios-edge-hash-card:after{content:'';position:absolute;width:160px;height:160px;right:-95px;bottom:-105px;border:1px solid #ffc24b15;border-radius:50%;box-shadow:0 0 50px #ffc24b08;pointer-events:none}.helios-edge-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.helios-edge-head h4{margin:0;color:#d9d2bf;font:900 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.1em}.helios-edge-badge{border:1px solid #4e442f;border-radius:999px;background:#141108;color:#ffd36a;padding:3px 6px;font:850 5.7px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}.helios-edge-chip{min-width:0;border:1px solid #26343b;border-radius:8px;background:#050b10d9;padding:6px}.helios-edge-chip span{display:block;color:#687981;font:750 5.2px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.07em}.helios-edge-chip b{display:block;margin-top:2px;color:#b9c7ce;font:850 6.2px ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.helios-edge-chip.gold b{color:#ffd36a}.helios-edge-chip.good b{color:var(--good)}.helios-edge-chip.cold b{color:#80d7ff}.helios-edge-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:4px;margin-top:7px;padding:6px;border:1px solid #1e2c33;border-radius:8px;background:#04090d}.helios-edge-node{text-align:center;color:#94a4ad;font:800 5.4px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-node strong{display:block;color:#cbd6db;font-size:6.3px;margin-top:2px}.helios-edge-arrow{color:#6e7f88;font:800 7px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-ab{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:6px}.helios-edge-arm{border-top:2px solid #3b4a52;padding-top:5px;color:#73838c;font:750 5.3px ui-monospace,SFMono-Regular,Consolas,monospace;text-align:center}.helios-edge-arm:first-child{border-color:var(--mode);color:#b9c8cf}.helios-edge-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.helios-edge-btn{border:1px solid #30404a;background:#071018;color:#9cadb6;border-radius:7px;padding:5px 7px;font:850 5.8px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-btn:hover{border-color:var(--mode);color:#fff}.helios-edge-btn.primary{border-color:#5d4d28;color:#ffd36a;background:#120f07}.helios-edge-output{margin-top:6px;border:1px solid #1f2d34;border-radius:7px;background:#03080b;padding:6px;color:#778891;font:5.8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-output b{color:#bccad1}.helios-edge-note{margin-top:6px;color:#697b84;font:5.6px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-note strong{color:#aab9c0}.helios-edge-links{display:flex;justify-content:space-between;gap:8px;margin-top:5px;font:5.5px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-links a{color:#80d7ff;text-decoration:none}.helios-edge-links span{color:#657781}@media(max-width:620px){.helios-edge-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.helios-edge-flow{grid-template-columns:1fr}.helios-edge-arrow{transform:rotate(90deg);text-align:center}.helios-edge-ab{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  async function loadCore(){
    if(state.core)return state.core;
    state.core=await import('./src/helios-edge-hash-lab.js?v=1.0.0');
    return state.core;
  }

  function build(){
    const body=document.querySelector('#helios-buyer-lab .helios-buyer-lab-body');if(!body||document.getElementById('helios-edge-hash-lab-card'))return false;
    const card=document.createElement('section');card.id='helios-edge-hash-lab-card';card.className='helios-edge-hash-card';card.innerHTML=`
      <div class="helios-edge-head"><h4>EDGE HASH LAB · NERDMINER V2 × JANUS I0</h4><span class="helios-edge-badge">EDGE / RESEARCH</span></div>
      <div class="helios-edge-grid">
        <div class="helios-edge-chip gold"><span>EDGE NODE</span><b>NERDMINER V2 · ESP32 · MIT</b></div>
        <div class="helios-edge-chip cold"><span>WIRE</span><b>STRATUM · STOCK BEHAVIOR FROZEN</b></div>
        <div class="helios-edge-chip good"><span>JANUS I0</span><b>STRUCTURED TRAVERSAL BRIDGE</b></div>
        <div class="helios-edge-chip"><span>CONTROL</span><b>STRICT 50 / 50 RANDOM MIRROR</b></div>
        <div class="helios-edge-chip"><span>EVIDENCE</span><b>PER CHECKED MH · NOT RAW COUNTS</b></div>
        <div class="helios-edge-chip"><span>CLAIM BOUNDARY</span><b>NO SHA-256 SHORTCUT CLAIM</b></div>
      </div>
      <div class="helios-edge-flow"><div class="helios-edge-node">USER CONSENT<strong>HELIOS</strong></div><div class="helios-edge-arrow">→</div><div class="helios-edge-node">LOCAL EDGE BRIDGE<strong>DEVICE SOVEREIGNTY</strong></div><div class="helios-edge-arrow">→</div><div class="helios-edge-node">NERDMINER V2<strong>ESP32 → POOL</strong></div></div>
      <div class="helios-edge-ab"><div class="helios-edge-arm">JANUS I0 · 50% CHECKED WORK</div><div class="helios-edge-arm">RANDOMIZED MIRROR · 50% CHECKED WORK</div></div>
      <div class="helios-edge-actions"><button id="helios-edge-plan" class="helios-edge-btn primary" type="button">BUILD I0 50/50 PLAN</button><button id="helios-edge-copy" class="helios-edge-btn" type="button">COPY EDGE MANIFEST</button></div>
      <div id="helios-edge-output" class="helios-edge-output"><b>STOCK NERDMINER:</b> external compatible edge node. JANUS I0 scheduling requires an explicit bridge/compatible firmware and pool conformance gate.</div>
      <div class="helios-edge-links"><a href="https://github.com/BitMaker-hub/NerdMiner_v2" target="_blank" rel="noopener noreferrer">NerdMinerV2 upstream ↗</a><span id="helios-edge-serial">LOCAL BRIDGE · CHECKING API</span></div>
      <div class="helios-edge-note"><strong>IP boundary:</strong> no NerdMiner source is vendored into HELIOS. NerdMinerV2 remains an external MIT compatibility target. JANUS I0 methodology remains separately scoped first-party Background IP; this public card exposes only the bridge/evidence contract, not the private scheduler implementation.</div>`;
    const trust=document.getElementById('helios-trust-fabric-card');if(trust?.parentNode===body)trust.after(card);else body.prepend(card);state.host=card;state.attached=true;bind();return true;
  }

  function renderPlan(plan){
    const out=state.host?.querySelector('#helios-edge-output');if(!out)return;out.replaceChildren();
    out.append(text('b',`${plan.mode} · ${plan.arms[0].weight*100}/${plan.arms[1].weight*100} EXPOSURE`),text('div',`EVIDENCE ${plan.evidence_metrics.slice(0,6).join(' · ')}`),text('div',`GATE ${plan.execution_gate}`));
  }

  async function buildPlan(){
    try{const core=await loadCore();state.lastPlan=core.createI0BenchmarkPlan({manifest:{firmware_mode:'STOCK_EXTERNAL'},checked_work_target_mh:100});renderPlan(state.lastPlan);window.dispatchEvent(new CustomEvent('helios:edge-hash-plan',{detail:{version:VERSION,mode:state.lastPlan.mode,execution_ready:false,presentation_only:true,game_effect:'NONE'}}));}catch(err){const out=state.host?.querySelector('#helios-edge-output');if(out)out.textContent=`PLAN ERROR · ${err?.message||err}`;}
  }

  async function copyManifest(button){
    try{const core=await loadCore();const payload=core.normalizeEdgeNodeManifest({firmware_mode:'STOCK_EXTERNAL'});await navigator.clipboard.writeText(JSON.stringify(payload,null,2));button.textContent='COPIED';setTimeout(()=>button.textContent='COPY EDGE MANIFEST',1000);}catch(_){button.textContent='COPY FAILED';setTimeout(()=>button.textContent='COPY EDGE MANIFEST',1000);}
  }

  function bind(){
    const plan=state.host.querySelector('#helios-edge-plan');plan?.addEventListener('click',buildPlan);
    const copy=state.host.querySelector('#helios-edge-copy');copy?.addEventListener('click',()=>copyManifest(copy));
    const serial=state.host.querySelector('#helios-edge-serial');if(serial)serial.textContent=`LOCAL BRIDGE · WEB SERIAL ${'serial' in navigator?'API VISIBLE':'NOT VISIBLE'}`;
    window.HELIOS_EDGE_HASH_LAB_UI=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,nerdminer_v2:'EXTERNAL_MIT_COMPATIBILITY_TARGET',janus_i0:'BACKGROUND_IP_BRIDGE',stock_firmware_i0_scheduler:false,last_plan:state.lastPlan?{mode:state.lastPlan.mode,execution_ready:state.lastPlan.execution_ready}:null,public_pool_connection:false,wallet_data_collected:false,presentation_only:true,game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE'})});
    window.dispatchEvent(new CustomEvent('helios:edge-hash-lab-ready',{detail:{version:VERSION,nerdminer_v2_compatibility:true,janus_i0_bridge:true,strict_50_50_control:true,per_checked_mh_evidence:true,stock_firmware_unchanged:true,public_pool_connection:false,presentation_only:true,game_effect:'NONE'}}));
  }

  function init(){let attempts=0;const retry=()=>{injectStyles();if(build()||++attempts>=180)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();