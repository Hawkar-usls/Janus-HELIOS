(() => {
  'use strict';

  const VERSION='1.0.0';
  const state={musicEnabled:false,computeActive:false,cpuRatio:0,gpuRatio:0,maxPolicy:false,ctx:null,bus:null,cpuOsc:null,cpuGain:null,cpuLfo:null,cpuLfoGain:null,gpuOsc:null,gpuGain:null,gpuPan:null,gpuLfo:null,gpuLfoGain:null,filter:null,sparkTimer:0,primed:false};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));

  function context(){
    if(state.ctx) return state.ctx;
    const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return null;
    const ctx=new C();state.ctx=ctx;
    const bus=ctx.createGain();bus.gain.value=.0001;bus.connect(ctx.destination);state.bus=bus;

    const cpu=ctx.createOscillator(),cpuGain=ctx.createGain(),cpuLfo=ctx.createOscillator(),cpuLfoGain=ctx.createGain();
    cpu.type='sine';cpu.frequency.value=55;cpuGain.gain.value=.0001;cpuLfo.type='sine';cpuLfo.frequency.value=.55;cpuLfoGain.gain.value=.002;
    cpu.connect(cpuGain).connect(bus);cpuLfo.connect(cpuLfoGain).connect(cpuGain.gain);cpu.start();cpuLfo.start();
    state.cpuOsc=cpu;state.cpuGain=cpuGain;state.cpuLfo=cpuLfo;state.cpuLfoGain=cpuLfoGain;

    const gpu=ctx.createOscillator(),gpuGain=ctx.createGain(),gpuPan=ctx.createStereoPanner(),gpuLfo=ctx.createOscillator(),gpuLfoGain=ctx.createGain(),filter=ctx.createBiquadFilter();
    gpu.type='triangle';gpu.frequency.value=220;gpuGain.gain.value=.0001;gpuLfo.type='sine';gpuLfo.frequency.value=.17;gpuLfoGain.gain.value=.58;filter.type='bandpass';filter.frequency.value=1450;filter.Q.value=.72;
    gpu.connect(filter).connect(gpuGain).connect(gpuPan).connect(bus);gpuLfo.connect(gpuLfoGain).connect(gpuPan.pan);gpu.start();gpuLfo.start();
    state.gpuOsc=gpu;state.gpuGain=gpuGain;state.gpuPan=gpuPan;state.gpuLfo=gpuLfo;state.gpuLfoGain=gpuLfoGain;state.filter=filter;
    return ctx;
  }

  function readPolicy(detail=null){
    const p=detail||window.HELIOS_RESOURCE_POLICY?.getState?.()||{};
    const cpuMax=Math.max(1,Number(p.cpu_max_percent||30)),gpuMax=Math.max(1,Number(p.gpu_max_percent||80));
    state.cpuRatio=clamp(Number(p.cpu_percent||0)/cpuMax,0,1);state.gpuRatio=clamp(Number(p.gpu_percent||0)/gpuMax,0,1);state.maxPolicy=Boolean(p.max_policy);
    sync();
  }

  function scheduleSpark(){
    clearTimeout(state.sparkTimer);state.sparkTimer=0;
    if(!state.musicEnabled||!state.computeActive||!state.maxPolicy||!state.ctx)return;
    const ctx=state.ctx;
    const ping=()=>{
      if(!state.musicEnabled||!state.computeActive||!state.maxPolicy||!state.ctx)return;
      const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain(),pan=ctx.createStereoPanner();
      osc.type='sine';osc.frequency.setValueAtTime(660,now);osc.frequency.exponentialRampToValueAtTime(990,now+.12);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.0065,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.18);pan.pan.value=.55;
      osc.connect(gain).connect(pan).connect(state.bus);osc.start(now);osc.stop(now+.2);
      state.sparkTimer=setTimeout(ping,2400);
    };
    state.sparkTimer=setTimeout(ping,1200);
  }

  function sync(){
    const ctx=context();if(!ctx)return;
    const active=state.musicEnabled&&state.computeActive&&(state.cpuRatio>0||state.gpuRatio>0);const now=ctx.currentTime;
    state.bus.gain.cancelScheduledValues(now);state.bus.gain.setTargetAtTime(active?.011:.0001,now,active?.18:.12);
    state.cpuGain.gain.cancelScheduledValues(now);state.cpuGain.gain.setTargetAtTime(active?.0018+state.cpuRatio*.0042:.0001,now,.18);
    state.cpuLfo.frequency.setTargetAtTime(.34+state.cpuRatio*.72,now,.25);state.cpuLfoGain.gain.setTargetAtTime(.0008+state.cpuRatio*.0038,now,.25);
    state.cpuOsc.frequency.setTargetAtTime(48+state.cpuRatio*18,now,.35);
    state.gpuGain.gain.cancelScheduledValues(now);state.gpuGain.gain.setTargetAtTime(active?.0012+state.gpuRatio*.0038:.0001,now,.2);
    state.gpuOsc.frequency.setTargetAtTime(176+state.gpuRatio*154,now,.45);state.filter.frequency.setTargetAtTime(900+state.gpuRatio*1800,now,.45);state.gpuLfo.frequency.setTargetAtTime(.11+state.gpuRatio*.22,now,.35);state.gpuLfoGain.gain.setTargetAtTime(.22+state.gpuRatio*.5,now,.3);
    scheduleSpark();
  }

  function readCompute(){state.computeActive=Boolean(document.getElementById('compute-state')?.textContent?.includes('ACTIVE'));sync();}

  function prime(){const ctx=context();if(!ctx)return;state.primed=true;if(ctx.state==='suspended')ctx.resume().catch(()=>{});sync();}

  function bind(){
    const toggle=document.getElementById('sound-toggle');if(toggle){state.musicEnabled=toggle.classList.contains('active');toggle.addEventListener('pointerdown',prime,{passive:true});}
    window.addEventListener('helios:music-state',e=>{state.musicEnabled=Boolean(e.detail?.enabled);if(state.musicEnabled)prime();else sync();});
    window.addEventListener('helios:resource-policy',e=>readPolicy(e.detail));window.addEventListener('helios:resource-console-ready',()=>readPolicy());
    const compute=document.getElementById('compute-state');if(compute){new MutationObserver(readCompute).observe(compute,{childList:true,characterData:true,subtree:true});readCompute();}
    document.addEventListener('visibilitychange',()=>{if(document.hidden){state.bus?.gain?.setTargetAtTime(.0001,state.ctx?.currentTime||0,.08);clearTimeout(state.sparkTimer);}else sync();});
    readPolicy();
  }

  function init(){bind();window.HELIOS_RESOURCE_SONIFICATION=Object.freeze({version:VERSION,getState:()=>({version:VERSION,music_enabled:state.musicEnabled,compute_active:state.computeActive,cpu_ratio:state.cpuRatio,gpu_ratio:state.gpuRatio,max_policy:state.maxPolicy,primed:state.primed,presentation_only:true,reads_bet:false,reads_balance:false,reads_win:false,reads_rng:false,game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE'})});window.dispatchEvent(new CustomEvent('helios:resource-sonification-ready',{detail:{version:VERSION,cpu_pulse:true,gpu_spectral_air:true,max_policy_spark_ping:true,presentation_only:true,game_effect:'NONE'}}));}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
