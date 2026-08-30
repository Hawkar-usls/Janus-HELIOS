(() => {
  'use strict';

  const VERSION='1.1.0';
  const state={attached:false,host:null,core:null,lastPlan:null};
  const text=(tag,value,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=String(value??'');return el;};

  function injectStyles(){
    if(document.getElementById('helios-edge-constellation-styles'))return;
    const s=document.createElement('style');s.id='helios-edge-constellation-styles';s.textContent=`
      .helios-edge-constellation-card{border:1px solid #243b45;border-radius:10px;background:radial-gradient(circle at 10% 0%,#80d7ff10,transparent 34%),radial-gradient(circle at 92% 12%,#ffc24b0b,transparent 30%),linear-gradient(180deg,#071018,#04090d);padding:8px;position:relative;overflow:hidden}.helios-edge-constellation-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.helios-edge-constellation-head h4{margin:0;color:#cbd8de;font:900 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.1em}.helios-edge-constellation-badge{border:1px solid #315263;border-radius:999px;background:#07141b;color:#80d7ff;padding:3px 6px;font:850 5.7px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-constellation-law{margin-top:6px;border:1px solid #22343e;border-radius:8px;background:#050b10;padding:7px;text-align:center;color:#71848e;font:700 5.5px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-constellation-law strong{display:block;color:#e2edf1;font-size:7px;letter-spacing:.05em}.helios-edge-constellation-nodes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}.helios-edge-constellation-node{min-width:0;border:1px solid #263740;border-radius:9px;background:#050b10d9;padding:7px;position:relative}.helios-edge-constellation-node:before{content:'';position:absolute;left:7px;right:7px;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--mode),transparent);opacity:.45}.helios-edge-constellation-node span{display:block;color:#637681;font:750 5px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}.helios-edge-constellation-node b{display:block;margin-top:3px;color:#c3d0d6;font:850 6.4px ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.helios-edge-constellation-node em{display:block;margin-top:4px;color:#ffd36a;font:800 5px ui-monospace,SFMono-Regular,Consolas,monospace;font-style:normal}.helios-edge-constellation-pair{display:grid;grid-template-columns:1fr auto 1fr;gap:4px;align-items:center;margin-top:5px}.helios-edge-constellation-arm{border:1px solid #24333b;border-radius:6px;background:#03080b;padding:4px;text-align:center;color:#8ea0aa;font:800 5px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-constellation-arm.i0{border-color:#4b432d;color:#ffd36a}.helios-edge-constellation-vs{color:#5f727d;font:800 5px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-constellation-synthesis{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:7px;padding:6px;border-top:1px solid #1d2d35;border-bottom:1px solid #1d2d35;color:#71828c;font:750 5.4px ui-monospace,SFMono-Regular,Consolas,monospace;text-align:center}.helios-edge-constellation-synthesis b{color:#9edfff}.helios-edge-constellation-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.helios-edge-constellation-btn{border:1px solid #30414a;background:#071018;color:#9cadb6;border-radius:7px;padding:5px 7px;font:850 5.8px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-constellation-btn:hover{border-color:var(--mode);color:#fff}.helios-edge-constellation-btn.primary{border-color:#33596b;color:#9fe5ff;background:#07141b}.helios-edge-constellation-output{margin-top:6px;border:1px solid #1f3038;border-radius:7px;background:#03080b;padding:6px;color:#71838d;font:5.8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-constellation-output b{color:#c4d2d8}.helios-edge-constellation-note{margin-top:6px;color:#667983;font:5.5px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-edge-constellation-note strong{color:#aabac2}@media(max-width:760px){.helios-edge-constellation-nodes{grid-template-columns:1fr}.helios-edge-constellation-node{padding:8px}.helios-edge-constellation-synthesis{flex-direction:column;gap:2px}}@media(prefers-reduced-motion:reduce){.helios-edge-constellation-card *{scroll-behavior:auto!important}}
    `;document.head.appendChild(s);
  }

  async function loadCore(){
    if(state.core)return state.core;
    state.core=await import('./src/helios-edge-constellation.js?v=1.1.0');
    return state.core;
  }

  function nodeMarkup(label,kind){
    return `<div class="helios-edge-constellation-node"><span>${kind}</span><b>${label}</b><em>PLANNED · NOT CONNECTED</em><div class="helios-edge-constellation-pair"><div class="helios-edge-constellation-arm i0">I0 · 50%</div><div class="helios-edge-constellation-vs">↔</div><div class="helios-edge-constellation-arm">RANDOM · 50%</div></div></div>`;
  }

  function build(){
    const body=document.querySelector('#helios-buyer-lab .helios-buyer-lab-body');
    if(!body||document.getElementById('helios-edge-constellation-card'))return false;
    const card=document.createElement('section');card.id='helios-edge-constellation-card';card.className='helios-edge-constellation-card';card.innerHTML=`
      <div class="helios-edge-constellation-head"><h4>EDGE CONSTELLATION · I0 REPLICATION PLANE</h4><span class="helios-edge-constellation-badge">MULTI-NODE / EVIDENCE</span></div>
      <div class="helios-edge-constellation-law"><strong>NODE POWER ≠ EVIDENCE WEIGHT</strong>Every device must win or lose its own local I0↔random mirror before HELIOS compares replication across hardware classes.</div>
      <div class="helios-edge-constellation-nodes">
        ${nodeMarkup('NERDMINER V2 / ESP32','MICRO EDGE')}
        ${nodeMarkup('HELIOS DESKTOP CPU','DESKTOP FABRIC')}
        ${nodeMarkup('EXTERNAL ASIC GATEWAY','ASIC CLASS')}
      </div>
      <div class="helios-edge-constellation-synthesis"><span>LOCAL EFFECT VECTOR × NODE</span><b>→ INDEPENDENCE GATE →</b><span>MEDIAN DELTA + DIRECTIONAL CONSISTENCY</span></div>
      <div class="helios-edge-constellation-actions"><button id="helios-edge-constellation-plan" class="helios-edge-constellation-btn primary" type="button">BUILD CONSTELLATION PLAN</button><button id="helios-edge-constellation-copy" class="helios-edge-constellation-btn" type="button">COPY CAMPAIGN JSON</button></div>
      <div id="helios-edge-constellation-output" class="helios-edge-constellation-output"><b>PUBLIC PLAN ONLY.</b> No device, pool, serial port, wallet, hashrate, temperature or watt telemetry is requested by this card.</div>
      <div class="helios-edge-constellation-note"><strong>Replication law:</strong> raw checked work is normalized inside each node, then removed as a cross-node voting weight. Completed reports still pass through Evidence Independence Engine; correlated lineage is preserved but cannot masquerade as extra independent replication.</div>`;
    const edge=document.getElementById('helios-edge-hash-lab-card');
    if(edge?.parentNode===body)edge.after(card);else body.prepend(card);
    state.host=card;state.attached=true;bind();return true;
  }

  function renderPlan(plan){
    const out=state.host?.querySelector('#helios-edge-constellation-output');if(!out)return;
    out.replaceChildren();
    out.append(
      text('b',`${plan.mode} · ${plan.nodes.length} NODE-LOCAL UNITS`),
      text('div',`PAIRING ${plan.nodes[0].local_experiment.pairing}`),
      text('div',`INDEPENDENCE ${plan.replication_law.independence_engine}`),
      text('div',`SYNTHESIS ${plan.replication_law.aggregation}`),
      text('div',`GATE ${plan.execution_gate}`)
    );
  }

  async function buildPlan(){
    try{
      const core=await loadCore();
      state.lastPlan=core.createEdgeConstellationPlan({campaign_id:'helios-public-constellation-preview'});
      renderPlan(state.lastPlan);
      window.dispatchEvent(new CustomEvent('helios:edge-constellation-plan',{detail:{version:VERSION,node_count:state.lastPlan.nodes.length,execution_ready:false,node_power_not_evidence_weight:true,replication_count_not_equal_independent_root_count:true,presentation_only:true,game_effect:'NONE'}}));
    }catch(err){
      const out=state.host?.querySelector('#helios-edge-constellation-output');if(out)out.textContent=`PLAN ERROR · ${err?.message||err}`;
    }
  }

  async function copyPlan(button){
    try{
      const core=await loadCore();
      const payload=state.lastPlan||core.createEdgeConstellationPlan({campaign_id:'helios-public-constellation-preview'});
      await navigator.clipboard.writeText(JSON.stringify(payload,null,2));
      button.textContent='COPIED';setTimeout(()=>button.textContent='COPY CAMPAIGN JSON',1000);
    }catch(_){button.textContent='COPY FAILED';setTimeout(()=>button.textContent='COPY CAMPAIGN JSON',1000);}
  }

  function bind(){
    state.host.querySelector('#helios-edge-constellation-plan')?.addEventListener('click',buildPlan);
    const copy=state.host.querySelector('#helios-edge-constellation-copy');copy?.addEventListener('click',()=>copyPlan(copy));
    window.HELIOS_EDGE_CONSTELLATION_UI=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,node_classes:['NERDMINER_ESP32','DESKTOP_CPU','ASIC_GATEWAY'],node_power_not_evidence_weight:true,replication_count_not_equal_independent_root_count:true,unknown_lineage_not_independent:true,raw_hashrate_cross_node_weighting:false,last_plan:state.lastPlan?{mode:state.lastPlan.mode,node_count:state.lastPlan.nodes.length}:null,public_device_connection:false,public_pool_connection:false,presentation_only:true,game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE'})});
    window.dispatchEvent(new CustomEvent('helios:edge-constellation-ready',{detail:{version:VERSION,node_local_strict_50_50:true,node_power_not_evidence_weight:true,independence_gate:true,unknown_lineage_not_independent:true,median_local_delta:true,directional_consistency:true,public_device_connection:false,presentation_only:true,game_effect:'NONE'}}));
  }

  function init(){let attempts=0;const retry=()=>{injectStyles();if(build()||++attempts>=200)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();