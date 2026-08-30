(() => {
  'use strict';

  const VERSION='1.0.0';
  const PASSPORT_KEY='HELIOS_DEMO_COMPUTE_PASSPORT_V1';
  const LIFECYCLE=['ARMED','ADMITTING','SCHEDULING','RUNNING','VERIFYING','RECEIPT'];
  const ROUTE_HINTS=Object.freeze({
    market:{resource:'HYBRID',fit:'MARKET ADAPTER'},
    science:{resource:'GPU',fit:'RESEARCH MANIFEST'},
    jackpot:{resource:'HYBRID',fit:'POOL ADAPTER'},
    datacenter:{resource:'HYBRID',fit:'HPC / BATCH'},
    operator:{resource:'MANIFEST',fit:'PRIVATE GATEWAY'},
    custom:{resource:'MANIFEST',fit:'CUSTOM ADAPTER'}
  });
  const DEFAULT_GOVERNOR=Object.freeze({
    idle_only:true,
    ac_only:true,
    gpu_while_idle:true,
    pause_on_interaction:true,
    thermal_ceiling_c:75,
    watt_ceiling_w:180,
    max_concurrent:1,
    quiet_hours_enabled:false,
    quiet_from:'23:00',
    quiet_to:'07:00',
    external_energy_signal:'NOT_CONNECTED'
  });

  const state={
    attached:false,router:null,routeGrid:null,receipt:null,receiptStatus:null,computeState:null,
    powerOn:null,powerOff:null,consent:null,trust:null,lifecycle:null,buyerLab:null,passport:[],
    lastReceiptId:null,receiptObserver:null,routeObserver:null,computeObserver:null,lifecycleTimer:0,
    lifecycleStage:'ARMED',governor:{...DEFAULT_GOVERNOR},selfTest:null,allocation:{a:'science',b:'datacenter',weight:60}
  };

  const text=(tag,value,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=String(value??'');return el;};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const activeRouteKey=()=>state.routeGrid?.querySelector('.route.active')?.dataset.route||'market';
  const computeActive=()=>Boolean(state.computeState?.textContent?.includes('ACTIVE'));

  function injectStyles(){
    if(document.getElementById('helios-buyer-cockpit-styles')) return;
    const style=document.createElement('style');
    style.id='helios-buyer-cockpit-styles';
    style.textContent=`
      .helios-route-hints{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}.helios-route-hint{border:1px solid #26343e;background:#061018;color:#748690;border-radius:999px;padding:3px 5px;font:700 5.5px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.05em}.route.active .helios-route-hint:first-child{border-color:var(--mode);color:var(--mode)}
      .helios-trust-lifecycle{margin-top:7px;border:1px solid #25333d;border-radius:11px;background:linear-gradient(180deg,#071018,#050a0f);padding:8px;display:grid;gap:7px}.helios-trust-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.helios-trust-head span{font:800 6.5px ui-monospace,SFMono-Regular,Consolas,monospace;color:#75858f;letter-spacing:.1em}.helios-trust-head b{font:850 7px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--cold)}
      .helios-trust-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}.helios-trust-chip{min-width:0;border:1px solid #23313a;border-radius:8px;background:#050b10;padding:6px}.helios-trust-chip span{display:block;color:#647580;font:700 5.5px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}.helios-trust-chip b{display:block;margin-top:2px;color:#b9c7cf;font:850 7px ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.helios-trust-chip.proof b{color:#ffd36a}.helios-trust-chip.running b{color:var(--good)}
      .helios-lifecycle{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px}.helios-life-step{position:relative;text-align:center;border-top:2px solid #26343d;padding-top:4px;color:#586973;font:700 5px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.02em}.helios-life-step.past{border-color:#49606d;color:#7c909b}.helios-life-step.active{border-color:var(--mode);color:var(--mode);text-shadow:0 0 8px var(--mode)}
      .helios-buyer-lab{margin-top:8px;border:1px solid #283843;border-radius:11px;background:#050a0f;overflow:hidden}.helios-buyer-lab>summary{list-style:none;cursor:pointer;padding:8px 9px;display:flex;justify-content:space-between;align-items:center;gap:8px;color:#8b9aa4;font:850 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.09em}.helios-buyer-lab>summary::-webkit-details-marker{display:none}.helios-buyer-lab>summary:after{content:'+';color:var(--mode);font-size:12px}.helios-buyer-lab[open]>summary:after{content:'−'}.helios-buyer-lab-body{border-top:1px solid #1b2831;padding:8px;display:grid;gap:8px}
      .helios-lab-card{border:1px solid #1f2e37;border-radius:9px;background:#061018;padding:8px}.helios-lab-card h4{margin:0 0 6px;color:#aebdc6;font:850 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.09em}.helios-lab-note{color:#667781;font:6px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-lab-note strong{color:#9db0bb}
      .helios-governor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.helios-policy-toggle{display:flex;gap:5px;align-items:center;border:1px solid #1f2c35;border-radius:7px;background:#050b10;padding:5px;color:#82939d;font:650 6px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-policy-toggle input{accent-color:var(--mode)}.helios-policy-row{display:grid;grid-template-columns:80px minmax(0,1fr) 48px;gap:5px;align-items:center;margin-top:5px;color:#778994;font:650 6px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-policy-row input[type=range]{width:100%;accent-color:var(--mode)}.helios-policy-row b{text-align:right;color:#a9bbc5}.helios-quiet-row{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px}.helios-quiet-row input{min-width:0;border:1px solid #25343e;background:#050b10;color:#b8c7cf;border-radius:6px;padding:4px;font:6px ui-monospace,SFMono-Regular,Consolas,monospace}
      .helios-lab-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}.helios-lab-btn{border:1px solid #2a3a45;background:#081119;color:#91a2ac;border-radius:7px;padding:5px 7px;font:800 6px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.04em}.helios-lab-btn:hover{border-color:var(--mode);color:#fff}.helios-lab-btn.primary{border-color:#31513e;color:var(--good);background:#08140f}
      .helios-self-result,.helios-mixer-result,.helios-passport-result{margin-top:6px;border:1px solid #1f2c35;border-radius:7px;background:#040a0e;padding:6px;color:#7f919b;font:6px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-self-result b,.helios-mixer-result b,.helios-passport-result b{color:#b7c7d0}
      .helios-mixer-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}.helios-mixer-grid select{min-width:0;border:1px solid #26353f;background:#050b10;color:#aebdc6;border-radius:6px;padding:5px;font:6px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-mixer-weight{display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:6px;align-items:center;margin-top:6px}.helios-mixer-weight input{width:100%;accent-color:var(--mode)}.helios-mixer-weight b{color:var(--mode);font:800 7px ui-monospace,SFMono-Regular,Consolas,monospace}
      .helios-chain{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px}.helios-chain-node{border:1px solid #20303a;border-radius:7px;background:#050b10;padding:5px;text-align:center}.helios-chain-node span{display:block;color:#5f717c;font:650 5px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-chain-node b{display:block;margin-top:2px;color:#92a4ae;font:800 5.5px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-chain-node.demo b{color:#ffd36a}.helios-chain-node.core b{color:var(--good)}
      .helios-constellation{position:relative;height:118px;border:1px solid #172730;border-radius:9px;background:radial-gradient(circle at 50% 50%,var(--mode-soft),transparent 34%),radial-gradient(circle,#fff 0 1px,transparent 1.2px);background-size:auto,31px 31px;overflow:hidden}.helios-constellation-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:44px;height:44px;border:1px solid var(--mode);border-radius:50%;display:grid;place-items:center;background:#071018;box-shadow:0 0 18px var(--mode-soft);color:var(--mode);font:900 6px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-agent-node{position:absolute;border:1px solid #2a3a44;border-radius:999px;background:#061018;padding:4px 6px;color:#82949e;font:750 5px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-agent-node.active{border-color:var(--good);color:var(--good)}.helios-agent-node.hook{border-style:dashed}.helios-agent-node.n1{left:8%;top:16%}.helios-agent-node.n2{right:7%;top:18%}.helios-agent-node.n3{left:8%;bottom:15%}.helios-agent-node.n4{right:7%;bottom:15%}
      .helios-explain-list{margin:0;padding-left:15px;color:#7b8d97;font:6px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-explain-list strong{color:#b8c8d0}.helios-hook-row{display:flex;justify-content:space-between;gap:8px;border-top:1px solid #17242c;padding:4px 0;color:#687a85;font:6px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-hook-row b{color:#9bacb6}.helios-hook-row:first-child{border-top:0}
      @media(max-width:620px){.helios-trust-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.helios-governor-grid{grid-template-columns:1fr}.helios-chain{grid-template-columns:repeat(3,minmax(0,1fr))}.helios-chain-node:last-child{grid-column:2/3}}
    `;
    document.head.appendChild(style);
  }

  function addRouteHints(){
    for(const route of state.routeGrid?.querySelectorAll('.route')||[]){
      if(route.querySelector('.helios-route-hints')) continue;
      const hint=ROUTE_HINTS[route.dataset.route]||{resource:'MANIFEST',fit:'BUYER DEFINED'};
      const host=document.createElement('div');host.className='helios-route-hints';
      host.append(text('span',`PREF ${hint.resource}`,'helios-route-hint'),text('span',hint.fit,'helios-route-hint'));
      route.appendChild(host);
    }
  }

  function buildTrustLifecycle(){
    const buttons=state.router.querySelector('.router-buttons');
    if(!buttons||document.getElementById('helios-trust-lifecycle')) return false;
    const host=document.createElement('div');host.id='helios-trust-lifecycle';host.className='helios-trust-lifecycle';
    host.innerHTML=`
      <div class="helios-trust-head"><span>DEMO TRUST + COMPUTE LIFECYCLE</span><b id="helios-life-label">ARMED</b></div>
      <div class="helios-trust-strip">
        <div class="helios-trust-chip" id="trust-agent"><span>AGENT</span><b>BROWSER DEMO</b></div>
        <div class="helios-trust-chip" id="trust-provider"><span>PROVIDER</span><b>DEMO ROUTE</b></div>
        <div class="helios-trust-chip" id="trust-verifier"><span>VERIFIER</span><b>DEMO HOOK</b></div>
        <div class="helios-trust-chip proof" id="trust-proof"><span>PROOF</span><b>ROUTE PREVIEW</b></div>
      </div>
      <div class="helios-lifecycle" id="helios-lifecycle"></div>`;
    buttons.after(host);state.trust=host;state.lifecycle=host.querySelector('#helios-lifecycle');
    for(const stage of LIFECYCLE){const s=text('div',stage==='ADMITTING'?'ADMIT':stage==='SCHEDULING'?'SCHEDULE':stage==='VERIFYING'?'VERIFY':stage,'helios-life-step');s.dataset.stage=stage;state.lifecycle.appendChild(s);}
    setLifecycle('ARMED');return true;
  }

  function setLifecycle(stage){
    if(!LIFECYCLE.includes(stage)) stage='ARMED';
    state.lifecycleStage=stage;
    const idx=LIFECYCLE.indexOf(stage);
    for(const el of state.lifecycle?.children||[]){const i=LIFECYCLE.indexOf(el.dataset.stage);el.classList.toggle('past',i<idx);el.classList.toggle('active',i===idx);}
    const label=document.getElementById('helios-life-label');if(label)label.textContent=`${stage} · SIMULATED FLOW`;
  }

  function beginLifecycle(){
    clearTimeout(state.lifecycleTimer);setLifecycle('ADMITTING');
    state.lifecycleTimer=setTimeout(()=>{if(computeActive())setLifecycle('RUNNING');else{setLifecycle('SCHEDULING');state.lifecycleTimer=setTimeout(()=>{if(computeActive())setLifecycle('RUNNING');},420);}},340);
  }

  function pulseVerification(){
    if(!computeActive()) return;
    clearTimeout(state.lifecycleTimer);setLifecycle('VERIFYING');
    state.lifecycleTimer=setTimeout(()=>{setLifecycle('RECEIPT');state.lifecycleTimer=setTimeout(()=>{if(computeActive())setLifecycle('RUNNING');},520);},380);
  }

  function proofLabel(obj){
    const mode=String(obj?.mode||'').toUpperCase();const proof=String(obj?.proof_kind||obj?.expected_proof||obj?.verification?.status||'').toUpperCase();
    if(mode==='ROUTE_PREVIEW') return 'ROUTE PREVIEW';
    if(mode==='SIMULATION'||proof.includes('MOCK')) return 'DEMO PROOF';
    if(obj?.verified===true||proof==='VERIFIED') return 'VERIFIED';
    return 'UNVERIFIED';
  }

  function updateTrust(obj=null){
    const route=activeRouteKey().toUpperCase();
    const agent=state.trust?.querySelector('#trust-agent b');const provider=state.trust?.querySelector('#trust-provider b');const verifier=state.trust?.querySelector('#trust-verifier b');const proof=state.trust?.querySelector('#trust-proof b');
    if(agent) agent.textContent=state.selfTest?'LOCAL CHECKED':'BROWSER DEMO';
    if(provider) provider.textContent=`${route} · DEMO`;
    if(verifier) verifier.textContent=obj&&String(obj.proof_kind||'').includes('MOCK')?'MOCK VERIFIER':'VERIFIER HOOK';
    if(proof) proof.textContent=obj?proofLabel(obj):'ROUTE PREVIEW';
    state.trust?.querySelector('#trust-agent')?.classList.toggle('running',computeActive());
  }

  function governorMarkup(){
    return `<div class="helios-lab-card"><h4>ADVANCED RESOURCE GOVERNOR · POLICY PREVIEW</h4>
      <div class="helios-governor-grid">
        <label class="helios-policy-toggle"><input data-gov="idle_only" type="checkbox" checked> IDLE ONLY</label>
        <label class="helios-policy-toggle"><input data-gov="ac_only" type="checkbox" checked> AC POWER ONLY</label>
        <label class="helios-policy-toggle"><input data-gov="gpu_while_idle" type="checkbox" checked> GPU WHILE IDLE</label>
        <label class="helios-policy-toggle"><input data-gov="pause_on_interaction" type="checkbox" checked> PAUSE ON INTERACTION</label>
      </div>
      <div class="helios-policy-row"><span>THERMAL CEILING</span><input data-gov="thermal_ceiling_c" type="range" min="55" max="90" step="5" value="75"><b data-out="thermal_ceiling_c">75°C</b></div>
      <div class="helios-policy-row"><span>WATT CEILING</span><input data-gov="watt_ceiling_w" type="range" min="60" max="350" step="10" value="180"><b data-out="watt_ceiling_w">180W</b></div>
      <div class="helios-policy-row"><span>CONCURRENCY</span><input data-gov="max_concurrent" type="range" min="1" max="8" step="1" value="1"><b data-out="max_concurrent">1</b></div>
      <div class="helios-governor-grid" style="margin-top:5px"><label class="helios-policy-toggle"><input data-gov="quiet_hours_enabled" type="checkbox"> QUIET HOURS</label><div class="helios-lab-note">Desktop Agent is authoritative in production.</div></div>
      <div class="helios-quiet-row"><input data-gov="quiet_from" type="time" value="23:00"><input data-gov="quiet_to" type="time" value="07:00"></div>
      <div class="helios-lab-note" style="margin-top:6px"><strong>DEMO POLICY ONLY.</strong> This static page does not enforce thermals, watts, battery or scheduler admission. The existing Desktop Agent/Fabric is the production enforcement point.</div>
    </div>`;
  }

  function mixerMarkup(){
    return `<div class="helios-lab-card"><h4>ALLOCATION MIXER · BUYER PREVIEW</h4><div class="helios-mixer-grid"><select id="helios-mix-a"></select><select id="helios-mix-b"></select></div><div class="helios-mixer-weight"><input id="helios-mix-weight" type="range" min="10" max="90" step="10" value="60"><b id="helios-mix-weight-label">60/40</b></div><div id="helios-mixer-result" class="helios-mixer-result"></div><div class="helios-lab-note" style="margin-top:5px"><strong>PREVIEW ONLY:</strong> canonical Router core already supports weighted allocations; this public demo keeps one active Route so the selling story stays simple.</div></div>`;
  }

  function diagnosticsMarkup(){
    return `<div class="helios-lab-card"><h4>CAPABILITY SELF-TEST · OPT-IN / LOCAL ONLY</h4><div class="helios-lab-note">Reports only coarse admission classes. No GPU vendor/model, exact adapter limits or network fingerprint is collected or transmitted.</div><div class="helios-lab-actions"><button id="helios-self-test" class="helios-lab-btn primary" type="button">CHECK THIS DEVICE</button></div><div id="helios-self-result" class="helios-self-result">NOT RUN · buyer can connect Desktop Agent capability evidence here.</div></div>`;
  }

  function verificationMarkup(){
    return `<div class="helios-lab-card"><h4>VERIFICATION + ATTESTATION CHAIN</h4><div class="helios-chain"><div class="helios-chain-node demo"><span>MANIFEST</span><b>DEMO</b></div><div class="helios-chain-node"><span>ARTIFACT</span><b>DIGEST HOOK</b></div><div class="helios-chain-node core"><span>AGENT</span><b>FABRIC CORE</b></div><div class="helios-chain-node demo"><span>VERIFIER</span><b>MOCK</b></div><div class="helios-chain-node"><span>SIGN / ATTEST</span><b>OPTIONAL HOOK</b></div></div><div class="helios-hook-row"><span>Lease fencing / stale result rejection</span><b>CORE PRIMITIVE</b></div><div class="helios-hook-row"><span>Retry / reassignment presentation</span><b>BUYER HOOK</b></div><div class="helios-hook-row"><span>External energy / carbon admission</span><b>NOT CONNECTED</b></div></div>`;
  }

  function constellationMarkup(){
    return `<div class="helios-lab-card"><h4>COMPUTE CONSTELLATION · DISTRIBUTED FABRIC VIEW</h4><div class="helios-constellation"><div class="helios-constellation-core">HELIOS</div><div id="const-browser" class="helios-agent-node n1">BROWSER · DEMO</div><div class="helios-agent-node hook n2">DESKTOP AGENT · HOOK</div><div class="helios-agent-node hook n3">GPU ADAPTER · HOOK</div><div class="helios-agent-node hook n4">VERIFIER · HOOK</div></div><div class="helios-lab-note" style="margin-top:5px">Production can replace these hook nodes with explicitly authorized agents while keeping detailed device fingerprinting out of the decorative layer.</div></div>`;
  }

  function passportMarkup(){
    return `<div class="helios-lab-card"><h4>COMPUTE PASSPORT · DEMO SESSION</h4><div id="helios-passport-result" class="helios-passport-result">0 receipts · 0.00 demo compute units</div><div class="helios-lab-actions"><button id="helios-passport-export" class="helios-lab-btn" type="button">EXPORT DEMO PASSPORT</button><button id="helios-manifest-copy" class="helios-lab-btn" type="button">COPY SESSION MANIFEST</button></div><div class="helios-lab-note" style="margin-top:5px">Passport has no wagering value. Production can bind portable signed receipts without changing game mathematics.</div></div>`;
  }

  function explainMarkup(){
    return `<div class="helios-lab-card"><h4>ONE EXPLAIN PANEL · BUYER HANDOFF</h4><ul class="helios-explain-list"><li><strong>RNG ⟂ COMPUTE:</strong> route/resource state cannot change odds, RTP, bonus access or personal jackpot weight.</li><li><strong>Consent:</strong> compute is off by default, caps are explicit and revoke is immediate.</li><li><strong>Proof:</strong> this public page emits DEMO/MOCK receipts; VERIFIED must come from an authoritative provider + verifier chain.</li><li><strong>Replaceable backend:</strong> Provider Manifest + Adapter + Verifier + Audited Sink.</li><li><strong>Buyer-ready:</strong> Desktop Fabric already has CPU/GPU/HYBRID, VRAM, thermal, battery, power and lease primitives.</li></ul></div>`;
  }

  function buildBuyerLab(){
    const receiptHost=state.receipt?.closest('.receipt');if(!receiptHost||document.getElementById('helios-buyer-lab'))return false;
    const d=document.createElement('details');d.id='helios-buyer-lab';d.className='helios-buyer-lab';
    d.innerHTML=`<summary><span>BUYER LAB · TOPA EXPANSION HOOKS</span><span>DEMO / INTEGRATION VIEW</span></summary><div class="helios-buyer-lab-body">${governorMarkup()}${mixerMarkup()}${diagnosticsMarkup()}${verificationMarkup()}${constellationMarkup()}${passportMarkup()}${explainMarkup()}</div>`;
    receiptHost.after(d);state.buyerLab=d;bindBuyerLab();return true;
  }

  function bindGovernor(){
    for(const input of state.buyerLab.querySelectorAll('[data-gov]')){
      const key=input.dataset.gov;const update=()=>{
        state.governor[key]=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value;
        const out=state.buyerLab.querySelector(`[data-out="${key}"]`);if(out)out.textContent=key==='thermal_ceiling_c'?`${input.value}°C`:key==='watt_ceiling_w'?`${input.value}W`:input.value;
        window.dispatchEvent(new CustomEvent('helios:buyer-governor-policy',{detail:{version:VERSION,...state.governor,authority:'DEMO_POLICY_PREVIEW_ONLY',game_effect:'NONE'}}));
      };input.addEventListener('input',update,{passive:true});input.addEventListener('change',update,{passive:true});
    }
  }

  function routeOptions(select,preferred){
    select.replaceChildren();
    for(const route of state.routeGrid.querySelectorAll('.route')){const o=document.createElement('option');o.value=route.dataset.route;o.textContent=route.querySelector('b')?.textContent||route.dataset.route;if(o.value===preferred)o.selected=true;select.appendChild(o);}
  }

  function allocationPlan(){
    const a=state.buyerLab.querySelector('#helios-mix-a')?.value||state.allocation.a;const b=state.buyerLab.querySelector('#helios-mix-b')?.value||state.allocation.b;const w=clamp(state.buyerLab.querySelector('#helios-mix-weight')?.value||state.allocation.weight,10,90);
    return {schema:'janus.helios.allocation-preview.v1',mode:'BUYER_PREVIEW_ONLY',allocations:[{route_key:a,weight:w/100},{route_key:b,weight:(100-w)/100}],routing_effect:'NONE_PUBLIC_DEMO',game_effect:'NONE'};
  }

  function renderMixer(){
    const plan=allocationPlan();state.allocation={a:plan.allocations[0].route_key,b:plan.allocations[1].route_key,weight:Math.round(plan.allocations[0].weight*100)};
    const label=state.buyerLab.querySelector('#helios-mix-weight-label');if(label)label.textContent=`${state.allocation.weight}/${100-state.allocation.weight}`;
    const out=state.buyerLab.querySelector('#helios-mixer-result');if(out){out.replaceChildren();out.append(text('b',`${state.allocation.a.toUpperCase()} ${state.allocation.weight}%  +  ${state.allocation.b.toUpperCase()} ${100-state.allocation.weight}%`),text('div','PREVIEW PLAN · DOES NOT ALTER ACTIVE DEMO ROUTE'));}
  }

  function bindMixer(){
    const a=state.buyerLab.querySelector('#helios-mix-a'),b=state.buyerLab.querySelector('#helios-mix-b'),w=state.buyerLab.querySelector('#helios-mix-weight');routeOptions(a,state.allocation.a);routeOptions(b,state.allocation.b);
    const ensureDistinct=changed=>{if(a.value!==b.value)return;if(changed===a)b.selectedIndex=(a.selectedIndex+1)%b.options.length;else a.selectedIndex=(b.selectedIndex+1)%a.options.length;};
    a.addEventListener('change',()=>{ensureDistinct(a);renderMixer();});b.addEventListener('change',()=>{ensureDistinct(b);renderMixer();});w.addEventListener('input',renderMixer,{passive:true});renderMixer();
  }

  function threadClass(){
    const n=Number(navigator.hardwareConcurrency||0);if(!n)return 'UNKNOWN';if(n<=4)return 'LITE';if(n<=8)return 'STANDARD';if(n<=16)return 'STRONG';return 'HEAVY';
  }

  function runSelfTest(){
    state.selfTest={schema:'janus.helios.coarse-capability-check.v1',local_only:true,thread_class:threadClass(),webgpu_api:('gpu' in navigator)?'VISIBLE':'NOT_VISIBLE',desktop_agent:'NOT_CONNECTED_FROM_STATIC_PAGE',detailed_fingerprint_collected:false,network_transmission:'NONE',admission_authority:'NONE_DEMO_ONLY'};
    const out=state.buyerLab.querySelector('#helios-self-result');if(out){out.replaceChildren();out.append(text('b',`CPU ${state.selfTest.thread_class} · WEBGPU ${state.selfTest.webgpu_api}`),text('div','LOCAL COARSE CHECK · NO ADAPTER MODEL / VENDOR / EXACT LIMITS SENT'));}
    updateTrust();window.dispatchEvent(new CustomEvent('helios:capability-self-test',{detail:{version:VERSION,...state.selfTest}}));
  }

  function loadPassport(){
    try{const x=JSON.parse(sessionStorage.getItem(PASSPORT_KEY)||'[]');if(Array.isArray(x))state.passport=x.slice(-24);}catch(_){state.passport=[];}
  }

  function savePassport(){try{sessionStorage.setItem(PASSPORT_KEY,JSON.stringify(state.passport.slice(-24)));}catch(_){}}

  function addPassportReceipt(obj){
    if(!obj?.receipt_id||String(obj.mode).toUpperCase()!=='SIMULATION'||state.passport.some(x=>x.receipt_id===obj.receipt_id))return;
    state.passport.push({receipt_id:obj.receipt_id,timestamp:obj.timestamp||null,provider_route:obj.provider_route||null,task_type:obj.task_type||null,compute_units:Number(obj.compute_units||0),asset:obj.asset||null,proof_kind:obj.proof_kind||null,resource_policy:obj.resource_policy||null,sink:obj.sink||null});state.passport=state.passport.slice(-24);savePassport();renderPassport();
  }

  function passportSummary(){
    const units=state.passport.reduce((a,x)=>a+Number(x.compute_units||0),0);const routes=[...new Set(state.passport.map(x=>x.provider_route).filter(Boolean))];return {receipts:state.passport.length,compute_units:Number(units.toFixed(2)),routes};
  }

  function renderPassport(){
    const out=state.buyerLab?.querySelector('#helios-passport-result');if(!out)return;const p=passportSummary();out.replaceChildren();out.append(text('b',`${p.receipts} receipts · ${p.compute_units.toFixed(2)} demo compute units`),text('div',p.routes.length?`ROUTES ${p.routes.join(' · ')}`:'NO STREAMING RECEIPTS YET'));
  }

  function exportPassport(){
    const payload={schema:'janus.helios.demo-compute-passport.v1',exported_at:new Date().toISOString(),authoritative:false,wagering_value:'NONE',summary:passportSummary(),receipts:state.passport};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='helios-demo-compute-passport.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  function sessionManifest(){
    return {schema:'janus.helios.session-identity-manifest.v1',created_at:new Date().toISOString(),presentation_only:true,game_mode:document.body.dataset.gameMode||'helios',route:activeRouteKey(),resource_policy:window.HELIOS_RESOURCE_POLICY?.getState?.()||null,reel_forge:window.HELIOS_REEL_FORGE?.getState?.()||null,route_aura:window.HELIOS_ROUTE_AURA?.getState?.()||null,music:window.HELIOS_COSMIC_MUSIC?.getState?.()||null,buyer_governor_preview:{...state.governor},allocation_preview:allocationPlan(),capability_self_test:state.selfTest,receipt_viewer:window.HELIOS_RECEIPT_VIEWER?.getState?.()||null,authority:{rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'}};
  }

  async function copyManifest(button){
    try{await navigator.clipboard.writeText(JSON.stringify(sessionManifest(),null,2));button.textContent='COPIED MANIFEST';setTimeout(()=>button.textContent='COPY SESSION MANIFEST',1100);}catch(_){button.textContent='COPY FAILED';setTimeout(()=>button.textContent='COPY SESSION MANIFEST',1100);}
  }

  function bindBuyerLab(){
    bindGovernor();bindMixer();loadPassport();renderPassport();
    state.buyerLab.querySelector('#helios-self-test')?.addEventListener('click',runSelfTest);
    state.buyerLab.querySelector('#helios-passport-export')?.addEventListener('click',exportPassport);
    const copy=state.buyerLab.querySelector('#helios-manifest-copy');copy?.addEventListener('click',()=>copyManifest(copy));
  }

  function parseReceipt(){
    const raw=state.receipt?.textContent?.trim();if(!raw||!raw.startsWith('{'))return null;try{return JSON.parse(raw);}catch(_){return null;}
  }

  function onReceipt(){
    const obj=parseReceipt();if(!obj)return;updateTrust(obj);addPassportReceipt(obj);
    if(obj.receipt_id&&obj.receipt_id!==state.lastReceiptId){state.lastReceiptId=obj.receipt_id;pulseVerification();}
  }

  function onCompute(){
    const active=computeActive();const browser=state.buyerLab?.querySelector('#const-browser');browser?.classList.toggle('active',active);
    if(active&&['ARMED','ADMITTING','SCHEDULING'].includes(state.lifecycleStage))setLifecycle('RUNNING');
    if(!active){clearTimeout(state.lifecycleTimer);setLifecycle('ARMED');}
    updateTrust(parseReceipt());
  }

  function bindRuntime(){
    state.powerOn.addEventListener('click',()=>{if(state.consent.checked&&!computeActive())beginLifecycle();},{capture:true});
    state.powerOff.addEventListener('click',()=>{clearTimeout(state.lifecycleTimer);setLifecycle('ARMED');});
    state.receiptObserver=new MutationObserver(onReceipt);state.receiptObserver.observe(state.receipt,{childList:true,characterData:true,subtree:true});
    state.computeObserver=new MutationObserver(onCompute);state.computeObserver.observe(state.computeState,{childList:true,characterData:true,subtree:true});
    state.routeObserver=new MutationObserver(()=>{addRouteHints();updateTrust(parseReceipt());});state.routeObserver.observe(state.routeGrid,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    window.addEventListener('helios:resource-policy',()=>updateTrust(parseReceipt()));
  }

  function attach(){
    if(state.attached)return true;
    state.router=document.querySelector('.hero>.router')||document.querySelector('.router');state.routeGrid=document.getElementById('route-grid');state.receipt=document.getElementById('receipt');state.receiptStatus=document.getElementById('receipt-status');state.computeState=document.getElementById('compute-state');state.powerOn=document.getElementById('power-on');state.powerOff=document.getElementById('power-off');state.consent=document.getElementById('consent');
    if(!state.router||!state.routeGrid||!state.routeGrid.children.length||!state.receipt||!state.computeState||!state.powerOn||!state.powerOff||!state.consent)return false;
    injectStyles();addRouteHints();if(!buildTrustLifecycle())return false;if(!buildBuyerLab())return false;state.attached=true;bindRuntime();onReceipt();onCompute();
    window.HELIOS_BUYER_COCKPIT=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,lifecycle:state.lifecycleStage,route:activeRouteKey(),governor_preview:{...state.governor},allocation_preview:allocationPlan(),capability_self_test:state.selfTest,passport:passportSummary(),presentation_only:true,policy_preview_only:true,game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE'}),getSessionManifest:()=>sessionManifest()});
    window.dispatchEvent(new CustomEvent('helios:buyer-cockpit-ready',{detail:{version:VERSION,trust_strip:true,lifecycle_preview:true,advanced_resource_governor:true,capability_route_hints:true,allocation_mixer_preview:true,coarse_self_test:true,verification_chain:true,resilience_hooks:true,compute_constellation:true,compute_passport:true,session_identity_manifest:true,external_energy_signal:'NOT_CONNECTED',presentation_only:true,game_effect:'NONE'}}));
    return true;
  }

  function init(){let attempts=0;const retry=()=>{if(attach()||++attempts>=120)return;setTimeout(retry,80);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
