(() => {
  'use strict';

  const VERSION = '1.0.0';
  const CAMERA_DURATION_MS = 2400;
  const TINT_DURATION_MS = 1900;
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') || null;

  const CUES = Object.freeze({
    helios:Object.freeze({x:0,y:0,rotate:0,scale:1.055,tint:'rgba(255,176,66,.045)',glow:'rgba(255,155,35,.10)'}),
    divine:Object.freeze({x:-42,y:18,rotate:-1.15,scale:1.072,tint:'rgba(177,105,255,.115)',glow:'rgba(218,167,255,.15)'}),
    gridjack:Object.freeze({x:38,y:-14,rotate:1.05,scale:1.068,tint:'rgba(57,255,157,.095)',glow:'rgba(77,255,195,.14)'}),
    custom:Object.freeze({x:-28,y:-24,rotate:.78,scale:1.076,tint:'rgba(66,181,255,.105)',glow:'rgba(93,214,255,.15)'})
  });

  const state = {
    attached:false,
    reducedMotion:Boolean(motionQuery?.matches),
    cosmos:null,
    canvas:null,
    veil:null,
    modeObserver:null,
    mode:'helios'
  };

  function cueFor(mode){ return CUES[mode] || CUES.helios; }
  function transformFor(cue){ return `translate3d(${cue.x}px,${cue.y}px,0) scale(${cue.scale}) rotate(${cue.rotate}deg)`; }

  function ensureVeil(){
    let veil=state.cosmos?.querySelector('.helios-mode-veil');
    if(!veil&&state.cosmos){
      veil=document.createElement('div');
      veil.className='helios-mode-veil';
      veil.setAttribute('aria-hidden','true');
      veil.style.cssText='position:absolute;inset:0;z-index:2;pointer-events:none;opacity:1;background-color:rgba(255,176,66,.045);box-shadow:inset 0 0 220px rgba(255,155,35,.10);will-change:background-color,box-shadow;';
      state.cosmos.appendChild(veil);
    }
    state.veil=veil||null;
    return state.veil;
  }

  function setTransitions(){
    if(!state.canvas||!state.veil) return;
    if(state.reducedMotion){
      state.canvas.style.setProperty('transition','opacity .35s ease','important');
      state.veil.style.transition='background-color 180ms ease,box-shadow 180ms ease';
      return;
    }
    state.canvas.style.setProperty('transition',`opacity 2.4s cubic-bezier(.22,.61,.36,1),transform ${CAMERA_DURATION_MS}ms cubic-bezier(.16,.78,.22,1)`,'important');
    state.veil.style.transition=`background-color ${TINT_DURATION_MS}ms cubic-bezier(.22,.61,.36,1),box-shadow ${TINT_DURATION_MS}ms cubic-bezier(.22,.61,.36,1)`;
  }

  function applyCue(mode,{initial=false}={}){
    const next=CUES[mode]?mode:'helios';
    const cue=cueFor(next);
    state.mode=next;
    if(!state.canvas||!state.cosmos||!state.veil) return;

    // Root mode hue filters are intentionally neutralized here. Colour now crossfades through the veil.
    state.cosmos.style.setProperty('filter','none','important');
    state.canvas.style.setProperty('transform-origin','50% 50%','important');
    state.canvas.style.setProperty('will-change','transform, opacity','important');

    if(state.reducedMotion){
      setTransitions();
      state.canvas.style.setProperty('transform','none','important');
      state.veil.style.backgroundColor=cue.tint;
      state.veil.style.boxShadow=`inset 0 0 220px ${cue.glow}`;
      state.veil.dataset.mode=next;
      return;
    }

    if(initial){
      state.canvas.style.setProperty('transition','none','important');
      state.veil.style.transition='none';
      state.canvas.style.setProperty('transform',transformFor(cue),'important');
      state.veil.style.backgroundColor=cue.tint;
      state.veil.style.boxShadow=`inset 0 0 220px ${cue.glow}`;
      void state.canvas.offsetWidth;
      void state.veil.offsetWidth;
      setTransitions();
    }else{
      setTransitions();
      state.canvas.style.setProperty('transform',transformFor(cue),'important');
      state.veil.style.backgroundColor=cue.tint;
      state.veil.style.boxShadow=`inset 0 0 220px ${cue.glow}`;
    }
    state.veil.dataset.mode=next;
  }

  function bindMode(){
    if(state.modeObserver) return;
    let previous=document.body.dataset.gameMode||'helios';
    state.modeObserver=new MutationObserver(()=>{
      const next=document.body.dataset.gameMode||'helios';
      if(next===previous) return;
      previous=next;
      applyCue(next);
    });
    state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
  }

  function bindMotionPreference(){
    motionQuery?.addEventListener?.('change',e=>{
      state.reducedMotion=Boolean(e.matches);
      applyCue(document.body.dataset.gameMode||state.mode,{initial:true});
    });
  }

  function resolveNodes(){
    state.cosmos=document.querySelector('.cosmos');
    state.canvas=document.querySelector('.helios-stellar-canvas');
    return Boolean(state.cosmos&&state.canvas&&ensureVeil());
  }

  function attach(){
    if(state.attached) return true;
    if(!resolveNodes()) return false;
    state.attached=true;
    const initial=document.body.dataset.gameMode||'helios';
    applyCue(initial,{initial:true});
    bindMode();
    bindMotionPreference();
    window.HELIOS_MODE_FLIGHT=Object.freeze({
      version:VERSION,
      getState:()=>({
        version:VERSION,
        attached:state.attached,
        mode:state.mode,
        reduced_motion:state.reducedMotion,
        camera_duration_ms:state.reducedMotion?0:CAMERA_DURATION_MS,
        tint_duration_ms:state.reducedMotion?180:TINT_DURATION_MS,
        presentation_only:true,
        reads_mode:true,
        reads_spin:false,
        reads_cascade:false,
        reads_win:false,
        reads_bonus:false,
        reads_bet:false,
        reads_balance:false,
        reads_compute:false,
        rng_effect:'NONE',
        rtp_effect:'NONE',
        payout_effect:'NONE',
        compute_routing_effect:'NONE'
      })
    });
    dispatchEvent(new CustomEvent('helios:mode-flight-ready',{detail:{
      version:VERSION,
      presentation_only:true,
      mode_camera_turn:true,
      tint_crossfade:true,
      game_event_reactivity:false,
      rng_effect:'NONE',
      rtp_effect:'NONE',
      compute_routing_effect:'NONE'
    }}));
    return true;
  }

  function init(){
    if(attach()) return;
    let attempts=0;
    const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);};
    retry();
    addEventListener('helios:stellar-ready',()=>attach(),{once:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
