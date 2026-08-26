(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  const DEFAULT_PROFILES = {
    helios:{name:'D LYDIAN ORBIT',root_midi:50,scale:[0,2,4,6,7,9,11],motif:[0,4,2,5,1,6,4,2],bpm:66,wave:'sine'},
    divine:{name:'A LYDIAN AETHER',root_midi:57,scale:[0,2,4,6,7,9,11],motif:[0,2,5,4,1,6,3,5],bpm:60,wave:'triangle'},
    gridjack:{name:'E DORIAN PULSE',root_midi:40,scale:[0,2,3,5,7,9,10],motif:[0,4,2,6,1,5,3,4],bpm:78,wave:'triangle'},
    custom:{name:'C# VOID MINOR',root_midi:49,scale:[0,3,5,7,10],motif:[0,3,1,4,2,3,0,4],bpm:70,wave:'sine'}
  };

  const DEFAULT_POLICY = {
    enabled:true,
    default_on:false,
    master_gain:0.085,
    scheduler_ms:25,
    lookahead_seconds:0.12,
    profiles:DEFAULT_PROFILES
  };

  const state = {
    policy:{...DEFAULT_POLICY,profiles:{...DEFAULT_PROFILES}},
    enabled:false,
    ctx:null,
    master:null,
    filter:null,
    delay:null,
    feedback:null,
    reverb:null,
    compressor:null,
    scheduler:null,
    nextStepTime:0,
    step:0,
    mode:document.body.dataset.gameMode || 'helios',
    route:$('selected-route')?.textContent?.trim() || 'MARKET',
    computeActive:false,
    eventEnergy:0,
    attached:false
  };

  function clamp(n,min,max){ return Math.max(min,Math.min(max,Number(n))); }
  function midiToHz(m){ return 440*Math.pow(2,(m-69)/12); }
  function secureIndex(max){
    if(max<=1) return 0;
    const a=new Uint32Array(1);
    if(globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(a);
    else a[0]=(Date.now()*2654435761)>>>0;
    return a[0]%max;
  }
  function profile(){ return state.policy.profiles[state.mode] || state.policy.profiles.helios || DEFAULT_PROFILES.helios; }

  async function loadPolicy(){
    try{
      const r=await fetch('./config/helios.public.json',{cache:'no-store'});
      if(!r.ok) return;
      const cfg=await r.json();
      const p=cfg?.procedural_audio || {};
      const profiles={...DEFAULT_PROFILES};
      if(p.profiles && typeof p.profiles==='object'){
        for(const [key,raw] of Object.entries(p.profiles)){
          if(!DEFAULT_PROFILES[key] || !raw) continue;
          const base=DEFAULT_PROFILES[key];
          const scale=Array.isArray(raw.scale)&&raw.scale.length?raw.scale.map(Number).filter(Number.isFinite):base.scale;
          const motif=Array.isArray(raw.motif)&&raw.motif.length?raw.motif.map(Number).filter(Number.isFinite):base.motif;
          profiles[key]={
            ...base,
            ...raw,
            root_midi:clamp(raw.root_midi ?? base.root_midi,24,84),
            bpm:clamp(raw.bpm ?? base.bpm,40,110),
            scale,
            motif
          };
        }
      }
      state.policy={
        ...DEFAULT_POLICY,
        ...p,
        default_on:false,
        master_gain:clamp(p.master_gain ?? DEFAULT_POLICY.master_gain,0.02,0.12),
        scheduler_ms:clamp(p.scheduler_ms ?? DEFAULT_POLICY.scheduler_ms,20,80),
        lookahead_seconds:clamp(p.lookahead_seconds ?? DEFAULT_POLICY.lookahead_seconds,0.06,0.25),
        profiles
      };
    }catch(_){ }
  }

  function impulse(ctx,seconds=2.6,decay=2.7){
    const rate=ctx.sampleRate,length=Math.floor(rate*seconds),buffer=ctx.createBuffer(2,length,rate);
    for(let ch=0;ch<2;ch++){
      const data=buffer.getChannelData(ch);
      for(let i=0;i<length;i++){
        const env=Math.pow(1-i/length,decay);
        const seed=((i*1103515245 + ch*12345)>>>8)&0xffff;
        data[i]=((seed/32767.5)-1)*env*.55;
      }
    }
    return buffer;
  }

  function ensureGraph(){
    if(state.ctx) {
      if(state.ctx.state==='suspended') state.ctx.resume().catch(()=>{});
      return state.ctx;
    }
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx) return null;
    const ctx=new Ctx();
    const master=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    const delay=ctx.createDelay(1.5);
    const feedback=ctx.createGain();
    const reverb=ctx.createConvolver();
    const compressor=ctx.createDynamicsCompressor();

    master.gain.value=.0001;
    filter.type='lowpass';filter.frequency.value=2900;filter.Q.value=.45;
    delay.delayTime.value=.33;feedback.gain.value=.27;
    reverb.buffer=impulse(ctx);
    compressor.threshold.value=-20;compressor.knee.value=20;compressor.ratio.value=3;compressor.attack.value=.01;compressor.release.value=.4;

    filter.connect(master);
    filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(master);
    filter.connect(reverb);reverb.connect(master);
    master.connect(compressor);compressor.connect(ctx.destination);

    Object.assign(state,{ctx,master,filter,delay,feedback,reverb,compressor});
    return ctx;
  }

  function voice(freq,when,duration=.2,gain=.018,type='sine',detune=0,cutoff=2600){
    if(!state.enabled || !state.ctx || !state.filter) return;
    const ctx=state.ctx,osc=ctx.createOscillator(),amp=ctx.createGain(),toneFilter=ctx.createBiquadFilter();
    osc.type=type;osc.frequency.setValueAtTime(freq,when);osc.detune.setValueAtTime(detune,when);
    toneFilter.type='lowpass';toneFilter.frequency.setValueAtTime(cutoff,when);toneFilter.Q.value=.7;
    amp.gain.setValueAtTime(.0001,when);
    amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),when+.025);
    amp.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(toneFilter).connect(amp).connect(state.filter);
    osc.start(when);osc.stop(when+duration+.04);
  }

  function pad(freqs,when,duration=2.2,gain=.012){
    freqs.forEach((f,i)=>{
      voice(f,when,duration,gain,'sine',i%2?5:-5,1800);
      voice(f/2,when,duration,gain*.33,'triangle',0,900);
    });
  }

  function bell(freq,when,gain=.025){
    voice(freq,when,.75,gain,'sine',0,5200);
    voice(freq*2.01,when,.42,gain*.35,'sine',0,6400);
  }

  function modeMidi(degree,octave=0){
    const p=profile(),scale=p.scale?.length?p.scale:[0,2,4,7,9];
    const d=((degree%scale.length)+scale.length)%scale.length;
    return Number(p.root_midi||50)+scale[d]+12*octave;
  }

  function scheduleTransportStep(when){
    const p=profile(),motif=p.motif?.length?p.motif:[0,2,4,1,3,5,2,4],step=state.step;
    if(step%2===0){
      const degree=motif[step%motif.length];
      const octave=(step%8>=4)?1:0;
      voice(midiToHz(modeMidi(degree,octave)),when,.28,.012+state.eventEnergy*.004,p.wave||'sine',0,2500+state.eventEnergy*700);
    }
    if(step%8===0){
      const chord=[0,2,4].map(d=>midiToHz(modeMidi(d,-1)));
      pad(chord,when,2.6,.0085+state.eventEnergy*.002);
    }
    if(state.computeActive && step%4===0){
      voice(midiToHz(modeMidi(0,-2)),when,.22,.006,'sine',0,520);
    }
    if(step%4===2 && secureIndex(5)===0){
      bell(midiToHz(modeMidi(6,1)),when,.0065);
    }
    state.eventEnergy=Math.max(0,state.eventEnergy-.035);
  }

  function schedulerTick(){
    if(!state.enabled || !state.ctx) return;
    const ctx=state.ctx;
    while(state.nextStepTime < ctx.currentTime+state.policy.lookahead_seconds){
      scheduleTransportStep(state.nextStepTime);
      const bpm=profile().bpm||66;
      state.nextStepTime += (60/bpm)/2;
      state.step=(state.step+1)%16;
    }
  }

  function startScheduler(){
    const ctx=ensureGraph();if(!ctx || state.scheduler) return;
    state.nextStepTime=ctx.currentTime+.05;state.step=0;
    state.scheduler=setInterval(schedulerTick,state.policy.scheduler_ms);
  }

  function stopScheduler(){ if(state.scheduler) clearInterval(state.scheduler);state.scheduler=null; }

  function setEnabled(on){
    if(!state.policy.enabled) on=false;
    state.enabled=Boolean(on);
    const ctx=ensureGraph();
    if(!ctx || !state.master) return;
    const now=ctx.currentTime;
    state.master.gain.cancelScheduledValues(now);
    state.master.gain.setTargetAtTime(state.enabled?state.policy.master_gain:.0001,now,state.enabled?.25:.08);
    if(state.enabled) startScheduler(); else stopScheduler();
    updateStatus();
  }

  function eventChord(degrees,{octave=0,gain=.025,duration=.7,spread=.045}={}){
    if(!state.enabled || !state.ctx) return;
    const now=state.ctx.currentTime+.015;
    degrees.forEach((d,i)=>bell(midiToHz(modeMidi(d,octave)),now+i*spread,gain*(1-i*.1)));
    state.eventEnergy=Math.min(1,state.eventEnergy+.28);
  }

  function spinIgnition(){
    if(!state.enabled || !state.ctx) return;
    const t=state.ctx.currentTime+.01;
    [0,1,4].forEach((d,i)=>voice(midiToHz(modeMidi(d,0)),t+i*.055,.16,.014,'triangle',0,3600));
  }

  function onCascade(e){
    const m=Number(e.detail?.multiplier||1);
    const octave=m>=64?2:m>=16?1:m>=4?1:0;
    eventChord([0,2,4],{octave,gain:.022,duration:.55,spread:.035});
    state.eventEnergy=Math.min(1,state.eventEnergy+(m>=16?.35:.18));
  }

  function onSpinComplete(e){
    if(Number(e.detail?.spin_win||0)>0) eventChord([0,4,2],{octave:0,gain:.016,duration:.45,spread:.06});
  }

  function onSolarCorona(){
    if(!state.enabled || !state.ctx) return;
    const t=state.ctx.currentTime+.02;
    const degrees=[0,2,4,6];
    degrees.forEach((d,i)=>{
      const f=midiToHz(modeMidi(d,i>1?1:0));
      voice(f,t+i*.075,1.7,.025,'sine',i%2?8:-8,5200);
      voice(f/2,t+i*.075,2.2,.009,'triangle',0,1400);
    });
    state.eventEnergy=1;
  }

  function onSpinEnergyEarned(){ eventChord([4,6,1],{octave:1,gain:.018,duration:.65,spread:.07}); }

  function routeTone(name){
    if(!state.enabled || !state.ctx) return;
    const index=['MARKET','SCIENCE','TREASURY','DC','OPERATOR','CUSTOM'].indexOf(String(name).toUpperCase());
    bell(midiToHz(modeMidi(index>=0?index:1,1)),state.ctx.currentTime+.015,.012);
  }

  function updateStatus(){
    const chip=$('cosmic-music-status');
    if(chip) chip.textContent=state.enabled?profile().name:'SILENT';
    const btn=$('sound-toggle');
    if(btn){btn.textContent=state.enabled?'♫ COSMIC AUDIO ON':'♫ COSMIC AUDIO OFF';btn.classList.toggle('active',state.enabled);}
  }

  function buildStatusChip(){
    if($('cosmic-music-chip')) return true;
    const mini=document.querySelector('#helios-game-tools .session-mini');
    if(!mini) return false;
    const chip=document.createElement('span');
    chip.id='cosmic-music-chip';chip.className='session-chip';chip.innerHTML='SYNTH <b id="cosmic-music-status">SILENT</b>';
    mini.appendChild(chip);updateStatus();return true;
  }

  function bindSoundToggle(){
    if(state.attached) return true;
    const btn=$('sound-toggle');if(!btn) return false;
    state.attached=true;
    btn.addEventListener('pointerdown',()=>{if(state.policy.enabled)ensureGraph();},{capture:true});
    btn.addEventListener('click',()=>{
      if(state.policy.enabled) ensureGraph();
      setTimeout(()=>setEnabled(btn.classList.contains('active')),0);
    });
    new MutationObserver(()=>{
      const wanted=btn.classList.contains('active');
      if(wanted!==state.enabled) setEnabled(wanted);
      else updateStatus();
    }).observe(btn,{attributes:true,attributeFilter:['class']});
    updateStatus();return true;
  }

  function observeEnvironment(){
    const modeObserver=new MutationObserver(()=>{
      const next=document.body.dataset.gameMode||'helios';
      if(next===state.mode) return;
      state.mode=next;state.step=0;state.eventEnergy=.2;updateStatus();
      eventChord([0,2,4],{octave:0,gain:.012,duration:.5,spread:.08});
    });
    modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});

    const route=$('selected-route');
    if(route)new MutationObserver(()=>{
      const next=route.textContent.trim();
      if(next&&next!==state.route){state.route=next;routeTone(next);}
    }).observe(route,{childList:true,characterData:true,subtree:true});

    const compute=$('compute-state');
    if(compute)new MutationObserver(()=>{
      const active=compute.textContent.includes('ACTIVE');
      if(active===state.computeActive) return;
      state.computeActive=active;
      if(state.enabled) eventChord(active?[0,4]:[4,0],{octave:-1,gain:.009,duration:.4,spread:.08});
    }).observe(compute,{childList:true,characterData:true,subtree:true});
  }

  function bindGameEvents(){
    window.addEventListener('helios:cascade',onCascade);
    window.addEventListener('helios:spin-complete',onSpinComplete);
    window.addEventListener('helios:solar-corona',onSolarCorona);
    window.addEventListener('helios:spin-energy-earned',onSpinEnergyEarned);
    $('spin')?.addEventListener('click',spinIgnition,{capture:true});
  }

  function bindLifecycle(){
    document.addEventListener('visibilitychange',()=>{
      if(!state.ctx || !state.master) return;
      const now=state.ctx.currentTime;
      state.master.gain.setTargetAtTime(document.hidden?.0001:(state.enabled?state.policy.master_gain:.0001),now,.08);
    });
    window.addEventListener('pagehide',stopScheduler,{once:true});
  }

  async function init(){
    await loadPolicy();
    bindGameEvents();observeEnvironment();bindLifecycle();
    let attempts=0;
    const attach=()=>{
      buildStatusChip();
      if(bindSoundToggle()&&buildStatusChip()) return;
      if(++attempts<80) setTimeout(attach,75);
    };
    attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();