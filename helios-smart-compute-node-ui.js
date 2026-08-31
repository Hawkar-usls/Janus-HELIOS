(() => {
  'use strict';

  const VERSION='1.1.0';
  const state={attached:false,host:null,core:null,lastPreview:null};
  const text=(tag,value,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=String(value??'');return el;};

  function injectStyles(){
    if(document.getElementById('helios-smart-node-styles'))return;
    const s=document.createElement('style');s.id='helios-smart-node-styles';s.textContent=`
      .helios-smart-node-card{border:1px solid #2c4650;border-radius:10px;background:radial-gradient(circle at 90% 0,#80d7ff0e,transparent 38%),linear-gradient(180deg,#071116,#04090d);padding:8px;position:relative;overflow:hidden}.helios-smart-node-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.helios-smart-node-head h4{margin:0;color:#dcebf0;font:900 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.1em}.helios-smart-node-badge{border:1px solid #315363;border-radius:999px;padding:3px 6px;background:#07161c;color:#80d7ff;font:850 5.7px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-smart-node-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}.helios-smart-node-chip{min-width:0;border:1px solid #22353e;border-radius:8px;background:#040a0e;padding:6px}.helios-smart-node-chip span{display:block;color:#687c85;font:750 5.2px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.07em}.helios-smart-node-chip b{display:block;margin-top:2px;color:#c8d8df;font:850 6.2px ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.helios-smart-node-chip.good b{color:var(--good)}.helios-smart-node-chip.gold b{color:#ffd36a}.helios-smart-node-flow{margin-top:7px;border:1px solid #1d3139;border-radius:8px;background:#03080b;padding:7px;text-align:center;color:#80929b;font:750 5.6px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-smart-node-flow strong{color:#c9d8df}.helios-smart-node-actions{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap}.helios-smart-node-btn{border:1px solid #31505d;background:#061017;color:#9fc2d0;border-radius:7px;padding:5px 7px;font:850 5.8px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-smart-node-btn:hover{border-color:#80d7ff;color:#fff}.helios-smart-node-output{margin-top:6px;border:1px solid #1d3038;border-radius:7px;background:#02070a;padding:6px;color:#748890;font:5.8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-smart-node-output b{color:#bcd1d9}.helios-smart-node-note{margin-top:6px;color:#667b84;font:5.5px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-smart-node-note strong{color:#a9bcc4}@media(max-width:620px){.helios-smart-node-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;document.head.appendChild(s);
  }

  async function loadCore(){
    if(state.core)return state.core;
    state.core=await import('./src/helios-smart-compute-node.js?v=1.1.0');
    return state.core;
  }

  function build(){
    const body=document.querySelector('#helios-buyer-lab .helios-buyer-lab-body');
    if(!body||document.getElementById('helios-smart-compute-node-card'))return false;
    const card=document.createElement('section');card.id='helios-smart-compute-node-card';card.className='helios-smart-node-card';card.innerHTML=`
      <div class="helios-smart-node-head"><h4>SMART COMPUTE NODE · WORK + DEVICE SELF-MONITORING</h4><span class="helios-smart-node-badge">FUSION LAYER</span></div>
      <div class="helios-smart-node-grid">
        <div class="helios-smart-node-chip gold"><span>WORK EVIDENCE</span><b>HASH / AI / RENDER / SCIENCE</b></div>
        <div class="helios-smart-node-chip good"><span>DEVICE CARE</span><b>GUARDIAN · LOCAL FIRST</b></div>
        <div class="helios-smart-node-chip"><span>EXECUTION</span><b>HOST-FIRST BUDGET</b></div>
        <div class="helios-smart-node-chip"><span>HISTORY</span><b>DEVICE HEALTH PASSPORT</b></div>
        <div class="helios-smart-node-chip"><span>TRUTH</span><b>PROVENANCE ENVELOPE</b></div>
        <div class="helios-smart-node-chip"><span>REPLICATION</span><b>INDEPENDENCE LINEAGE</b></div>
      </div>
      <div class="helios-smart-node-flow"><strong>ONE NODE RECORD</strong> · WORK → GUARDIAN → EXECUTION BUDGET → PASSPORT → PROVENANCE → INDEPENDENCE ROOTS</div>
      <div class="helios-smart-node-actions"><button id="helios-smart-node-preview" class="helios-smart-node-btn" type="button">BUILD HONEST PREVIEW</button></div>
      <div id="helios-smart-node-output" class="helios-smart-node-output"><b>PUBLIC PAGE:</b> architecture preview only. Live work telemetry and hardware sensors require an approved local agent or edge bridge.</div>
      <div class="helios-smart-node-note"><strong>Core law:</strong> the node records work and machine state together without screen, keyboard, mouse, microphone, browser-history or process-name telemetry. Generic AI/render/science work uses workload-appropriate units; I0/hash experiments retain checked-work normalization. Missing sensor evidence stays UNKNOWN.</div>`;
    const edge=document.getElementById('helios-edge-hash-lab-card');if(edge?.parentNode===body)edge.after(card);else body.appendChild(card);
    state.host=card;state.attached=true;bind();return true;
  }

  async function preview(){
    const out=state.host?.querySelector('#helios-smart-node-output');if(!out)return;
    try{
      const core=await loadCore();
      state.lastPreview=core.buildSmartComputeNodeSnapshot({
        node_id:'public-preview-node',
        node_class:'NERDMINER_ESP32',
        resource_class:'CPU',
        resource_policy:{cpu_percent:15,gpu_percent:0},
        edge_manifest:{firmware_mode:'STOCK_EXTERNAL'},
        work_samples:[],
        replication_lineage:{}
      });
      out.replaceChildren(
        text('b',`${state.lastPreview.fusion_state} · LIVE SENSORS REQUIRED`),
        text('div',`GUARDIAN ${state.lastPreview.guardian.state} · WORK ${state.lastPreview.work_evidence.comparison.verdict}`),
        text('div',`LINEAGE ROOTS ${state.lastPreview.replication_lineage.known_root_count}/6 · AUTHORITY ${state.lastPreview.readiness.authoritative_work_evidence?'AUTHORITATIVE':'NON-AUTHORITATIVE'}`)
      );
      window.dispatchEvent(new CustomEvent('helios:smart-compute-node-preview',{detail:{version:VERSION,presentation_only:true,live_device_access:false,generic_work_evidence_supported:true,game_effect:'NONE'}}));
    }catch(err){out.textContent=`PREVIEW ERROR · ${err?.message||err}`;}
  }

  function bind(){
    state.host.querySelector('#helios-smart-node-preview')?.addEventListener('click',preview);
    window.HELIOS_SMART_COMPUTE_NODE_UI=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,presentation_only:true,live_device_access:false,work_and_device_fused:true,generic_work_evidence_supported:true,edge_hash_evidence_supported:true,human_blind:true,last_preview:state.lastPreview?{fusion_state:state.lastPreview.fusion_state,guardian_state:state.lastPreview.guardian.state}:null,game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE'})});
    window.dispatchEvent(new CustomEvent('helios:smart-compute-node-ready',{detail:{version:VERSION,work_and_device_fused:true,generic_work_evidence_supported:true,edge_hash_evidence_supported:true,device_health_passport:true,provenance:true,independence_lineage:true,presentation_only:true,live_device_access:false,game_effect:'NONE'}}));
  }

  function init(){let attempts=0;const retry=()=>{injectStyles();if(build()||++attempts>=180)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
