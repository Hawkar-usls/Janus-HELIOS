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
    master_gain:0.30,
    scheduler_ms:25,
    lookahead_seconds:0.14,
    profiles:DEFAULT_PROFILES
  };

  const PROGRESSION = [0,4,5,3];
  const BASE_KICKS = [0,4,8,12];
  const GRIDJACK_EXTRA_KICKS = [6,14];
  const BASS_STEPS = [0,3,6,8,11,14];
  const STAR_STEPS = [5,13];

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
    noiseBuffer:null,
    scheduler:null,
    nextStepTime:0,
    step:0,
    bar:0,
    mode:document.body.dataset.gameMode || 'helios',
    route:$('selected-route')?.textContent?.trim() || 'MARKET',
    computeActive:false,
    eventEnergy:0,
    boostBars:0,
    solarBars:0,
    fillSteps:0,
    cascadeTier:0,
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
          profiles[key]={...base,...raw,root_midi:clamp(raw.root_midi ?? base.root_midi,24,84),bpm:clamp(raw.bpm ?? base.bpm,40,110),scale,motif};
        }
      }
      state.policy={
        ...DEFAULT_POLICY,
        ...p,
        default_on:false,
        master_gain:clamp(p.master_gain ?? DEFAULT_POLICY.master_gain,0.08,0.45),
        scheduler_ms:clamp(p.scheduler_ms ?? DEFAULT_POLICY.scheduler_ms,20,80),
        lookahead_seconds:clamp(p.lookahead_seconds ?? DEFAULT_POLICY.lookahead_seconds,0.08,0.30),
        profiles
      };
    }catch(_){ }
  }

  function impulse(ctx,seconds=2.8,decay=2.8){
    const rate=ctx.sampleRate,length=Math.floor(rate*seconds),buffer=ctx.createBuffer(2,length,rate);
    for(let ch=0;ch<2;ch++){
      const data=buffer.getChannelData(ch);
      for(let i=0;i<length;i++){
        const env=Math.pow(1-i/length,decay);
        const seed=((i*1103515245 + ch*12345)>>>8)&0xffff;
        data[i]=((seed/32767.5)-1)*env*.48;
      }
    }
    return buffer;
  }

  function makeNoiseBuffer(ctx){
    const length=Math.floor(ctx.sampleRate*.7),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
    let seed=0x9e3779b9;
    for(let i=0;i<length;i++){
      seed=(seed*1664525+1013904223)>>>0;
      data[i]=(seed/0xffffffff)*2-1;
    }
    return buffer;
  }

  function ensureGraph(){
    if(state.ctx){
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
    filter.type='lowpass';filter.frequency.value=3600;filter.Q.value=.55;
    delay.delayTime.value=.285;feedback.gain.value=.22;
    reverb.buffer=impulse(ctx);
    compressor.threshold.value=-18;compressor.knee.value=20;compressor.ratio.value=3.2;compressor.attack.value=.008;compressor.release.value=.38;

    filter.connect(master);
    filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(master);
    filter.connect(reverb);reverb.connect(master);
    master.connect(compressor);compressor.connect(ctx.destination);

    Object.assign(state,{ctx,master,filter,delay,feedback,reverb,compressor,noiseBuffer:makeNoiseBuffer(ctx)});
    return ctx;
  }

  function connectPan(node,pan=0){
    if(!state.ctx?.createStereoPanner) return node;
    const p=state.ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);node.connect(p);return p;
  }

  function voice(freq,when,duration=.2,gain=.04,type='sine',detune=0,cutoff=3200,pan=0){
    if(!state.enabled || !state.ctx || !state.filter) return;
    const ctx=state.ctx,osc=ctx.createOscillator(),amp=ctx.createGain(),toneFilter=ctx.createBiquadFilter();
    osc.type=type;osc.frequency.setValueAtTime(freq,when);osc.detune.setValueAtTime(detune,when);
    toneFilter.type='lowpass';toneFilter.frequency.setValueAtTime(cutoff,when);toneFilter.Q.value=.65;
    amp.gain.setValueAtTime(.0001,when);amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),when+.018);amp.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(toneFilter).connect(amp);
    const out=connectPan(amp,pan);out.connect(state.filter);
    osc.start(when);osc.stop(when+duration+.04);
  }

  function pad(freqs,when,duration=3.2,gain=.028){
    freqs.forEach((f,i)=>{
      voice(f,when,duration,gain,'sine',i%2?6:-6,1900,(i-1)*.35);
      voice(f/2,when,duration,gain*.32,'triangle',0,850,(1-i)*.18);
    });
  }

  function bell(freq,when,gain=.045,pan=0){
    voice(freq,when,.78,gain,'sine',0,6000,pan);
    voice(freq*2.01,when,.44,gain*.28,'sine',0,7200,-pan*.6);
  }

  function kick(when,intensity=1){
    if(!state.enabled||!state.ctx||!state.master)return;
    const ctx=state.ctx,osc=ctx.createOscillator(),amp=ctx.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(108,when);osc.frequency.exponentialRampToValueAtTime(43,when+.12);
    amp.gain.setValueAtTime(.0001,when);amp.gain.exponentialRampToValueAtTime(.20*intensity,when+.006);amp.gain.exponentialRampToValueAtTime(.0001,when+.20);
    osc.connect(amp).connect(state.master);osc.start(when);osc.stop(when+.22);
  }

  function noiseHit(when,gain=.022,cutoff=5200,duration=.045,pan=0){
    if(!state.enabled||!state.ctx||!state.master||!state.noiseBuffer)return;
    const ctx=state.ctx,src=ctx.createBufferSource(),hp=ctx.createBiquadFilter(),amp=ctx.createGain();
    src.buffer=state.noiseBuffer;hp.type='highpass';hp.frequency.setValueAtTime(cutoff,when);amp.gain.setValueAtTime(gain,when);amp.gain.exponentialRampToValueAtTime(.0001,when+duration);
    src.connect(hp).connect(amp);const out=connectPan(amp,pan);out.connect(state.master);src.start(when,secureIndex(300)/1000);src.stop(when+duration+.02);
  }

  function modeMidi(degree,octave=0){
    const p=profile(),scale=p.scale?.length?p.scale:[0,2,4,7,9],len=scale.length;
    const octaveShift=Math.floor(degree/len);
    const index=((degree%len)+len)%len;
    return Number(p.root_midi||50)+scale[index]+12*(octave+octaveShift);
  }

  function chordRoot(){ return PROGRESSION[state.bar%PROGRESSION.length]; }
  function stepSeconds(){ return (60/(profile().bpm||66))/4; }

  function scheduleTransportStep(when){
    const p=profile(),step=state.step,root=chordRoot(),boost=state.boostBars>0||state.solarBars>0||state.fillSteps>0;
    const energy=clamp(state.eventEnergy,0,1);

    if(step===0){
      const chord=[root,root+2,root+4].map(d=>midiToHz(modeMidi(d,-1)));
      pad(chord,when,stepSeconds()*15.2,.026+(state.solarBars>0?.012:0));
    }

    const kickSteps=state.mode==='gridjack'?[...BASE_KICKS,...GRIDJACK_EXTRA_KICKS]:BASE_KICKS;
    if(kickSteps.includes(step)) kick(when,.78+(state.mode==='gridjack'?.12:0)+(boost?.08:0));

    if(step%2===0) noiseHit(when,.012+(boost?.004:0),5900,.035,step%4===0?-.25:.25);
    if(boost && step%2===1) noiseHit(when,.0075,7000,.024,step%4===1?.45:-.45);

    if(BASS_STEPS.includes(step)){
      const bassDegrees=[0,0,2,0,4,2];
      const d=root+bassDegrees[BASS_STEPS.indexOf(step)];
      voice(midiToHz(modeMidi(d,-2)),when,.24,.070+(energy*.012),'triangle',0,720,step<8?-.18:.18);
    }

    const motif=p.motif?.length?p.motif:[0,2,4,1,3,5,2,4];
    const arpActive=step%2===1 || boost;
    if(arpActive){
      const degree=root+motif[(step+state.bar)%motif.length];
      const octave=state.cascadeTier>=3?2:state.cascadeTier>=1?1:(step>=8?1:0);
      const arpGain=.027+(energy*.012)+(state.solarBars>0?.008:0);
      voice(midiToHz(modeMidi(degree,octave)),when,.13,arpGain,p.wave||'sine',0,4200+(energy*1800),(step%4-1.5)/2.2);
    }

    if(STAR_STEPS.includes(step) || (state.solarBars>0 && step%4===3)){
      bell(midiToHz(modeMidi(root+6,2)),when,.014+(state.solarBars>0?.010:0),step<8?.55:-.55);
    }

    if(state.computeActive && (step===0||step===8)){
      voice(midiToHz(modeMidi(root,-3)),when,.40,.032,'sine',0,430,0);
    }

    if(state.fillSteps>0){
      const degree=root+motif[(16-state.fillSteps)%motif.length];
      voice(midiToHz(modeMidi(degree,1)),when,.10,.032,'sawtooth',0,3200,(state.fillSteps%2?.35:-.35));
      state.fillSteps--;
    }

    state.eventEnergy=Math.max(0,state.eventEnergy-.012);
  }

  function advanceStep(){
    if(state.step===15){
      state.step=0;state.bar++;
      if(state.boostBars>0) state.boostBars--;
      if(state.solarBars>0) state.solarBars--;
      if(state.boostBars===0&&state.solarBars===0) state.cascadeTier=Math.max(0,state.cascadeTier-1);
      updateStatus();
    }else state.step++;
  }

  function schedulerTick(){
    if(!state.enabled||!state.ctx)return;
    const ctx=state.ctx;
    if(state.nextStepTime<ctx.currentTime-.5) state.nextStepTime=ctx.currentTime+.04;
    while(state.nextStepTime<ctx.currentTime+state.policy.lookahead_seconds){
      scheduleTransportStep(state.nextStepTime);
      state.nextStepTime+=stepSeconds();
      advanceStep();
    }
  }

  function startScheduler(){
    const ctx=ensureGraph();if(!ctx||state.scheduler)return;
    state.nextStepTime=ctx.currentTime+.04;state.step=0;
    schedulerTick();
    state.scheduler=setInterval(schedulerTick,state.policy.scheduler_ms);
  }

  function stopScheduler(){ if(state.scheduler)clearInterval(state.scheduler);state.scheduler=null; }

  function primeTransport(){
    if(!state.enabled||!state.ctx)return;
    const t=state.ctx.currentTime+.035,root=chordRoot();
    kick(t,.8);
    pad([root,root+2,root+4].map(d=>midiToHz(modeMidi(d,-1))),t,.9,.024);
    bell(midiToHz(modeMidi(root+6,1)),t+.09,.018,.35);
  }

  async function setEnabled(on){
    if(!state.policy.enabled) on=false;
    state.enabled=Boolean(on);
    const ctx=ensureGraph();
    if(!ctx||!state.master)return;
    if(state.enabled&&ctx.state==='suspended'){
      try{await ctx.resume();}catch(_){ }
    }
    const now=ctx.currentTime;
    state.master.gain.cancelScheduledValues(now);
    state.master.gain.setTargetAtTime(state.enabled?state.policy.master_gain:.0001,now,state.enabled?.12:.05);
    if(state.enabled){startScheduler();primeTransport();}else stopScheduler();
    updateStatus();
    window.dispatchEvent(new CustomEvent('helios:music-state',{detail:{enabled:state.enabled,mode:state.mode,profile:profile().name,bpm:profile().bpm}}));
  }

  function eventChord(degrees,{octave=0,gain=.045,spread=.045}={}){
    if(!state.enabled||!state.ctx)return;
    const now=state.ctx.currentTime+.015;
    degrees.forEach((d,i)=>bell(midiToHz(modeMidi(chordRoot()+d,octave)),now+i*spread,gain*(1-i*.09),(i-1)*.35));
    state.eventEnergy=Math.min(1,state.eventEnergy+.24);
  }

  function spinIgnition(){
    if(!state.enabled||!state.ctx)return;
    state.fillSteps=Math.max(state.fillSteps,4);state.boostBars=Math.max(state.boostBars,1);state.eventEnergy=Math.min(1,state.eventEnergy+.18);
    const t=state.ctx.currentTime+.01,root=chordRoot();
    [0,1,4].forEach((d,i)=>voice(midiToHz(modeMidi(root+d,0)),t+i*.045,.13,.030,'triangle',0,3800,(i-1)*.3));
  }

  function onCascade(e){
    const m=Number(e.detail?.multiplier||1);
    state.cascadeTier=m>=64?4:m>=16?3:m>=4?2:1;
    state.boostBars=Math.max(state.boostBars,m>=16?2:1);state.fillSteps=Math.max(state.fillSteps,m>=16?8:4);state.eventEnergy=Math.min(1,state.eventEnergy+(m>=16?.42:.24));
    eventChord([0,2,4],{octave:m>=16?1:0,gain:m>=64?.070:m>=16?.058:.045,spread:.03});
  }

  function onSpinComplete(e){
    if(Number(e.detail?.spin_win||0)>0){state.boostBars=Math.max(state.boostBars,1);eventChord([0,4,2],{octave:0,gain:.034,spread:.055});}
  }

  function onSolarCorona(){
    if(!state.enabled||!state.ctx)return;
    state.solarBars=4;state.boostBars=Math.max(state.boostBars,4);state.fillSteps=12;state.cascadeTier=4;state.eventEnergy=1;
    const t=state.ctx.currentTime+.02,root=chordRoot();
    [0,2,4,6].forEach((d,i)=>{
      const f=midiToHz(modeMidi(root+d,i>1?1:0));
      voice(f,t+i*.07,1.9,.060,'sine',i%2?8:-8,6200,(i-1.5)/2);
      voice(f/2,t+i*.07,2.4,.020,'triangle',0,1500,(1.5-i)/3);
    });
  }

  function onSpinEnergyEarned(){ state.boostBars=Math.max(state.boostBars,1);eventChord([4,6,1],{octave:1,gain:.040,spread:.065}); }

  function routeTone(name){
    if(!state.enabled||!state.ctx)return;
    const index=['MARKET','SCIENCE','TREASURY','DC','OPERATOR','CUSTOM'].indexOf(String(name).toUpperCase());
    bell(midiToHz(modeMidi(chordRoot()+(index>=0?index:1),1)),state.ctx.currentTime+.015,.025,.3);
  }

  function updateStatus(){
    const chip=$('cosmic-music-status');
    if(chip) chip.textContent=state.enabled?`${profile().name} · ${profile().bpm} BPM`:'SILENT';
    const btn=$('sound-toggle');
    if(btn){btn.textContent=state.enabled?'♫ COSMIC AUDIO ON':'♫ COSMIC AUDIO OFF';btn.classList.toggle('active',state.enabled);}
  }

  function buildStatusChip(){
    if($('cosmic-music-chip'))return true;
    const mini=document.querySelector('#helios-game-tools .session-mini');
    if(!mini)return false;
    const chip=document.createElement('span');chip.id='cosmic-music-chip';chip.className='session-chip';chip.innerHTML='SYNTH <b id="cosmic-music-status">SILENT</b>';
    mini.appendChild(chip);updateStatus();return true;
  }

  function bindSoundToggle(){
    if(state.attached)return true;
    const btn=$('sound-toggle');if(!btn)return false;
    state.attached=true;
    btn.addEventListener('pointerdown',()=>{if(state.policy.enabled)ensureGraph();},{capture:true});
    btn.addEventListener('click',()=>{if(state.policy.enabled)ensureGraph();setTimeout(()=>setEnabled(btn.classList.contains('active')),0);});
    updateStatus();return true;
  }

  function observeEnvironment(){
    new MutationObserver(()=>{
      const next=document.body.dataset.gameMode||'helios';
      if(next===state.mode)return;
      state.mode=next;state.step=0;state.bar=0;state.eventEnergy=.25;state.boostBars=Math.max(state.boostBars,1);updateStatus();
      eventChord([0,2,4],{octave:0,gain:.032,spread:.075});
    }).observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});

    const route=$('selected-route');
    if(route)new MutationObserver(()=>{
      const next=route.textContent.trim();
      if(next&&next!==state.route){state.route=next;routeTone(next);}
    }).observe(route,{childList:true,characterData:true,subtree:true});

    const compute=$('compute-state');
    if(compute)new MutationObserver(()=>{
      const active=compute.textContent.includes('ACTIVE');
      if(active===state.computeActive)return;
      state.computeActive=active;
      if(state.enabled){state.eventEnergy=Math.min(1,state.eventEnergy+.12);eventChord(active?[0,4]:[4,0],{octave:-1,gain:.020,spread:.08});}
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
      if(!state.ctx||!state.master)return;
      if(document.hidden){stopScheduler();state.master.gain.setTargetAtTime(.0001,state.ctx.currentTime,.05);}
      else if(state.enabled){state.master.gain.setTargetAtTime(state.policy.master_gain,state.ctx.currentTime,.10);startScheduler();}
    });
    window.addEventListener('pagehide',stopScheduler,{once:true});
  }

  async function init(){
    await loadPolicy();bindGameEvents();observeEnvironment();bindLifecycle();
    let attempts=0;
    const attach=()=>{
      buildStatusChip();
      if(bindSoundToggle()&&buildStatusChip())return;
      if(++attempts<80)setTimeout(attach,75);
    };
    attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();