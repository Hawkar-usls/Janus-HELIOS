(() => {
  'use strict';

  const VERSION='1.0.0';
  const state={attached:false,host:null,core:null,lastPlan:null};
  const text=(tag,value,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=String(value??'');return el;};

  function injectStyles(){
    if(document.getElementById('helios-eie-styles'))return;
    const s=document.createElement('style');s.id='helios-eie-styles';s.textContent=`
      .helios-eie-card{border:1px solid #344052;border-radius:10px;background:radial-gradient(circle at 90% 0%,#d7a7ff0e,transparent 34%),linear-gradient(180deg,#080d15,#04080d);padding:8px;position:relative;overflow:hidden}.helios-eie-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.helios-eie-head h4{margin:0;color:#d5dce8;font:900 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.1em}.helios-eie-badge{border:1px solid #51446a;border-radius:999px;background:#100c18;color:#d7a7ff;padding:3px 6px;font:850 5.7px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-law{margin-top:6px;border:1px solid #2b3443;border-radius:8px;background:#050910;padding:7px;text-align:center;color:#7d8798;font:700 5.5px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-law strong{display:block;color:#f0e7ff;font-size:7px;letter-spacing:.05em}.helios-eie-funnel{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:7px}.helios-eie-stage{border:1px solid #293441;border-radius:8px;background:#050a10;padding:6px;text-align:center}.helios-eie-stage span{display:block;color:#687586;font:700 5px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-stage b{display:block;margin-top:2px;color:#c8d1dd;font:850 6.2px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-stage:last-child{border-color:#4c4061}.helios-eie-stage:last-child b{color:#d7a7ff}.helios-eie-roots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:6px}.helios-eie-root{border:1px solid #26313d;border-radius:7px;background:#04090e;padding:5px;color:#748393;font:750 5.1px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-root b{display:block;color:#aeb9c6;font-size:5.7px;margin-top:2px}.helios-eie-graph{margin-top:6px;border-top:1px solid #202a36;border-bottom:1px solid #202a36;padding:6px;text-align:center;color:#738091;font:750 5.4px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-graph b{color:#d7a7ff}.helios-eie-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.helios-eie-btn{border:1px solid #354151;background:#070c13;color:#9aa7b5;border-radius:7px;padding:5px 7px;font:850 5.8px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-btn:hover{border-color:#8b69b3;color:#fff}.helios-eie-btn.primary{border-color:#59466f;background:#110c18;color:#dfbdff}.helios-eie-output{margin-top:6px;border:1px solid #222e3a;border-radius:7px;background:#03070c;padding:6px;color:#778595;font:5.8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-output b{color:#cbd4df}.helios-eie-note{margin-top:6px;color:#687687;font:5.5px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-eie-note strong{color:#aeb9c6}@media(max-width:760px){.helios-eie-funnel{grid-template-columns:repeat(2,minmax(0,1fr))}.helios-eie-roots{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:420px){.helios-eie-roots{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  async function loadCore(){
    if(state.core)return state.core;
    state.core=await import('./src/helios-evidence-independence.js?v=1.0.0');
    return state.core;
  }

  function root(label,key){return `<div class="helios-eie-root">${label}<b>${key}</b></div>`;}

  function build(){
    const body=document.querySelector('#helios-buyer-lab .helios-buyer-lab-body');
    if(!body||document.getElementById('helios-evidence-independence-card'))return false;
    const card=document.createElement('section');card.id='helios-evidence-independence-card';card.className='helios-eie-card';card.innerHTML=`
      <div class="helios-eie-head"><h4>EVIDENCE INDEPENDENCE ENGINE · LINEAGE GRAPH</h4><span class="helios-eie-badge">R2 / REPLICATION</span></div>
      <div class="helios-eie-law"><strong>REPLICATION COUNT ≠ INDEPENDENT ROOT COUNT</strong>Correlated machines stay in evidence, but they do not gain extra independent votes merely by producing more reports.</div>
      <div class="helios-eie-funnel"><div class="helios-eie-stage"><span>RAW REPORTS</span><b>NODES</b></div><div class="helios-eie-stage"><span>LOCAL GATE</span><b>I0 ↔ RANDOM</b></div><div class="helios-eie-stage"><span>LINEAGE ROOTS</span><b>KNOWN / SHARED</b></div><div class="helios-eie-stage"><span>STRONG SET</span><b>UNRESOLVED</b></div></div>
      <div class="helios-eie-roots">${root('PHYSICAL','device root')}${root('EXECUTION','firmware / executor')}${root('AUTHORITY','pool / provider')}${root('SITE + NETWORK','rack / egress lineage')}${root('OBSERVATION','sealed time epoch')}${root('JOB STREAM','cross-node job lineage')}</div>
      <div class="helios-eie-graph">COMPLETE NODE EFFECTS → <b>STRONG-INDEPENDENCE GRAPH → MAXIMUM CLIQUE</b> → CROSS-NODE SYNTHESIS</div>
      <div class="helios-eie-actions"><button id="helios-eie-plan" class="helios-eie-btn primary" type="button">BUILD LINEAGE PLAN</button><button id="helios-eie-copy" class="helios-eie-btn" type="button">COPY ROOT TEMPLATE</button></div>
      <div id="helios-eie-output" class="helios-eie-output"><b>PUBLIC PLAN ONLY.</b> No lineage roots are invented. Real independence remains unresolved until production nodes provide attested roots.</div>
      <div class="helios-eie-note"><strong>Unknown ≠ independent.</strong> Different hardware classes do not automatically create independence, and identical hardware classes do not automatically destroy it. The engine evaluates dependency lineage, not marketing labels or raw hashrate.</div>`;
    const constellation=document.getElementById('helios-edge-constellation-card');
    if(constellation?.parentNode===body)constellation.after(card);else body.prepend(card);
    state.host=card;state.attached=true;bind();return true;
  }

  function renderPlan(plan){
    const out=state.host?.querySelector('#helios-eie-output');if(!out)return;
    out.replaceChildren();
    out.append(text('b',`${plan.law} · ${plan.required_roots.length} REQUIRED ROOTS`),text('div',`SYNTHESIS ${plan.synthesis_unit}`),text('div',`UNKNOWN ${plan.unknown_policy}`),text('div','LIVE STRONG SET: UNRESOLVED · PRODUCTION ATTESTATION REQUIRED'));
  }

  async function buildPlan(){
    try{
      const core=await loadCore();
      state.lastPlan=core.createEvidenceIndependencePlan({campaign_id:'helios-public-independence-preview',nodes:[{node_id:'edge-01'},{node_id:'edge-02'},{node_id:'edge-03'}]});
      renderPlan(state.lastPlan);
      window.dispatchEvent(new CustomEvent('helios:evidence-independence-plan',{detail:{version:VERSION,required_root_count:state.lastPlan.required_roots.length,strong_set:'UNRESOLVED',presentation_only:true,game_effect:'NONE'}}));
    }catch(err){const out=state.host?.querySelector('#helios-eie-output');if(out)out.textContent=`PLAN ERROR · ${err?.message||err}`;}
  }

  async function copyTemplate(button){
    const template={schema:'janus.helios.replication-lineage.v1',node_id:'<PSEUDONYMOUS_NODE_ID>',node_class:'<HARDWARE_CLASS>',physical_device_root:'<ATTESTED_DEVICE_ROOT>',execution_lineage_root:'<FIRMWARE_OR_EXECUTOR_ROOT>',authority_root:'<POOL_PROVIDER_OR_GATEWAY_ROOT>',site_network_root:'<SITE_NETWORK_EGRESS_ROOT>',observation_epoch_root:'<SEALED_OBSERVATION_EPOCH>',job_stream_root:'<CROSS_NODE_JOB_STREAM_ROOT>',note:'Template only. Placeholder values are not evidence.'};
    try{await navigator.clipboard.writeText(JSON.stringify(template,null,2));button.textContent='COPIED';setTimeout(()=>button.textContent='COPY ROOT TEMPLATE',1000);}catch(_){button.textContent='COPY FAILED';setTimeout(()=>button.textContent='COPY ROOT TEMPLATE',1000);}
  }

  function bind(){
    state.host.querySelector('#helios-eie-plan')?.addEventListener('click',buildPlan);
    const copy=state.host.querySelector('#helios-eie-copy');copy?.addEventListener('click',()=>copyTemplate(copy));
    window.HELIOS_EVIDENCE_INDEPENDENCE_UI=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,law:'REPLICATION_COUNT_NOT_EQUAL_INDEPENDENT_ROOT_COUNT',strong_independence_roots:6,unknown_counts_as_independent:false,hardware_class_is_independence_root:false,public_live_lineage:false,fake_independence_score:false,presentation_only:true,game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE'})});
    window.dispatchEvent(new CustomEvent('helios:evidence-independence-ready',{detail:{version:VERSION,maximum_clique_independence_set:true,unknown_counts_as_independent:false,raw_hashrate_weight:false,human_blind:true,presentation_only:true,game_effect:'NONE'}}));
  }

  function init(){let attempts=0;const retry=()=>{injectStyles();if(build()||++attempts>=220)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();