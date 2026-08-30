(() => {
  'use strict';

  const VERSION='1.0.0';
  const MODE_ROOTS=Object.freeze({helios:50,divine:57,gridjack:40,custom:49});
  const ROUTE_OFFSETS=Object.freeze({MARKET:0,SCIENCE:5,TREASURY:-5,DC:7,OPERATOR:2,CUSTOM:10});

  const state={
    attached:false,
    musicEnabled:false,
    sessionSeed:0,
    gestureNo:0,
    ctx:null,
    master:null,
    activeSources:new Set(),
    lastMode:'gridjack',
    lastRoute:'MARKET'
  };

  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function midiToHz(m){return 440*Math.pow(2,(Number(m)-69)/12);}
  function hash32(x){x|=0;x=x+0x7ed55d16+(x<<12);x=x^0xc761c23c^(x>>>19);x=x+0x165667b1+(x<<5);x=x+0xd3a2646c^(x<<9);x=x+0xfd7046c5+(x<<3);x=x^0xb55a4f09^(x>>>16);return x>>>0;}
  function seededUnit(salt=0){return hash32((Number(state.sessionSeed)||0x5a17c9e3)^Math.imul(state.gestureNo+1,0x9e3779b1)^salt)/0xffffffff;}

  function ensureGraph(){
    if(state.ctx){
      if(state.ctx.state==='suspended') state.ctx.resume().catch(()=>{});
      return state.ctx;
    }
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx) return null;
    const ctx=new Ctx();
    const master=ctx.createGain();
    const compressor=ctx.createDynamicsCompressor();
    master.gain.value=.0001;
    compressor.threshold.value=-18;
    compressor.knee.value=18;
    compressor.ratio.value=2.8;
    compressor.attack.value=.008;
    compressor.release.value=.34;
    master.connect(compressor).connect(ctx.destination);
    state.ctx=ctx;
    state.master=master;
    return ctx;
  }

  function currentMode(){return document.body.dataset.gameMode||state.lastMode||'gridjack';}
  function currentRoute(){return document.getElementById('selected-route')?.textContent?.trim().toUpperCase()||state.lastRoute||'MARKET';}
  function tonalRoot(){return Number(MODE_ROOTS[currentMode()]??40)+Number(ROUTE_OFFSETS[currentRoute()]??0);}

  function connectPan(node,pan=0){
    if(!state.ctx?.createStereoPanner) return node;
    const p=state.ctx.createStereoPanner();
    p.pan.value=clamp(pan,-1,1);
    node.connect(p);
    return p;
  }

  function trackSource(src){
    state.activeSources.add(src);
    src.addEventListener?.('ended',()=>state.activeSources.delete(src),{once:true});
    return src;
  }

  function voice({freq,when,duration=.4,gain=.02,type='sine',pan=0,cutoff=4200,detune=0,sweepTo=0}){
    if(!state.musicEnabled||!state.ctx||!state.master) return;
    const ctx=state.ctx;
    const osc=trackSource(ctx.createOscillator());
    const amp=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,when);
    if(sweepTo>0) osc.frequency.exponentialRampToValueAtTime(sweepTo,when+duration*.82);
    osc.detune.setValueAtTime(detune,when);
    filter.type='lowpass';
    filter.frequency.setValueAtTime(cutoff,when);
    filter.Q.value=.7;
    amp.gain.setValueAtTime(.0001,when);
    amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),when+.018);
    amp.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(filter).connect(amp);
    const out=connectPan(amp,pan);
    out.connect(state.master);
    osc.start(when);
    osc.stop(when+duration+.05);
  }

  function energyIgnition(){
    if(!state.musicEnabled) return;
    const ctx=ensureGraph();
    if(!ctx||!state.master) return;
    state.gestureNo++;
    state.lastMode=currentMode();
    state.lastRoute=currentRoute();
    const now=ctx.currentTime+.012;
    const root=tonalRoot();
    const variant=Math.floor(seededUnit(101)*3);
    const intervals=variant===0?[0,7,12,19]:variant===1?[0,5,12,17]:[0,4,11,16];

    state.master.gain.cancelScheduledValues(now);
    state.master.gain.setValueAtTime(Math.max(.0001,state.master.gain.value),now);
    state.master.gain.exponentialRampToValueAtTime(.018,now+.08);
    state.master.gain.setTargetAtTime(.010,now+.72,.18);

    voice({freq:72,when:now,duration:.72,gain:.032,type:'sine',pan:0,cutoff:620,sweepTo:148});
    voice({freq:146,when:now+.03,duration:.54,gain:.012,type:'triangle',pan:-.08,cutoff:1100,sweepTo:292});
    intervals.forEach((interval,i)=>{
      const drift=(seededUnit(300+i)-.5)*7;
      voice({freq:midiToHz(root+12+interval),when:now+.07+i*.082,duration:.52-i*.045,gain:.015-i*.0016,type:i%2?'triangle':'sine',pan:(i-1.5)*.28,cutoff:4300+i*420,detune:drift});
    });
    voice({freq:midiToHz(root+31),when:now+.39,duration:.72,gain:.010,type:'sine',pan:.62,cutoff:6900,detune:4});
    voice({freq:midiToHz(root+36),when:now+.47,duration:.62,gain:.008,type:'sine',pan:-.58,cutoff:7600,detune:-5});

    dispatchEvent(new CustomEvent('helios:energy-spin-audio-ignition',{detail:{version:VERSION,mode:state.lastMode,route:state.lastRoute,gesture:state.gestureNo,presentation_only:true}}));
  }

  function energyResolve(){
    if(!state.musicEnabled||!state.ctx||!state.master) return;
    const ctx=state.ctx;
    const now=ctx.currentTime+.012;
    const root=tonalRoot();
    const variant=Math.floor(seededUnit(700)*2);
    const intervals=variant?[12,7,4]:[12,9,5];
    intervals.forEach((interval,i)=>{
      voice({freq:midiToHz(root+interval),when:now+i*.06,duration:.62,gain:.011-i*.0015,type:'sine',pan:(1-i)*.3,cutoff:3600+i*650});
    });
    state.master.gain.setTargetAtTime(.0001,now+.44,.28);
  }

  function onMusicState(e){
    const d=e.detail||{};
    state.musicEnabled=Boolean(d.enabled);
    if(Number.isFinite(Number(d.session_seed))) state.sessionSeed=Number(d.session_seed)>>>0;
    if(d.mode) state.lastMode=String(d.mode);
    if(d.route) state.lastRoute=String(d.route).toUpperCase();
    if(!state.musicEnabled&&state.master&&state.ctx){
      state.master.gain.setTargetAtTime(.0001,state.ctx.currentTime,.04);
    }
  }

  function onEnergyClick(e){
    const btn=e.target?.closest?.('#energy-spin');
    if(!btn||btn.disabled||!state.musicEnabled) return;
    ensureGraph();
    energyIgnition();
  }

  function onSpinComplete(e){
    if(String(e.detail?.source||'')!=='energy') return;
    energyResolve();
  }

  function bindSignals(){
    document.addEventListener('pointerdown',e=>{
      const btn=e.target?.closest?.('#energy-spin');
      if(btn&&!btn.disabled&&state.musicEnabled) ensureGraph();
    },{capture:true,passive:true});
    document.addEventListener('click',onEnergyClick,{capture:true});
    addEventListener('helios:spin-complete',onSpinComplete);
    addEventListener('helios:music-state',onMusicState);
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden&&state.master&&state.ctx) state.master.gain.setTargetAtTime(.0001,state.ctx.currentTime,.04);
    });
  }

  function hydrate(){
    state.musicEnabled=Boolean(document.getElementById('sound-toggle')?.classList.contains('active'));
    state.lastMode=currentMode();
    state.lastRoute=currentRoute();
  }

  function attach(){
    if(state.attached) return true;
    state.attached=true;
    hydrate();
    bindSignals();
    window.HELIOS_ENERGY_SPIN_SONIFICATION=Object.freeze({
      version:VERSION,
      getState:()=>({version:VERSION,attached:state.attached,music_enabled:state.musicEnabled,session_seed:state.sessionSeed,gesture_no:state.gestureNo,mode:state.lastMode,route:state.lastRoute,presentation_only:true,reads_energy_spin_gesture:true,reads_music_enable_state:true,reads_mode:true,reads_route:true,reads_spin_result_only_for_completion:true,reads_bet:false,reads_balance:false,reads_compute:false,rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'})
    });
    dispatchEvent(new CustomEvent('helios:energy-spin-sonification-ready',{detail:{version:VERSION,presentation_only:true,energy_spin_only:true,cosmic_music_follow:true,procedural_seed_follow:true,rng_effect:'NONE',rtp_effect:'NONE',compute_routing_effect:'NONE'}}));
    return true;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',attach,{once:true});
  else attach();
})();
