(() => {
  'use strict';

  const BRIDGE_VERSION = '1.0.4';
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') || null;
  const clamp = (n,min,max) => Math.max(min,Math.min(max,Number(n)||0));

  const state = {
    attached:false,
    reducedMotion:Boolean(motionQuery?.matches),
    cosmos:null,
    canvas:null,
    dyson:null,
    gamePanel:null,
    router:null,
    cpuInput:null,
    computeState:null,
    resizeObserver:null,
    computeObserver:null,
    anchorRaf:0,
    cpuPercent:0,
    computeActive:false
  };

  function injectStyles(){
    if(document.getElementById('helios-stellar-bridge-styles')) return;
    const style=document.createElement('style');
    style.id='helios-stellar-bridge-styles';
    style.textContent=`
      /*
       * EVENT-DECOUPLED STELLAR BRIDGE.
       * This bridge does not react to MODE, SPIN, REEL STOP, CASCADE, PAID WIN or BONUS events.
       * Optional mode camera/tint presentation is owned by helios-mode-flight.js.
       */
      .helios-stellar-canvas{
        transform:none!important;
        transform-origin:50% 50%;
        will-change:opacity;
        transition:opacity 2.4s cubic-bezier(.22,.61,.36,1)!important;
      }

      /* Director may move geometry, but cannot pump exposure/colour. */
      .helios-director-stage,
      body.director-divergence .helios-director-stage,
      body.director-resolution .helios-director-stage{
        filter:none!important;
        box-shadow:none!important;
      }
      .helios-director-stage{
        will-change:transform!important;
        transition:transform .46s cubic-bezier(.2,.76,.22,1)!important;
      }
      body.director-divergence .core,
      body.director-resolution .core{filter:none!important}

      /* Astronomical illumination is game-event-neutral inside this bridge. */
      .cosmos>.sun,.cosmos>.orbit-field{filter:none!important}

      /* Win feedback stays local; no reel-field dimming or whole-panel glow. */
      .reels.win-focus .cell,
      .reels.win-focus .cell.hit,
      .reels.win-focus .cell.cascade-out,
      .reels.win-focus .cell.cascade-in{
        opacity:1!important;
        filter:none!important;
      }
      .cell.hit{transition:border-color .7s ease,box-shadow .7s ease,color .7s ease,transform .18s ease!important}
      .game-panel{transition:box-shadow .7s ease!important}
      .game-panel.win-impact{box-shadow:var(--shadow)!important}
      @keyframes heliosSoftWinPop{0%{transform:scale(.995)}45%{transform:scale(1.012)}100%{transform:none}}
      .last-win-card.win{animation:heliosSoftWinPop .82s cubic-bezier(.22,.61,.36,1)!important}

      /* Dyson follows layout and CPU policy only. No game-event transform pulses. */
      .cosmos>.helios-dyson-sphere{
        transition:left .72s cubic-bezier(.2,.76,.22,1),top .72s cubic-bezier(.2,.76,.22,1),width 1.05s cubic-bezier(.2,.76,.22,1),height 1.05s cubic-bezier(.2,.76,.22,1),opacity 1.15s ease!important;
        transform:translate(-50%,-50%) rotate(-7deg) scale(1)!important;
        transform-origin:50% 50%;
      }
      .cosmos>.helios-dyson-sphere.dyson-active{opacity:.82!important}
      .cosmos>.helios-dyson-sphere.dyson-dormant{opacity:.30!important}
      .cosmos>.helios-dyson-sphere.dyson-dormant,
      .cosmos>.helios-dyson-sphere.dyson-dormant *{animation-play-state:paused!important}

      /* Black hole remains a static accepted geometry baseline. */
      .cosmos>.planet-horizon{bottom:clamp(-328px,-13.8vw,-205px)!important}
      @media(max-width:720px){.cosmos>.planet-horizon{bottom:-250px!important}}

      @media(prefers-reduced-motion:reduce){
        .helios-stellar-canvas{transform:none!important;transition:opacity .35s ease!important}
        .cosmos>.sun,.cosmos>.orbit-field{filter:none!important}
        .cosmos>.helios-dyson-sphere{transition:left .18s ease,top .18s ease,width .18s ease,height .18s ease,opacity .18s ease!important}
        .reels.win-focus .cell,.game-panel,.helios-director-stage{transition-duration:.22s!important}
      }
    `;
    document.head.appendChild(style);
  }

  function resolveNodes(){
    state.cosmos=document.querySelector('.cosmos');
    state.canvas=document.querySelector('.helios-stellar-canvas');
    state.dyson=document.querySelector('.helios-dyson-sphere');
    state.gamePanel=document.getElementById('game-panel');
    state.router=document.querySelector('.hero>.router')||document.querySelector('.router');
    state.cpuInput=document.getElementById('cpu');
    state.computeState=document.getElementById('compute-state');
    return Boolean(state.cosmos&&state.canvas&&state.dyson&&state.gamePanel&&state.router&&state.cpuInput&&state.computeState);
  }

  function readCpuPercent(){
    state.cpuPercent=clamp(Number(state.cpuInput?.value||0),0,100);
    return state.cpuPercent;
  }

  function dysonPolicyScale(){
    if(!state.cpuInput) return 1;
    const min=Number(state.cpuInput.min||0);
    const max=Math.max(min+1,Number(state.cpuInput.max||30));
    const t=clamp((readCpuPercent()-min)/(max-min),0,1);
    return .82+t*.42;
  }

  function syncDysonActivity(){
    if(!state.dyson||!state.computeState) return;
    readCpuPercent();
    const active=state.cpuPercent>0&&state.computeState.textContent.includes('ACTIVE');
    state.computeActive=active;
    state.dyson.classList.toggle('dyson-active',active);
    state.dyson.classList.toggle('dyson-dormant',!active);
    state.dyson.dataset.computeActive=active?'1':'0';
    state.dyson.dataset.cpuPolicyPercent=String(Math.round(state.cpuPercent));
    scheduleAnchor();
  }

  function syncDysonAnchor(){
    state.anchorRaf=0;
    if(!state.dyson||!state.gamePanel||!state.router) return;
    const game=state.gamePanel.getBoundingClientRect();
    const router=state.router.getBoundingClientRect();
    if(!game.width||!game.height||!router.width||!router.height) return;

    const overlapTop=Math.max(game.top,router.top);
    const overlapBottom=Math.min(game.bottom,router.bottom);
    const overlap=Math.max(0,overlapBottom-overlapTop);
    const sideBySide=router.left>=game.right-2&&overlap>Math.min(game.height,router.height)*.45;

    let x,y,size;
    if(sideBySide){
      x=(game.right+router.left)/2;
      y=overlapTop+overlap*.51;
      size=clamp(Math.min(game.height,router.height)*.94,500,720);
    }else{
      x=game.left+game.width/2;
      y=game.top+game.height*.52;
      size=clamp(Math.min(game.width*.92,game.height*.92),360,620);
    }
    size*=dysonPolicyScale();

    state.dyson.style.left=`${x.toFixed(1)}px`;
    state.dyson.style.top=`${y.toFixed(1)}px`;
    state.dyson.style.width=`${size.toFixed(1)}px`;
    state.dyson.style.height=`${size.toFixed(1)}px`;
    state.dyson.dataset.uiAnchor=sideBySide?'BETWEEN_COLUMNS':'STACKED_GAME_CENTER';
  }

  function scheduleAnchor(){
    if(state.anchorRaf) return;
    state.anchorRaf=requestAnimationFrame(syncDysonAnchor);
  }

  function bindComputePolicy(){
    if(!state.cpuInput||!state.computeState) return;
    const onPolicy=()=>{readCpuPercent();scheduleAnchor();syncDysonActivity();};
    state.cpuInput.addEventListener('input',onPolicy,{passive:true});
    state.cpuInput.addEventListener('change',onPolicy,{passive:true});
    state.computeObserver=new MutationObserver(syncDysonActivity);
    state.computeObserver.observe(state.computeState,{childList:true,characterData:true,subtree:true});
    syncDysonActivity();
  }

  function bindLayout(){
    addEventListener('resize',scheduleAnchor,{passive:true});
    addEventListener('scroll',scheduleAnchor,{passive:true});
    if(globalThis.ResizeObserver){
      state.resizeObserver=new ResizeObserver(scheduleAnchor);
      state.resizeObserver.observe(state.gamePanel);
      state.resizeObserver.observe(state.router);
    }
    scheduleAnchor();
  }

  function bindMotionPreference(){
    motionQuery?.addEventListener?.('change',e=>{
      state.reducedMotion=Boolean(e.matches);
      scheduleAnchor();
      syncDysonActivity();
    });
  }

  function loadModeFlight(){
    if(document.getElementById('helios-mode-flight-script')) return;
    const script=document.createElement('script');
    script.id='helios-mode-flight-script';
    script.src='./helios-mode-flight.js?v=1.0.1';
    script.async=false;
    document.head.appendChild(script);
  }

  function attach(){
    if(state.attached) return true;
    injectStyles();
    if(!resolveNodes()) return false;
    state.attached=true;
    state.dyson.dataset.presentationBridge=BRIDGE_VERSION;
    bindLayout();
    bindComputePolicy();
    bindMotionPreference();
    loadModeFlight();
    window.HELIOS_STELLAR_BRIDGE=Object.freeze({
      version:BRIDGE_VERSION,
      getState:()=>({
        version:BRIDGE_VERSION,
        attached:state.attached,
        ui_anchor:state.dyson?.dataset.uiAnchor||'UNRESOLVED',
        reduced_motion:state.reducedMotion,
        cpu_policy_percent:state.cpuPercent,
        dyson_compute_active:state.computeActive,
        ui_palette_transition:'NONE_STATIC_ROOT_THEME',
        camera_mode_flyby:false,
        game_event_reactivity:'NONE',
        global_lighting_mode_coupling:'NONE',
        global_lighting_game_event_coupling:'NONE',
        global_lighting_motion:'NAVIGATOR_AUTONOMOUS_ONLY',
        black_hole_offset:'STATIC_ONE_STEP_LOWER',
        presentation_only:true,
        reads_mode:false,
        reads_spin:false,
        reads_cascade:false,
        reads_win:false,
        reads_bonus:false,
        reads_bet:false,
        reads_balance:false,
        rng_effect:'NONE',
        rtp_effect:'NONE',
        payout_effect:'NONE',
        compute_routing_effect:'NONE'
      })
    });
    dispatchEvent(new CustomEvent('helios:stellar-bridge-ready',{detail:{
      version:BRIDGE_VERSION,
      presentation_only:true,
      ui_bound_dyson:true,
      cpu_policy_scaled_dyson:true,
      compute_gated_dyson_ambient:true,
      mode_camera_flyby:false,
      mode_palette_interpolation:false,
      game_event_reactivity:false,
      global_lighting_mode_coupling:'NONE',
      global_lighting_game_event_coupling:'NONE',
      win_exposure_pumping:false,
      black_hole_static_lower_step:true,
      rng_effect:'NONE',
      rtp_effect:'NONE'
    }}));
    return true;
  }

  function init(){
    if(attach()) return;
    let attempts=0;
    const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);};
    retry();
    window.addEventListener('helios:stellar-ready',()=>attach(),{once:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
