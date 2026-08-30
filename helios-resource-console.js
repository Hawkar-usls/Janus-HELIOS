(() => {
  'use strict';

  const VERSION='2.1.0';
  const ROUTER_VERSION='2.0.0';
  const CONFIG_URL='./config/helios.resource-policy.v2.json';
  const DEFAULT_PALETTE=Object.freeze({primary:'#ffc24b',secondary:'#80d7ff',tertiary:'#f2a13a'});
  const DEFAULT_POLICY=Object.freeze({
    router_version:ROUTER_VERSION,
    cpu:{min_percent:0,default_percent:15,max_percent:30,step_percent:5},
    gpu:{min_percent:0,default_percent:0,max_percent:80,step_percent:10,public_page_execution:'SIMULATED_POLICY_ONLY',production_gate:'DESKTOP_AGENT_OR_APPROVED_GPU_ADAPTER'},
    visual_envelope_weights:{cpu:.35,gpu:.65,throughput_claim:'NONE_PRESENTATION_MAPPING_ONLY'},
    profiles:[
      {id:'cpu',label:'CPU',cpu_percent:15,gpu_percent:0,resource_class:'CPU'},
      {id:'gpu',label:'GPU',cpu_percent:0,gpu_percent:50,resource_class:'GPU'},
      {id:'hybrid',label:'HYBRID',cpu_percent:15,gpu_percent:40,resource_class:'HYBRID'},
      {id:'max',label:'MAX',cpu_percent:30,gpu_percent:80,resource_class:'HYBRID'}
    ]
  });

  const state={attached:false,policy:DEFAULT_POLICY,cpu:null,gpu:null,cpuLabel:null,gpuLabel:null,profileHost:null,classLabel:null,envelopeLabel:null,envelopeFill:null,receipt:null,computeState:null,receiptObserver:null,computeObserver:null,patchGuard:false,activeProfile:'custom',palette:{...DEFAULT_PALETTE},paletteSource:'FALLBACK'};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const isHex=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
  const rgb=hex=>{const n=parseInt(String(hex).slice(1),16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};};
  const rgba=(hex,a)=>{const c=rgb(isHex(hex)?hex:DEFAULT_PALETTE.primary);return `rgba(${c.r},${c.g},${c.b},${clamp(a,0,1).toFixed(3)})`;};

  function resourceClass(cpu,gpu){
    if(cpu>0&&gpu>0) return 'HYBRID';
    if(gpu>0) return 'GPU';
    if(cpu>0) return 'CPU';
    return 'IDLE';
  }

  function policyState(){
    const cpu=clamp(state.cpu?.value||0,0,Number(state.cpu?.max||100));
    const gpu=clamp(state.gpu?.value||0,0,Number(state.gpu?.max||100));
    const cpuMax=Math.max(1,Number(state.cpu?.max||state.policy.cpu?.max_percent||30));
    const gpuMax=Math.max(1,Number(state.gpu?.max||state.policy.gpu?.max_percent||80));
    const cpuRatio=clamp(cpu/cpuMax,0,1),gpuRatio=clamp(gpu/gpuMax,0,1);
    const weights=state.policy.visual_envelope_weights||DEFAULT_POLICY.visual_envelope_weights;
    const cpuWeight=clamp(weights.cpu??.35,0,1),gpuWeight=clamp(weights.gpu??.65,0,1);
    const weightSum=Math.max(.0001,cpuWeight+gpuWeight);
    const visualRatio=clamp((cpuRatio*cpuWeight+gpuRatio*gpuWeight)/weightSum,0,1);
    return Object.freeze({
      version:VERSION,
      router_version:String(state.policy.router_version||ROUTER_VERSION),
      cpu_percent:cpu,
      gpu_percent:gpu,
      cpu_max_percent:cpuMax,
      gpu_max_percent:gpuMax,
      cpu_ratio:cpuRatio,
      gpu_ratio:gpuRatio,
      visual_envelope_ratio:visualRatio,
      resource_class:resourceClass(cpu,gpu),
      max_policy:cpu===cpuMax&&gpu===gpuMax,
      active_profile:state.activeProfile,
      compute_active:Boolean(state.computeState?.textContent?.includes('ACTIVE')),
      public_page_gpu_execution:String(state.policy.gpu?.public_page_execution||'SIMULATED_POLICY_ONLY'),
      production_gpu_gate:String(state.policy.gpu?.production_gate||'DESKTOP_AGENT_OR_APPROVED_GPU_ADAPTER'),
      throughput_claim:'NONE',
      presentation_mapping_only:true,
      game_effect:'NONE',
      rng_effect:'NONE',
      rtp_effect:'NONE',
      payout_effect:'NONE'
    });
  }

  async function loadPolicy(){
    try{
      const r=await fetch(CONFIG_URL,{cache:'no-store'});
      if(!r.ok) return;
      const p=await r.json();
      if(p&&typeof p==='object') state.policy={...DEFAULT_POLICY,...p,cpu:{...DEFAULT_POLICY.cpu,...p.cpu},gpu:{...DEFAULT_POLICY.gpu,...p.gpu},visual_envelope_weights:{...DEFAULT_POLICY.visual_envelope_weights,...p.visual_envelope_weights},profiles:Array.isArray(p.profiles)&&p.profiles.length?p.profiles:DEFAULT_POLICY.profiles};
    }catch(_){ }
  }

  function injectStyles(){
    if(document.getElementById('helios-resource-console-styles')) return;
    const style=document.createElement('style');
    style.id='helios-resource-console-styles';
    style.textContent=`
      @keyframes heliosResourceStarDrift{0%{background-position:3px 7px,17px 11px,9px 23px}50%{background-position:18px 1px,4px 27px,25px 9px}100%{background-position:33px -5px,-9px 43px,41px -5px}}
      @keyframes heliosResourceSheen{0%,100%{transform:translateX(-23%) scale(.98);opacity:calc(var(--resource-sheen-opacity) * .72)}50%{transform:translateX(16%) scale(1.02);opacity:var(--resource-sheen-opacity)}}
      .helios-resource-console{--resource-primary:#ffc24b;--resource-secondary:#80d7ff;--resource-tertiary:#f2a13a;--resource-border:rgba(255,194,75,.22);--resource-inner-a:rgba(255,194,75,.07);--resource-inner-b:rgba(128,215,255,.05);--resource-outer-a:rgba(255,194,75,.05);--resource-outer-b:rgba(128,215,255,.035);--resource-sheen:rgba(242,161,58,.10);--resource-sheen-opacity:.10;--resource-stars-opacity:.14;--resource-halo-size:14px;--resource-track:rgba(119,139,154,.16);--resource-button-glow:rgba(255,194,75,.16);position:relative;isolation:isolate;overflow:hidden;margin-top:8px;border:1px solid var(--resource-border);background:radial-gradient(circle at 8% -12%,var(--resource-inner-a),transparent 42%),radial-gradient(circle at 92% 118%,var(--resource-inner-b),transparent 48%),linear-gradient(180deg,#071018f0,#04090ff4);border-radius:12px;padding:9px;box-shadow:inset 0 0 28px var(--resource-inner-a),inset 0 1px #ffffff06,0 0 var(--resource-halo-size) var(--resource-outer-a),0 0 calc(var(--resource-halo-size) * 2.2) var(--resource-outer-b);transition:border-color .7s ease,box-shadow .7s ease,background .9s ease}
      .helios-resource-console:before{content:"";position:absolute;inset:-20px;z-index:-2;pointer-events:none;background-image:radial-gradient(circle,var(--resource-primary) 0 .7px,transparent 1.2px),radial-gradient(circle,var(--resource-secondary) 0 .65px,transparent 1.1px),radial-gradient(circle,var(--resource-tertiary) 0 .55px,transparent 1px);background-size:37px 31px,53px 47px,71px 61px;background-position:3px 7px,17px 11px,9px 23px;opacity:var(--resource-stars-opacity);mix-blend-mode:screen;animation:heliosResourceStarDrift 18s linear infinite;transition:opacity .7s ease}
      .helios-resource-console:after{content:"";position:absolute;inset:-35% -30%;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at 50% 112%,var(--resource-outer-a),transparent 58%),linear-gradient(112deg,transparent 20%,var(--resource-sheen) 48%,transparent 72%);opacity:var(--resource-sheen-opacity);transform:translateX(-23%) scale(.98);transition:opacity .7s ease,transform .8s ease}
      .helios-resource-console.compute-active:after{animation:heliosResourceSheen 6.8s ease-in-out infinite}.helios-resource-console.resource-max.compute-active:after{animation-duration:4.8s}
      .helios-resource-console>*{position:relative;z-index:1}
      .helios-resource-console-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px}.helios-resource-console-head span{font-size:8px;color:#8f9ca6;letter-spacing:.09em}.helios-resource-console-head b{font:9px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--resource-tertiary);text-shadow:0 0 10px var(--resource-button-glow);transition:color .7s ease,text-shadow .7s ease}
      .helios-resource-profiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-bottom:7px}.helios-resource-profile{border:1px solid #2b3943;background:#071018c9;color:#8f9aa2;border-radius:8px;padding:6px 3px;font-size:7px;font-weight:850;letter-spacing:.06em;transition:border-color .55s ease,color .55s ease,background .7s ease,box-shadow .7s ease,transform .18s ease}.helios-resource-profile:hover:not(:disabled){border-color:var(--resource-border);color:#dbe6eb}.helios-resource-profile.active{border-color:var(--resource-primary);color:#fff;background:radial-gradient(circle at 50% 0,var(--resource-inner-a),transparent 72%),linear-gradient(180deg,var(--resource-inner-b),#071017db);box-shadow:inset 0 0 15px var(--resource-inner-a),0 0 13px var(--resource-button-glow),0 0 24px var(--resource-outer-b);text-shadow:0 0 8px var(--resource-button-glow)}.helios-resource-profile.active:not(:disabled):active{transform:scale(.985)}
      .helios-resource-row{display:grid;grid-template-columns:46px minmax(0,1fr) 40px;gap:7px;align-items:center;margin-top:6px}.helios-resource-row label{font-size:8px;color:#909ca5;font-weight:800}.helios-resource-row b{text-align:right;font:9px ui-monospace,SFMono-Regular,Consolas,monospace;text-shadow:0 0 9px var(--resource-channel-glow);transition:color .7s ease}.helios-resource-row.cpu b{color:var(--resource-primary)}.helios-resource-row.gpu b{color:var(--resource-secondary)}
      .helios-resource-row input[type=range]{--resource-fill:0%;--resource-channel-a:var(--resource-primary);--resource-channel-b:var(--resource-tertiary);--resource-channel-glow:var(--resource-button-glow);width:100%;height:16px;margin:0;background:transparent;appearance:none;-webkit-appearance:none;outline:none}
      .helios-resource-row.gpu input[type=range]{--resource-channel-a:var(--resource-secondary);--resource-channel-b:var(--resource-tertiary)}
      .helios-resource-row input[type=range]::-webkit-slider-runnable-track{height:7px;border-radius:999px;border:1px solid rgba(255,255,255,.055);background:linear-gradient(90deg,var(--resource-channel-a) 0%,var(--resource-channel-b) var(--resource-fill),var(--resource-track) var(--resource-fill),var(--resource-track) 100%);box-shadow:inset 0 1px 3px #0009,0 0 9px var(--resource-channel-glow);transition:background .55s ease,box-shadow .55s ease}
      .helios-resource-row input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;margin-top:-4px;border-radius:50%;border:1px solid rgba(255,255,255,.72);background:var(--resource-channel-b);box-shadow:0 0 0 2px #071018,0 0 11px var(--resource-channel-a),0 0 20px var(--resource-channel-glow)}
      .helios-resource-row input[type=range]::-moz-range-track{height:7px;border-radius:999px;border:1px solid rgba(255,255,255,.055);background:linear-gradient(90deg,var(--resource-channel-a) 0%,var(--resource-channel-b) var(--resource-fill),var(--resource-track) var(--resource-fill),var(--resource-track) 100%);box-shadow:inset 0 1px 3px #0009,0 0 9px var(--resource-channel-glow)}
      .helios-resource-row input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;border:1px solid rgba(255,255,255,.72);background:var(--resource-channel-b);box-shadow:0 0 0 2px #071018,0 0 11px var(--resource-channel-a),0 0 20px var(--resource-channel-glow)}
      .helios-resource-row input[type=range]:focus-visible{filter:brightness(1.15)}
      .helios-resource-meter{height:6px;border-radius:999px;background:#091119;overflow:hidden;margin-top:8px;border:1px solid #26333c;box-shadow:inset 0 1px 4px #000b}.helios-resource-meter>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--resource-primary),var(--resource-tertiary) 52%,var(--resource-secondary));box-shadow:0 0 10px var(--resource-primary),0 0 18px var(--resource-secondary);transition:width .35s ease,background .7s ease,box-shadow .7s ease}
      .helios-resource-note{display:flex;justify-content:space-between;gap:8px;margin-top:6px;color:#71808b;font-size:7px;line-height:1.3}.helios-resource-note strong{color:var(--resource-tertiary);text-shadow:0 0 8px var(--resource-button-glow);transition:color .7s ease}
      .helios-resource-console.compute-active{border-color:var(--resource-border)}.helios-resource-console.resource-max.compute-active{box-shadow:inset 0 0 34px var(--resource-inner-a),inset 0 1px #ffffff08,0 0 var(--resource-halo-size) var(--resource-outer-a),0 0 calc(var(--resource-halo-size) * 2.8) var(--resource-outer-b)}
      @media(max-width:620px){.helios-resource-profiles{grid-template-columns:repeat(2,minmax(0,1fr))}.helios-resource-row{grid-template-columns:42px minmax(0,1fr) 36px}}
      @media(prefers-reduced-motion:reduce){.helios-resource-console:before,.helios-resource-console.compute-active:after{animation:none!important}.helios-resource-console,.helios-resource-profile,.helios-resource-meter>i{transition-duration:.2s!important}}
    `;
    document.head.appendChild(style);
  }

  function paletteFromForge(){
    const p=window.HELIOS_REEL_FORGE?.getState?.()?.profile;
    if(!p) return null;
    return {primary:p.mix,secondary:p.secondary,tertiary:p.tertiary};
  }

  function normalizePalette(raw){
    const p=raw||{};
    return {
      primary:isHex(p.primary)?p.primary:DEFAULT_PALETTE.primary,
      secondary:isHex(p.secondary)?p.secondary:DEFAULT_PALETTE.secondary,
      tertiary:isHex(p.tertiary)?p.tertiary:DEFAULT_PALETTE.tertiary
    };
  }

  function applyPalette(raw,source='REEL_FORGE_PROFILE'){
    const host=document.getElementById('helios-resource-console');
    state.palette=normalizePalette(raw);
    state.paletteSource=source;
    if(!host) return;
    const p=state.palette;
    host.dataset.paletteSource=source;
    host.style.setProperty('--resource-primary',p.primary);
    host.style.setProperty('--resource-secondary',p.secondary);
    host.style.setProperty('--resource-tertiary',p.tertiary);
    state.cpu?.style.setProperty('--resource-channel-a',p.primary);
    state.cpu?.style.setProperty('--resource-channel-b',p.tertiary);
    state.gpu?.style.setProperty('--resource-channel-a',p.secondary);
    state.gpu?.style.setProperty('--resource-channel-b',p.tertiary);
    refreshVisualEnergy(policyState());
  }

  function refreshVisualEnergy(p){
    const host=document.getElementById('helios-resource-console');
    if(!host) return;
    const t=clamp(p.visual_envelope_ratio,0,1),live=p.compute_active?t:0;
    const a=state.palette.primary,b=state.palette.secondary,c=state.palette.tertiary;
    host.dataset.resourceIntensity=String(Math.round(t*100));
    host.classList.toggle('compute-active',p.compute_active&&t>0);
    host.classList.toggle('resource-max',p.max_policy);
    host.style.setProperty('--resource-border',rgba(c,.17+t*.25+live*.22));
    host.style.setProperty('--resource-inner-a',rgba(a,.045+t*.065+live*.09));
    host.style.setProperty('--resource-inner-b',rgba(b,.035+t*.055+live*.08));
    host.style.setProperty('--resource-outer-a',rgba(a,.025+t*.055+live*.14));
    host.style.setProperty('--resource-outer-b',rgba(b,.018+t*.045+live*.11));
    host.style.setProperty('--resource-sheen',rgba(c,.06+t*.08+live*.12));
    host.style.setProperty('--resource-sheen-opacity',String((.07+t*.10+live*.16).toFixed(3)));
    host.style.setProperty('--resource-stars-opacity',String((.10+t*.17+live*.20).toFixed(3)));
    host.style.setProperty('--resource-halo-size',`${(10+t*12+live*17).toFixed(1)}px`);
    host.style.setProperty('--resource-button-glow',rgba(c,.08+t*.12+live*.18));
    host.style.setProperty('--resource-track',rgba(c,.07+t*.035));
    state.cpu?.style.setProperty('--resource-fill',`${(p.cpu_ratio*100).toFixed(2)}%`);
    state.gpu?.style.setProperty('--resource-fill',`${(p.gpu_ratio*100).toFixed(2)}%`);
    state.cpu?.style.setProperty('--resource-channel-glow',rgba(a,.08+t*.08+live*.15));
    state.gpu?.style.setProperty('--resource-channel-glow',rgba(b,.08+t*.08+live*.15));
  }

  function buildUi(){
    const router=document.querySelector('.router');
    const cpuControl=state.cpu?.closest('.control');
    if(!router||!cpuControl||document.getElementById('helios-resource-console')) return false;
    const badge=router.querySelector('.router-head .badge');
    if(badge) badge.textContent='HELIOS ROUTER v2';
    cpuControl.style.display='none';

    const host=document.createElement('div');
    host.id='helios-resource-console'; host.className='helios-resource-console';
    host.innerHTML=`
      <div class="helios-resource-console-head"><span>RESOURCE ENVELOPE · EXPLICIT USER CAP</span><b id="resource-envelope-label">CPU</b></div>
      <div id="resource-profile-host" class="helios-resource-profiles"></div>
      <div class="helios-resource-row cpu"><label for="cpu">CPU</label><input id="cpu-v2-proxy" type="range" aria-hidden="true" tabindex="-1" /><b id="cpu-v2-label">15%</b></div>
      <div class="helios-resource-row gpu"><label for="gpu">GPU</label><input id="gpu" type="range" /><b id="gpu-label">0%</b></div>
      <div class="helios-resource-meter"><i id="resource-envelope-fill"></i></div>
      <div class="helios-resource-note"><span>Class <strong id="resource-class-label">CPU</strong></span><span>GPU on public page: policy simulation only</span></div>
    `;
    cpuControl.after(host);

    const proxy=host.querySelector('#cpu-v2-proxy');
    proxy.replaceWith(state.cpu);
    state.cpu.classList.add('resource-cpu-v2');
    state.cpuLabel=host.querySelector('#cpu-v2-label');
    state.gpu=host.querySelector('#gpu');
    state.gpuLabel=host.querySelector('#gpu-label');
    state.profileHost=host.querySelector('#resource-profile-host');
    state.classLabel=host.querySelector('#resource-class-label');
    state.envelopeLabel=host.querySelector('#resource-envelope-label');
    state.envelopeFill=host.querySelector('#resource-envelope-fill');

    const cpuP=state.policy.cpu||DEFAULT_POLICY.cpu,gpuP=state.policy.gpu||DEFAULT_POLICY.gpu;
    state.cpu.min=String(cpuP.min_percent??0); state.cpu.max=String(cpuP.max_percent??30); state.cpu.step=String(cpuP.step_percent??5); state.cpu.value=String(clamp(state.cpu.value||cpuP.default_percent,Number(state.cpu.min),Number(state.cpu.max)));
    state.gpu.min=String(gpuP.min_percent??0); state.gpu.max=String(gpuP.max_percent??80); state.gpu.step=String(gpuP.step_percent??10); state.gpu.value=String(clamp(gpuP.default_percent??0,Number(state.gpu.min),Number(state.gpu.max)));

    for(const raw of state.policy.profiles||[]){
      const p={...raw}; const b=document.createElement('button'); b.type='button'; b.className='helios-resource-profile'; b.dataset.profile=String(p.id||'custom'); b.textContent=String(p.label||p.id||'PROFILE');
      b.addEventListener('click',()=>{if(policyState().compute_active)return;state.activeProfile=String(p.id||'custom');state.cpu.value=String(clamp(p.cpu_percent,Number(state.cpu.min),Number(state.cpu.max)));state.gpu.value=String(clamp(p.gpu_percent,Number(state.gpu.min),Number(state.gpu.max)));sync(true);});
      state.profileHost.appendChild(b);
    }
    return true;
  }

  function detectProfile(){
    const cpu=Number(state.cpu?.value||0),gpu=Number(state.gpu?.value||0);
    const exact=(state.policy.profiles||[]).find(p=>Number(p.cpu_percent)===cpu&&Number(p.gpu_percent)===gpu);
    if(exact) state.activeProfile=String(exact.id); else state.activeProfile='custom';
  }

  function sync(dispatched=false){
    if(!state.cpu||!state.gpu) return;
    detectProfile();
    const p=policyState();
    if(state.cpuLabel) state.cpuLabel.textContent=`${p.cpu_percent}%`;
    const oldCpuLabel=document.getElementById('cpu-label'); if(oldCpuLabel) oldCpuLabel.textContent=`${p.cpu_percent}%`;
    if(state.gpuLabel) state.gpuLabel.textContent=`${p.gpu_percent}%`;
    if(state.classLabel) state.classLabel.textContent=p.resource_class;
    if(state.envelopeLabel) state.envelopeLabel.textContent=`${p.resource_class} · ${Math.round(p.visual_envelope_ratio*100)}% AURA`;
    if(state.envelopeFill) state.envelopeFill.style.width=`${Math.round(p.visual_envelope_ratio*100)}%`;
    [...(state.profileHost?.children||[])].forEach(b=>b.classList.toggle('active',b.dataset.profile===state.activeProfile));
    state.cpu.disabled=p.compute_active; state.gpu.disabled=p.compute_active; [...(state.profileHost?.children||[])].forEach(b=>b.disabled=p.compute_active);
    refreshVisualEnergy(p);
    window.dispatchEvent(new CustomEvent('helios:resource-policy',{detail:{...p}}));
    if(!dispatched) patchReceipt();
  }

  function patchReceipt(){
    if(state.patchGuard||!state.receipt) return;
    const text=state.receipt.textContent?.trim();
    if(!text||!text.startsWith('{')) return;
    try{
      const obj=JSON.parse(text),p=policyState();
      if(!obj||obj.product!=='JANUS_HELIOS') return;
      obj.router_version=p.router_version;
      obj.resource_policy={
        cpu_percent:p.cpu_percent,
        gpu_percent:p.gpu_percent,
        allow_cpu:p.cpu_percent>0,
        allow_gpu:p.gpu_percent>0,
        resource_class:p.resource_class,
        user_cap_only:true,
        throughput_scaling:'NOT_MODELED',
        public_gpu_execution:p.public_page_gpu_execution,
        production_gpu_gate:p.production_gpu_gate
      };
      const next=JSON.stringify(obj,null,2);
      if(next===text) return;
      state.patchGuard=true;
      try{state.receipt.textContent=next;}finally{state.patchGuard=false;}
    }catch(_){state.patchGuard=false;}
  }

  function bind(){
    const onInput=()=>{state.activeProfile='custom';sync();};
    state.cpu.addEventListener('input',onInput,{passive:true}); state.cpu.addEventListener('change',onInput,{passive:true});
    state.gpu.addEventListener('input',onInput,{passive:true}); state.gpu.addEventListener('change',onInput,{passive:true});
    window.addEventListener('helios:reel-forge-profile',e=>applyPalette(e.detail?.palette,'REEL_FORGE_PROFILE'));
    window.addEventListener('helios:reel-forge-ready',()=>{const p=paletteFromForge();if(p)applyPalette(p,'REEL_FORGE_STATE');});
    if(state.receipt){state.receiptObserver=new MutationObserver(()=>patchReceipt());state.receiptObserver.observe(state.receipt,{childList:true,characterData:true,subtree:true});}
    if(state.computeState){state.computeObserver=new MutationObserver(()=>sync());state.computeObserver.observe(state.computeState,{childList:true,characterData:true,subtree:true});}
  }

  async function attach(){
    if(state.attached) return true;
    state.cpu=document.getElementById('cpu'); state.receipt=document.getElementById('receipt'); state.computeState=document.getElementById('compute-state');
    if(!state.cpu||!state.receipt||!state.computeState) return false;
    await loadPolicy(); injectStyles();
    if(!buildUi()) return false;
    state.attached=true; bind();
    applyPalette(paletteFromForge()||DEFAULT_PALETTE,paletteFromForge()?'REEL_FORGE_STATE':'FALLBACK');
    sync();
    window.HELIOS_RESOURCE_POLICY=Object.freeze({version:VERSION,getState:()=>({...policyState(),visual_palette:{...state.palette},palette_source:state.paletteSource,soft_cosmic_resource_ui:true})});
    window.dispatchEvent(new CustomEvent('helios:resource-console-ready',{detail:{version:VERSION,router_version:ROUTER_VERSION,cpu_gpu_hybrid:true,explicit_user_caps:true,reel_forge_palette_following:true,resource_strength_glow:true,soft_cosmic_resource_ui:true,public_gpu_execution:'SIMULATED_POLICY_ONLY',production_gpu_gate:'DESKTOP_AGENT_OR_APPROVED_GPU_ADAPTER',game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE'}}));
    return true;
  }

  function init(){let attempts=0;const run=()=>{Promise.resolve(attach()).then(ok=>{if(ok||++attempts>=80)return;setTimeout(run,75);});};run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
