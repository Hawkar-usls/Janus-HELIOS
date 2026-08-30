(() => {
  'use strict';

  const VERSION='1.1.0';
  const TRANSIENT_CORONA_MS=3400;
  const PRIMARY_SPIN_MS=3050;
  const SECONDARY_SPIN_MS=4350;
  const PRECESS_MS=5600;
  const CORE_PULSE_MS=1900;
  const motionQuery=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')||null;

  const state={
    attached:false,
    reducedMotion:Boolean(motionQuery?.matches),
    orbit:null,
    sessionActive:false,
    transientActive:false,
    transientTimer:0,
    classObserver:null,
    active:false,
    source:'IDLE',
    lastEmittedKey:''
  };

  function injectStyles(){
    if(document.getElementById('helios-bonus-quasar-styles')) return;
    const style=document.createElement('style');
    style.id='helios-bonus-quasar-styles';
    style.textContent=`
      .orbit-field{overflow:visible!important}
      .helios-bonus-quasar{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .72s cubic-bezier(.22,.61,.36,1);transform-style:preserve-3d;perspective:900px}
      .helios-bonus-quasar>*{position:absolute;left:50%;top:50%;pointer-events:none}
      .helios-quasar-halo{width:46%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) scale(.76);background:radial-gradient(circle,rgba(255,221,142,.10) 0 4%,rgba(255,173,66,.045) 19%,rgba(255,125,38,.016) 38%,transparent 67%);box-shadow:0 0 44px rgba(255,157,54,.055),inset 0 0 36px rgba(255,196,97,.035);opacity:0;transition:opacity .8s ease,transform 1.1s cubic-bezier(.16,.78,.22,1)}
      .helios-quasar-axis{width:56%;height:56%;transform:translate(-50%,-50%) rotate(-18deg);transform-origin:50% 50%;opacity:0;transition:opacity .65s ease}
      .helios-quasar-disk,.helios-quasar-disk-secondary{position:absolute;left:50%;top:50%;border-radius:50%;transform-origin:50% 50%;will-change:transform}
      .helios-quasar-disk{width:100%;height:24%;background:radial-gradient(ellipse at center,rgba(255,247,211,.16) 0 4%,rgba(255,202,111,.13) 12%,rgba(255,153,54,.075) 33%,rgba(255,104,26,.022) 55%,transparent 72%);border:1px solid rgba(255,196,105,.20);box-shadow:0 0 18px rgba(255,165,61,.09),inset 0 0 12px rgba(255,225,150,.08);transform:translate(-50%,-50%) rotate(0deg) skewX(-11deg)}
      .helios-quasar-disk-secondary{width:82%;height:17%;border:1px solid rgba(255,232,177,.13);box-shadow:0 0 14px rgba(255,133,40,.06);transform:translate(-50%,-50%) rotate(0deg) skewX(15deg)}
      .helios-quasar-core{width:22px;height:22px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#fffdf1 0 15%,#ffe6a0 28%,#ffb84f 49%,#d76519 68%,rgba(70,22,5,.86) 82%,transparent 84%);box-shadow:0 0 12px rgba(255,241,192,.46),0 0 28px rgba(255,166,67,.20);opacity:0;transition:opacity .45s ease,transform .72s cubic-bezier(.16,.78,.22,1)}
      .helios-quasar-jets{width:2px;height:37%;transform:translate(-50%,-50%) rotate(72deg) scaleY(.45);transform-origin:50% 50%;background:linear-gradient(180deg,transparent,rgba(171,211,255,.08) 22%,rgba(255,238,191,.32) 47%,rgba(255,255,244,.42) 50%,rgba(255,238,191,.32) 53%,rgba(171,211,255,.08) 78%,transparent);box-shadow:0 0 7px rgba(255,219,151,.12);opacity:0;transition:opacity .65s ease,transform .9s cubic-bezier(.16,.78,.22,1)}
      .orbit-field.bonus-quasar-active{border-color:rgba(255,183,75,.24)!important;box-shadow:inset 0 0 30px rgba(255,143,37,.025),0 0 24px rgba(255,143,37,.025)!important;transition:border-color .8s ease,box-shadow .8s ease,opacity .8s ease!important}
      .orbit-field.bonus-quasar-active .helios-bonus-quasar{opacity:1}
      .orbit-field.bonus-quasar-active .helios-quasar-halo{opacity:.92;transform:translate(-50%,-50%) scale(1)}
      .orbit-field.bonus-quasar-active .helios-quasar-axis{opacity:1;animation:heliosQuasarPrecess ${PRECESS_MS}ms ease-in-out infinite alternate}
      .orbit-field.bonus-quasar-active .helios-quasar-disk{animation:heliosQuasarSpin ${PRIMARY_SPIN_MS}ms linear infinite}
      .orbit-field.bonus-quasar-active .helios-quasar-disk-secondary{animation:heliosQuasarCounterSpin ${SECONDARY_SPIN_MS}ms linear infinite}
      .orbit-field.bonus-quasar-active .helios-quasar-core{opacity:1;animation:heliosQuasarCore ${CORE_PULSE_MS}ms ease-in-out infinite}
      .orbit-field.bonus-quasar-active .helios-quasar-jets{opacity:.56;transform:translate(-50%,-50%) rotate(72deg) scaleY(1);animation:heliosQuasarJets 2.5s ease-in-out infinite}
      @keyframes heliosQuasarSpin{from{transform:translate(-50%,-50%) rotate(0deg) skewX(-11deg)}to{transform:translate(-50%,-50%) rotate(360deg) skewX(-11deg)}}
      @keyframes heliosQuasarCounterSpin{from{transform:translate(-50%,-50%) rotate(360deg) skewX(15deg)}to{transform:translate(-50%,-50%) rotate(0deg) skewX(15deg)}}
      @keyframes heliosQuasarPrecess{0%{transform:translate(-50%,-50%) rotate(-22deg) scaleY(.92)}48%{transform:translate(-50%,-50%) rotate(-14deg) scaleY(1.04)}100%{transform:translate(-50%,-50%) rotate(-20deg) scaleY(.95)}}
      @keyframes heliosQuasarCore{0%,100%{transform:translate(-50%,-50%) scale(.94);box-shadow:0 0 10px rgba(255,241,192,.38),0 0 24px rgba(255,166,67,.16)}50%{transform:translate(-50%,-50%) scale(1.09);box-shadow:0 0 15px rgba(255,244,203,.52),0 0 34px rgba(255,166,67,.22)}}
      @keyframes heliosQuasarJets{0%,100%{opacity:.36;filter:brightness(.92)}50%{opacity:.62;filter:brightness(1.08)}}
      @media(prefers-reduced-motion:reduce){.helios-bonus-quasar,.helios-bonus-quasar *{animation:none!important;transition-duration:.18s!important}.orbit-field.bonus-quasar-active .helios-quasar-axis{transform:translate(-50%,-50%) rotate(-18deg)}.orbit-field.bonus-quasar-active .helios-quasar-core{transform:translate(-50%,-50%) scale(1)}.orbit-field.bonus-quasar-active .helios-quasar-jets{opacity:.36}}
    `;
    document.head.appendChild(style);
  }

  function ensureVisual(){
    state.orbit=document.querySelector('.orbit-field');
    if(!state.orbit) return false;
    if(!state.orbit.querySelector('.helios-bonus-quasar')){
      const root=document.createElement('div');
      root.className='helios-bonus-quasar';
      root.setAttribute('aria-hidden','true');
      root.innerHTML='<div class="helios-quasar-halo"></div><div class="helios-quasar-axis"><div class="helios-quasar-disk"></div><div class="helios-quasar-disk-secondary"></div></div><div class="helios-quasar-jets"></div><div class="helios-quasar-core"></div>';
      state.orbit.appendChild(root);
    }
    return true;
  }

  function stateDetail(){
    return {
      version:VERSION,
      active:state.active,
      source:state.source,
      reduced_motion:state.reducedMotion,
      primary_spin_ms:PRIMARY_SPIN_MS,
      secondary_spin_ms:SECONDARY_SPIN_MS,
      precess_ms:PRECESS_MS,
      core_pulse_ms:CORE_PULSE_MS,
      presentation_only:true,
      audio_clock_only:true,
      rng_effect:'NONE',
      rtp_effect:'NONE',
      payout_effect:'NONE',
      compute_routing_effect:'NONE'
    };
  }

  function emitState(force=false){
    const key=`${state.active?'1':'0'}:${state.source}:${state.reducedMotion?'1':'0'}`;
    if(!force&&key===state.lastEmittedKey) return;
    state.lastEmittedKey=key;
    dispatchEvent(new CustomEvent('helios:bonus-quasar-state',{detail:stateDetail()}));
  }

  function syncActive(source=state.source){
    const active=Boolean(state.sessionActive||state.transientActive);
    state.active=active;
    state.source=active?source:'IDLE';
    state.orbit?.classList.toggle('bonus-quasar-active',active);
    if(state.orbit){
      state.orbit.dataset.bonusQuasar=active?'1':'0';
      state.orbit.dataset.bonusQuasarSource=state.source;
    }
    emitState();
  }

  function startSession(){
    state.sessionActive=true;
    syncActive('FREE_SPINS_SESSION');
  }

  function endSessionFromClass(){
    state.sessionActive=Boolean(document.body.classList.contains('solar-free-spins-active'));
    syncActive(state.sessionActive?'FREE_SPINS_SESSION':state.transientActive?'SOLAR_CORONA':'IDLE');
  }

  function pulseCorona(){
    state.transientActive=true;
    clearTimeout(state.transientTimer);
    syncActive(state.sessionActive?'FREE_SPINS_SESSION':'SOLAR_CORONA');
    state.transientTimer=setTimeout(()=>{
      state.transientActive=false;
      syncActive(state.sessionActive?'FREE_SPINS_SESSION':'IDLE');
    },TRANSIENT_CORONA_MS);
  }

  function bindBonusSignals(){
    addEventListener('helios:bonus-session-start',startSession);
    addEventListener('helios:solar-corona',pulseCorona);
    state.classObserver=new MutationObserver(endSessionFromClass);
    state.classObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
    endSessionFromClass();
  }

  function bindMotionPreference(){
    motionQuery?.addEventListener?.('change',e=>{state.reducedMotion=Boolean(e.matches);emitState(true);});
  }

  function attach(){
    if(state.attached) return true;
    injectStyles();
    if(!ensureVisual()) return false;
    state.attached=true;
    bindBonusSignals();
    bindMotionPreference();
    window.HELIOS_BONUS_QUASAR=Object.freeze({
      version:VERSION,
      getState:()=>({
        ...stateDetail(),
        attached:state.attached,
        reads_bonus:true,
        reads_mode:false,
        reads_spin:false,
        reads_cascade:false,
        reads_win:false,
        reads_bet:false,
        reads_balance:false,
        reads_compute:false
      })
    });
    dispatchEvent(new CustomEvent('helios:bonus-quasar-ready',{detail:{...stateDetail(),bonus_only:true,orbit_field_quasar:true}}));
    emitState(true);
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