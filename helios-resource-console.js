(() => {
  'use strict';

  const VERSION='2.0.0';
  const CONFIG_URL='./config/helios.resource-policy.v2.json';
  const DEFAULT_POLICY=Object.freeze({
    router_version:'2.0.0',
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

  const state={attached:false,policy:DEFAULT_POLICY,cpu:null,gpu:null,cpuLabel:null,gpuLabel:null,profileHost:null,classLabel:null,envelopeLabel:null,envelopeFill:null,receipt:null,computeState:null,receiptObserver:null,computeObserver:null,patchGuard:false,activeProfile:'custom'};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));

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
      router_version:String(state.policy.router_version||VERSION),
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
      .helios-resource-console{margin-top:8px;border:1px solid #26343e;background:linear-gradient(180deg,#071018,#050a0f);border-radius:12px;padding:9px;box-shadow:inset 0 0 22px #0005}
      .helios-resource-console-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px}.helios-resource-console-head span{font-size:8px;color:#8f9ca6;letter-spacing:.09em}.helios-resource-console-head b{font:9px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--cold)}
      .helios-resource-profiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-bottom:7px}.helios-resource-profile{border:1px solid #2b3943;background:#081017;color:#aeb9c1;border-radius:8px;padding:6px 3px;font-size:7px;font-weight:850;letter-spacing:.06em}.helios-resource-profile.active{border-color:var(--mode);color:#fff;background:linear-gradient(180deg,var(--mode-soft),#091016);box-shadow:0 0 13px var(--mode-soft)}
      .helios-resource-row{display:grid;grid-template-columns:46px minmax(0,1fr) 40px;gap:7px;align-items:center;margin-top:6px}.helios-resource-row label{font-size:8px;color:#909ca5;font-weight:800}.helios-resource-row input{width:100%;margin:0}.helios-resource-row.cpu input{accent-color:var(--mode)}.helios-resource-row.gpu input{accent-color:#80d7ff}.helios-resource-row b{text-align:right;font:9px ui-monospace,SFMono-Regular,Consolas,monospace}.helios-resource-row.cpu b{color:var(--mode)}.helios-resource-row.gpu b{color:#80d7ff}
      .helios-resource-meter{height:5px;border-radius:999px;background:#111a21;overflow:hidden;margin-top:8px;border:1px solid #26333c}.helios-resource-meter>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--mode),#80d7ff);box-shadow:0 0 10px var(--mode);transition:width .35s ease}
      .helios-resource-note{display:flex;justify-content:space-between;gap:8px;margin-top:6px;color:#71808b;font-size:7px;line-height:1.3}.helios-resource-note strong{color:#9fb0bb}.helios-resource-console.resource-max{border-color:var(--mode);box-shadow:inset 0 0 22px #0005,0 0 16px var(--mode-soft)}
      @media(max-width:620px){.helios-resource-profiles{grid-template-columns:repeat(2,minmax(0,1fr))}.helios-resource-row{grid-template-columns:42px minmax(0,1fr) 36px}}
    `;
    document.head.appendChild(style);
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
    const host=document.getElementById('helios-resource-console'); host?.classList.toggle('resource-max',p.max_policy);
    [...(state.profileHost?.children||[])].forEach(b=>b.classList.toggle('active',b.dataset.profile===state.activeProfile));
    state.cpu.disabled=p.compute_active; state.gpu.disabled=p.compute_active; [...(state.profileHost?.children||[])].forEach(b=>b.disabled=p.compute_active);
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
    if(state.receipt){state.receiptObserver=new MutationObserver(()=>patchReceipt());state.receiptObserver.observe(state.receipt,{childList:true,characterData:true,subtree:true});}
    if(state.computeState){state.computeObserver=new MutationObserver(()=>sync());state.computeObserver.observe(state.computeState,{childList:true,characterData:true,subtree:true});}
  }

  async function attach(){
    if(state.attached) return true;
    state.cpu=document.getElementById('cpu'); state.receipt=document.getElementById('receipt'); state.computeState=document.getElementById('compute-state');
    if(!state.cpu||!state.receipt||!state.computeState) return false;
    await loadPolicy(); injectStyles();
    if(!buildUi()) return false;
    state.attached=true; bind(); sync();
    window.HELIOS_RESOURCE_POLICY=Object.freeze({version:VERSION,getState:()=>({...policyState()})});
    window.dispatchEvent(new CustomEvent('helios:resource-console-ready',{detail:{version:VERSION,router_version:'2.0.0',cpu_gpu_hybrid:true,explicit_user_caps:true,public_gpu_execution:'SIMULATED_POLICY_ONLY',production_gpu_gate:'DESKTOP_AGENT_OR_APPROVED_GPU_ADAPTER',game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE'}}));
    return true;
  }

  function init(){let attempts=0;const run=()=>{Promise.resolve(attach()).then(ok=>{if(ok||++attempts>=80)return;setTimeout(run,75);});};run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
