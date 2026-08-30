(() => {
  'use strict';

  const VERSION='1.0.0';
  const DEFAULT_KINEMATICS=Object.freeze({primary_spin_ms:3050,secondary_spin_ms:4350,precess_ms:5600,core_pulse_ms:1900});
  const PARTICLE_DIVISIONS=4;
  const ROOT_MIDI=38;
  const PARTICLE_DEGREES=[0,7,12,16,19,12,7,14];

  const state={
    attached:false,
    musicEnabled:false,
    quasarActive:false,
    source:'IDLE',
    ctx:null,
    master:null,
    orbitNodes:null,
    particleTimer:0,
    particleStep:0,
    kinematics:{...DEFAULT_KINEMATICS},
    lastStartKey:''
  };

  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function midiToHz(m){return 440*Math.pow(2,(Number(m)-69)/12);}

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
    compressor.threshold.value=-20;
    compressor.knee.value=18;
    compressor.ratio.value=2.5;
    compressor.attack.value=.01;
    compressor.release.value=.42;
    master.connect(compressor).connect(ctx.destination);
    state.ctx=ctx;
    state.master=master;
    return ctx;
  }

  function particleTone(){
    if(!state.musicEnabled||!state.quasarActive||!state.ctx||!state.master) return;
    const ctx=state.ctx;
    const step=state.particleStep++;
    const degree=PARTICLE_DEGREES[step%PARTICLE_DEGREES.length];
    const freq=midiToHz(ROOT_MIDI+degree+24);
    const osc=ctx.createOscillator();
    const amp=ctx.createGain();
    const hp=ctx.createBiquadFilter();
    const pan=ctx.createStereoPanner?.();
    const now=ctx.currentTime+.006;
    osc.type=step%3===0?'triangle':'sine';
    osc.frequency.setValueAtTime(freq,now);
    hp.type='highpass';
    hp.frequency.value=850;
    amp.gain.setValueAtTime(.0001,now);
    amp.gain.exponentialRampToValueAtTime(state.source==='FREE_SPINS_SESSION'?.011:.008,now+.018);
    amp.gain.exponentialRampToValueAtTime(.0001,now+.34);
    osc.connect(hp).connect(amp);
    if(pan){
      pan.pan.value=((step%4)-1.5)/2.0;
      amp.connect(pan).connect(state.master);
    }else amp.connect(state.master);
    osc.start(now);
    osc.stop(now+.38);
  }

  function clearParticleClock(){
    if(state.particleTimer) clearInterval(state.particleTimer);
    state.particleTimer=0;
  }

  function startParticleClock(){
    clearParticleClock();
    const interval=Math.max(380,Number(state.kinematics.primary_spin_ms||3050)/PARTICLE_DIVISIONS);
    particleTone();
    state.particleTimer=setInterval(particleTone,interval);
  }

  function stopOrbitLayer(immediate=false){
    clearParticleClock();
    const nodes=state.orbitNodes;
    state.orbitNodes=null;
    state.lastStartKey='';
    if(!nodes||!state.ctx) return;
    const now=state.ctx.currentTime;
    try{
      nodes.bus.gain.cancelScheduledValues(now);
      nodes.bus.gain.setTargetAtTime(.0001,now,immediate?.025:.20);
      const stopAt=now+(immediate?.08:.72);
      for(const src of nodes.sources) src.stop(stopAt);
    }catch(_){ }
  }

  function startOrbitLayer(){
    if(!state.musicEnabled||!state.quasarActive) return;
    const ctx=ensureGraph();
    if(!ctx||!state.master) return;
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});

    const key=`${state.source}:${state.kinematics.primary_spin_ms}:${state.kinematics.secondary_spin_ms}:${state.kinematics.precess_ms}:${state.kinematics.core_pulse_ms}`;
    if(state.orbitNodes&&key===state.lastStartKey) return;
    if(state.orbitNodes) stopOrbitLayer(true);
    state.lastStartKey=key;

    const now=ctx.currentTime+.02;
    const bus=ctx.createGain();
    const bodyFilter=ctx.createBiquadFilter();
    const panner=ctx.createStereoPanner?.()||null;
    const primary=ctx.createOscillator();
    const harmonic=ctx.createOscillator();
    const ampLfo=ctx.createOscillator();
    const ampDepth=ctx.createGain();
    const panLfo=ctx.createOscillator();
    const panDepth=ctx.createGain();
    const precessLfo=ctx.createOscillator();
    const precessDepth=ctx.createGain();
    const coreLfo=ctx.createOscillator();
    const detuneDepth=ctx.createGain();

    bus.gain.setValueAtTime(.0001,now);
    bus.gain.exponentialRampToValueAtTime(state.source==='FREE_SPINS_SESSION'?.014:.011,now+.48);
    bodyFilter.type='lowpass';
    bodyFilter.frequency.setValueAtTime(1050,now);
    bodyFilter.Q.value=.9;

    primary.type='sine';
    primary.frequency.setValueAtTime(midiToHz(ROOT_MIDI),now);
    harmonic.type='triangle';
    harmonic.frequency.setValueAtTime(midiToHz(ROOT_MIDI+12),now);
    primary.connect(bodyFilter);
    harmonic.connect(bodyFilter);
    bodyFilter.connect(bus);
    if(panner) bus.connect(panner).connect(state.master);
    else bus.connect(state.master);

    ampLfo.type='sine';
    ampLfo.frequency.value=1000/Math.max(500,Number(state.kinematics.primary_spin_ms||3050));
    ampDepth.gain.value=.0042;
    ampLfo.connect(ampDepth).connect(bus.gain);

    panLfo.type='sine';
    panLfo.frequency.value=1000/Math.max(500,Number(state.kinematics.secondary_spin_ms||4350));
    panDepth.gain.value=.52;
    if(panner) panLfo.connect(panDepth).connect(panner.pan);

    precessLfo.type='sine';
    precessLfo.frequency.value=1000/Math.max(500,Number(state.kinematics.precess_ms||5600));
    precessDepth.gain.value=420;
    precessLfo.connect(precessDepth).connect(bodyFilter.frequency);

    coreLfo.type='sine';
    coreLfo.frequency.value=1000/Math.max(500,Number(state.kinematics.core_pulse_ms||1900));
    detuneDepth.gain.value=5.5;
    coreLfo.connect(detuneDepth).connect(harmonic.detune);

    const sources=[primary,harmonic,ampLfo,panLfo,precessLfo,coreLfo];
    sources.forEach(src=>src.start(now));
    state.orbitNodes={bus,bodyFilter,panner,sources,source:state.source};
    state.particleStep=0;
    startParticleClock();
  }

  function syncPlayback(){
    if(state.musicEnabled&&state.quasarActive) startOrbitLayer();
    else stopOrbitLayer(false);
  }

  function onMusicState(e){
    state.musicEnabled=Boolean(e.detail?.enabled);
    syncPlayback();
  }

  function onQuasarState(e){
    const d=e.detail||{};
    state.quasarActive=Boolean(d.active);
    state.source=String(d.source||'IDLE');
    state.kinematics={
      primary_spin_ms:clamp(d.primary_spin_ms||DEFAULT_KINEMATICS.primary_spin_ms,500,12000),
      secondary_spin_ms:clamp(d.secondary_spin_ms||DEFAULT_KINEMATICS.secondary_spin_ms,500,12000),
      precess_ms:clamp(d.precess_ms||DEFAULT_KINEMATICS.precess_ms,500,16000),
      core_pulse_ms:clamp(d.core_pulse_ms||DEFAULT_KINEMATICS.core_pulse_ms,500,8000)
    };
    syncPlayback();
  }

  function hydrateInitialState(){
    state.musicEnabled=Boolean(document.getElementById('sound-toggle')?.classList.contains('active'));
    const q=window.HELIOS_BONUS_QUASAR?.getState?.();
    if(q) onQuasarState({detail:q});
  }

  function bindGesturePrime(){
    const btn=document.getElementById('sound-toggle');
    btn?.addEventListener('pointerdown',()=>ensureGraph(),{capture:true,passive:true});
  }

  function bindLifecycle(){
    addEventListener('helios:music-state',onMusicState);
    addEventListener('helios:bonus-quasar-state',onQuasarState);
    addEventListener('helios:bonus-quasar-ready',()=>{
      const q=window.HELIOS_BONUS_QUASAR?.getState?.();
      if(q) onQuasarState({detail:q});
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden) stopOrbitLayer(false);
      else syncPlayback();
    });
  }

  function attach(){
    if(state.attached) return true;
    state.attached=true;
    bindGesturePrime();
    bindLifecycle();
    hydrateInitialState();
    window.HELIOS_QUASAR_SONIFICATION=Object.freeze({
      version:VERSION,
      getState:()=>({
        version:VERSION,
        attached:state.attached,
        music_enabled:state.musicEnabled,
        quasar_active:state.quasarActive,
        source:state.source,
        primary_spin_ms:state.kinematics.primary_spin_ms,
        secondary_spin_ms:state.kinematics.secondary_spin_ms,
        precess_ms:state.kinematics.precess_ms,
        core_pulse_ms:state.kinematics.core_pulse_ms,
        presentation_only:true,
        reads_music_enable_state:true,
        reads_bonus_quasar_state:true,
        reads_spin:false,
        reads_cascade:false,
        reads_win:false,
        reads_bet:false,
        reads_balance:false,
        reads_compute:false,
        rng_effect:'NONE',
        rtp_effect:'NONE',
        payout_effect:'NONE',
        compute_routing_effect:'NONE'
      })
    });
    dispatchEvent(new CustomEvent('helios:quasar-sonification-ready',{detail:{version:VERSION,presentation_only:true,bonus_quasar_only:true,cosmic_music_follow:true,rotation_synchronized:true,rng_effect:'NONE',rtp_effect:'NONE',compute_routing_effect:'NONE'}}));
    return true;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',attach,{once:true});
  else attach();
})();