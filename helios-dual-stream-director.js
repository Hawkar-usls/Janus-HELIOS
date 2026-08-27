(() => {
  'use strict';

  const DIRECTOR_VERSION = '1.1.0';
  const RHO = 1.20;
  const MAX_DIVERGENCE = 1 / RHO;
  const MOTIFS = Object.freeze(['ORBITAL_SHEAR','GRID_BREATHE','SOLAR_FOLD','SIGNAL_TILT']);
  const FORBIDDEN_PLAYER_INPUTS = Object.freeze([
    'fear','anger','despair','sadness','inferred_vulnerability','problem_gambling_label',
    'loss_streak','near_miss','wager_history','bet_size','balance_pressure'
  ]);
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') || null;

  const state = {
    C:0,
    L:.28,
    R:0,
    P:0,
    recent:[],
    eventCount:0,
    phase:'SETTLED',
    motif:'GRID_BREATHE',
    audioEnabled:false,
    audioCtx:null,
    audioMaster:null,
    phaseTimer:null,
    settleTimer:null,
    active:false,
    reducedMotion:Boolean(motionQuery?.matches)
  };

  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number(n)||0));
  const $=id=>document.getElementById(id);

  function injectStyles(){
    if($('helios-dual-stream-director-styles'))return;
    const style=document.createElement('style');
    style.id='helios-dual-stream-director-styles';
    style.textContent=`
      :root{--director-c:0;--director-l:.28;--director-shift:0px;--director-skew:0deg;--director-glow:0px}
      .helios-director-stage{position:relative;min-width:0;width:100%;border-radius:13px;transform-origin:50% 50%;will-change:transform,filter;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease}.helios-director-stage>.reels{width:100%}
      #helios-director-note{position:absolute;z-index:24;left:50%;top:10px;transform:translateX(-50%);pointer-events:none;opacity:0;min-width:180px;max-width:82%;padding:5px 9px;border:1px solid #705522;border-radius:999px;background:#060a0ed9;box-shadow:0 0 var(--director-glow) #ffc24b44;color:#aeb8be;text-align:center;font:800 7px/1.25 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.10em;transition:opacity .16s,transform .22s,border-color .22s,color .22s}
      #helios-director-note.show{opacity:1;transform:translateX(-50%) translateY(1px)}
      #helios-director-note.divergence{border-color:#bf7f31;color:#ffd178}
      #helios-director-note.resolution{border-color:#5e8290;color:#a9e6ff}
      body.director-divergence .helios-director-stage{filter:saturate(calc(1 + var(--director-c)*.34)) contrast(calc(1 + var(--director-c)*.10));box-shadow:0 0 calc(12px + var(--director-c)*20px) var(--mode-soft)}
      body.director-divergence.director-motif-orbital-shear .helios-director-stage{transform:translateX(var(--director-shift)) skewX(var(--director-skew))}
      body.director-divergence.director-motif-grid-breathe .helios-director-stage{transform:scale(calc(1 + var(--director-c)*.012))}
      body.director-divergence.director-motif-solar-fold .helios-director-stage{transform:perspective(560px) rotateX(calc(var(--director-c)*1.4deg)) scale(calc(1 + var(--director-c)*.006))}
      body.director-divergence.director-motif-signal-tilt .helios-director-stage{transform:rotate(calc(var(--director-c)*.75deg)) translateY(calc(var(--director-c)*-2px))}
      body.director-resolution .helios-director-stage{transition:transform calc(.34s + var(--director-l)*.45s) cubic-bezier(.16,.84,.34,1),filter .28s ease,box-shadow .30s ease;transform:none;filter:none;box-shadow:0 0 calc(10px + var(--director-l)*26px) var(--mode-soft)}
      body.director-resolution .core{filter:drop-shadow(0 0 calc(8px + var(--director-l)*14px) #ffcb6555)}
      @media(prefers-reduced-motion:reduce){.helios-director-stage,body.director-divergence .helios-director-stage,body.director-resolution .helios-director-stage{transform:none!important;transition:filter .18s ease,box-shadow .18s ease!important}#helios-director-note{transition:opacity .12s!important}}
    `;
    document.head.appendChild(style);
  }

  function buildStage(){
    const reels=$('reels');
    if(!reels)return null;
    if(reels.parentElement?.id==='helios-director-stage')return reels.parentElement;
    const stage=document.createElement('div');
    stage.id='helios-director-stage';
    stage.className='helios-director-stage';
    stage.setAttribute('aria-label','HELIOS presentation director stage');
    reels.parentNode?.insertBefore(stage,reels);
    stage.appendChild(reels);
    return stage;
  }

  function buildNote(){
    if($('helios-director-note'))return $('helios-director-note');
    const panel=$('game-panel');if(!panel)return null;
    const note=document.createElement('div');note.id='helios-director-note';note.setAttribute('aria-live','polite');note.setAttribute('aria-atomic','true');panel.appendChild(note);return note;
  }

  function repetitionScore(signature){
    const history=state.recent.slice(-8);
    if(!history.length)return 0;
    const same=history.filter(x=>x===signature).length;
    return clamp(same/Math.min(4,history.length));
  }

  function remember(signature){
    state.recent.push(signature);
    if(state.recent.length>12)state.recent.shift();
  }

  function chooseMotif(signature){
    const base=[...signature].reduce((n,ch)=>(n+ch.charCodeAt(0))%997,0);
    const index=(base+state.eventCount+Math.floor(state.R*3))%MOTIFS.length;
    return MOTIFS[index];
  }

  function setVars(){
    const root=document.documentElement;
    root.style.setProperty('--director-c',state.C.toFixed(3));
    root.style.setProperty('--director-l',state.L.toFixed(3));
    root.style.setProperty('--director-shift',`${(state.C*5.5).toFixed(2)}px`);
    root.style.setProperty('--director-skew',`${(state.C*.9).toFixed(2)}deg`);
    root.style.setProperty('--director-glow',`${Math.round(10+state.L*26)}px`);
  }

  function clearClasses(){
    document.body.classList.remove('director-divergence','director-resolution',...MOTIFS.map(x=>`director-motif-${x.toLowerCase().replaceAll('_','-')}`));
  }

  function emitState(eventName,phase){
    window.dispatchEvent(new CustomEvent('helios:director-state',{detail:{
      version:DIRECTOR_VERSION,
      event:eventName,
      phase,
      divergence:state.C,
      resolution:state.L,
      repetition:state.R,
      presentation_stress:state.P,
      motif:state.motif,
      presentation_only:true,
      game_effect:'NONE',
      rng_effect:'NONE',
      rtp_effect:'NONE'
    }}));
  }

  function showNote(kind,text){
    const note=buildNote();if(!note)return;
    note.className=`show ${kind}`;note.textContent=text;
  }

  function ensureAudio(){
    if(!state.audioEnabled)return null;
    if(state.audioCtx){if(state.audioCtx.state==='suspended')state.audioCtx.resume().catch(()=>{});return state.audioCtx;}
    const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;
    const ctx=new Ctx(),master=ctx.createGain();master.gain.value=.055;master.connect(ctx.destination);state.audioCtx=ctx;state.audioMaster=master;return ctx;
  }

  function tone(freq,when,duration,gain,type='sine',detune=0){
    const ctx=ensureAudio();if(!ctx||!state.audioMaster)return;
    const osc=ctx.createOscillator(),amp=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,when);osc.detune.setValueAtTime(detune,when);amp.gain.setValueAtTime(.0001,when);amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),when+.012);amp.gain.exponentialRampToValueAtTime(.0001,when+duration);osc.connect(amp).connect(state.audioMaster);osc.start(when);osc.stop(when+duration+.03);
  }

  function divergenceAccent(){
    const ctx=ensureAudio();if(!ctx)return;const t=ctx.currentTime+.01,base={helios:146.83,divine:220,gridjack:164.81,custom:138.59}[document.body.dataset.gameMode||'helios']||146.83;
    tone(base,t,.16,.016,'triangle',state.C*18);tone(base*Math.SQRT2,t+.025,.12,.009,'sine',-state.C*23);
  }

  function resolutionAccent(){
    const ctx=ensureAudio();if(!ctx)return;const t=ctx.currentTime+.01,base={helios:146.83,divine:220,gridjack:164.81,custom:138.59}[document.body.dataset.gameMode||'helios']||146.83;
    [1,1.25,1.5].forEach((ratio,i)=>tone(base*ratio,t+i*.035,.48+state.L*.35,.010+state.L*.007,'sine',i===1?3:-3));
  }

  function forceSettle(){
    clearTimeout(state.phaseTimer);clearTimeout(state.settleTimer);state.phaseTimer=null;state.settleTimer=null;clearClasses();state.phase='SETTLED';state.active=false;const note=buildNote();if(note)note.className='';
  }

  function computeStreams({signature,novelty=.25,stress=.10}){
    state.R=repetitionScore(signature);
    const overlap=state.active?.22:0;
    state.P=clamp(state.P*.48+clamp(stress)+overlap);
    const rawC=clamp(state.C*.36+clamp(novelty)+state.R*.28,0,MAX_DIVERGENCE);
    const requiredL=clamp(Math.max(.24+state.P*.34, RHO*rawC),0,1);
    state.C=Math.min(rawC,requiredL/RHO);
    state.L=requiredL;
    setVars();
  }

  function cue({signature,novelty=.25,stress=.10,label='HELIOS DEVIATION'}={}){
    if(!signature)return;
    if(state.active)forceSettle();
    state.eventCount+=1;computeStreams({signature:String(signature),novelty:clamp(novelty),stress:clamp(stress)});state.motif=chooseMotif(String(signature));remember(String(signature));state.active=true;state.phase='DIVERGENCE';
    const motifClass=`director-motif-${state.motif.toLowerCase().replaceAll('_','-')}`;clearClasses();document.body.classList.add('director-divergence',motifClass);showNote('divergence',`${String(label)} · DIVERGENCE ${(state.C*100).toFixed(0)}%`);divergenceAccent();emitState(String(signature),'DIVERGENCE');
    const divergenceMs=state.reducedMotion?90:Math.round(150+state.C*300);
    state.phaseTimer=setTimeout(()=>{
      clearClasses();document.body.classList.add('director-resolution');state.phase='RESOLUTION';showNote('resolution',`VECTOR RESOLVED · ${(state.L*100).toFixed(0)}%`);resolutionAccent();emitState(String(signature),'RESOLUTION');
      const resolutionMs=state.reducedMotion?180:Math.round(420+state.L*480);
      state.settleTimer=setTimeout(()=>{
        clearClasses();state.phase='SETTLED';state.active=false;state.C*=.55;state.P*=.45;state.L=Math.max(.24,state.L*.72);setVars();const note=buildNote();if(note)note.className='';emitState(String(signature),'SETTLED');
      },resolutionMs);
    },divergenceMs);
  }

  function bindEvents(){
    window.addEventListener('helios:music-state',e=>{state.audioEnabled=e.detail?.enabled===true;if(!state.audioEnabled&&state.audioCtx?.state==='running')state.audioCtx.suspend().catch(()=>{});});
    window.addEventListener('helios:cascade',e=>{const m=Number(e.detail?.multiplier||1);cue({signature:`CASCADE_${m>=16?'HIGH':'LOW'}`,novelty:m>=64?.66:m>=16?.52:.36,stress:m>=16?.34:.18,label:'CASCADE VECTOR SHIFT'});});
    window.addEventListener('helios:spin-complete',e=>{if(Number(e.detail?.spin_win||0)>0)cue({signature:'PAID_WIN',novelty:.30,stress:.10,label:'SOLAR RESOLUTION'});});
    window.addEventListener('helios:solar-corona',()=>cue({signature:'SOLAR_CORONA',novelty:.68,stress:.44,label:'CORONA SCRIPT BREAK'}));
    window.addEventListener('helios:bonus-wheel-start',()=>cue({signature:'BONUS_WHEEL_START',novelty:.56,stress:.38,label:'CORONA ORBIT BREAK'}));
    window.addEventListener('helios:bonus-wheel-complete',()=>cue({signature:'BONUS_WHEEL_COMPLETE',novelty:.22,stress:.12,label:'CORONA LOCK'}));
    window.addEventListener('helios:bonus-session-start',()=>cue({signature:'BONUS_SESSION_START',novelty:.48,stress:.28,label:'BONUS CONSTELLATION'}));
    window.addEventListener('helios:bonus-session-complete',()=>cue({signature:'BONUS_SESSION_COMPLETE',novelty:.18,stress:.08,label:'RETURN TO ORBIT'}));

    let mode=document.body.dataset.gameMode||'helios';
    new MutationObserver(()=>{const next=document.body.dataset.gameMode||'helios';if(next!==mode){mode=next;cue({signature:`MODE_${next}`,novelty:.38,stress:.14,label:'MODE GEOMETRY SHIFT'});}}).observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    const route=$('selected-route');if(route){let previous=route.textContent.trim();new MutationObserver(()=>{const next=route.textContent.trim();if(next&&next!==previous){previous=next;cue({signature:`ROUTE_${next}`,novelty:.34,stress:.12,label:'ROUTE VECTOR SHIFT'});}}).observe(route,{childList:true,characterData:true,subtree:true});}
    motionQuery?.addEventListener?.('change',e=>{state.reducedMotion=Boolean(e.matches);if(state.reducedMotion&&state.active)forceSettle();});
  }

  function init(){injectStyles();buildStage();buildNote();setVars();bindEvents();window.HELIOS_DUAL_STREAM_DIRECTOR=Object.freeze({version:DIRECTOR_VERSION,getState:()=>({...state,recent:[...state.recent],audioCtx:undefined,audioMaster:undefined,phaseTimer:undefined,settleTimer:undefined}),cue});window.dispatchEvent(new CustomEvent('helios:director-ready',{detail:{version:DIRECTOR_VERSION,presentation_only:true,forbidden_player_inputs:FORBIDDEN_PLAYER_INPUTS}}));}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();