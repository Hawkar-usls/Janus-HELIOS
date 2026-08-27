(() => {
  'use strict';

  const BRIDGE_VERSION = '1.0.1';
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') || null;
  const clamp = (n,min,max) => Math.max(min,Math.min(max,Number(n)||0));

  const CAMERA = Object.freeze({
    helios:{x:0,y:0,rotate:0,scale:1.055},
    divine:{x:-42,y:18,rotate:-1.15,scale:1.072},
    gridjack:{x:38,y:-14,rotate:1.05,scale:1.068},
    custom:{x:-28,y:-24,rotate:.78,scale:1.076}
  });

  const state = {
    attached:false,
    reducedMotion:Boolean(motionQuery?.matches),
    cosmos:null,
    canvas:null,
    dyson:null,
    gamePanel:null,
    router:null,
    reels:null,
    resizeObserver:null,
    mutationObserver:null,
    modeObserver:null,
    anchorRaf:0,
    pulseTimer:0,
    spinning:false,
    reelStopState:new WeakMap(),
    dysonAngle:0,
    dysonScale:1,
    mode:document.body.dataset.gameMode||'helios'
  };

  function injectStyles(){
    if(document.getElementById('helios-stellar-bridge-styles')) return;
    const style=document.createElement('style');
    style.id='helios-stellar-bridge-styles';
    style.textContent=`
      @property --mode{syntax:'<color>';inherits:true;initial-value:#ffc24b}
      @property --mode-soft{syntax:'<color>';inherits:true;initial-value:#ffc24b20}
      @property --helios-ambient-hue{syntax:'<number>';inherits:true;initial-value:0}
      @property --helios-ambient-sat{syntax:'<number>';inherits:true;initial-value:1}
      @property --helios-ambient-bright{syntax:'<number>';inherits:true;initial-value:1}
      @property --helios-orbit-glow{syntax:'<color>';inherits:true;initial-value:#ffb13d08}

      /* Registered presentation variables interpolate instead of snapping when a mode changes. */
      body{
        --helios-ambient-hue:0;
        --helios-ambient-sat:1;
        --helios-ambient-bright:1;
        --helios-orbit-glow:#ffb13d08;
        transition:
          --mode 2.65s cubic-bezier(.22,.61,.36,1),
          --mode-soft 2.65s cubic-bezier(.22,.61,.36,1),
          --helios-ambient-hue 3.1s cubic-bezier(.22,.61,.36,1),
          --helios-ambient-sat 3.1s cubic-bezier(.22,.61,.36,1),
          --helios-ambient-bright 3.1s cubic-bezier(.22,.61,.36,1),
          --helios-orbit-glow 3.1s cubic-bezier(.22,.61,.36,1);
      }
      body[data-game-mode="helios"]{--mode:#ffc24b;--mode-soft:#ffc24b20;--helios-ambient-hue:0;--helios-ambient-sat:1;--helios-ambient-bright:1;--helios-orbit-glow:#ffb13d08}
      body[data-game-mode="divine"]{--mode:#79dfff;--mode-soft:#79dfff24;--helios-ambient-hue:12;--helios-ambient-sat:.992;--helios-ambient-bright:1.004;--helios-orbit-glow:#79dfff10}
      body[data-game-mode="gridjack"]{--mode:#95ff9a;--mode-soft:#95ff9a20;--helios-ambient-hue:-4;--helios-ambient-sat:1.008;--helios-ambient-bright:1.002;--helios-orbit-glow:#95ff9a0d}
      body[data-game-mode="custom"]{--mode:#c998ff;--mode-soft:#c998ff20;--helios-ambient-hue:-9;--helios-ambient-sat:.996;--helios-ambient-bright:.999;--helios-orbit-glow:#c998ff10}

      /* The bridge never changes game outcome/RTP/compute state. It owns only presentation easing. */
      .helios-stellar-canvas{
        transform-origin:50% 50%;
        will-change:transform,opacity;
        transition:opacity 2.4s cubic-bezier(.22,.61,.36,1),transform 2.8s cubic-bezier(.16,.78,.22,1)!important;
      }

      /* Director keeps geometry/narrative, but exposure pumping is removed completely. */
      .helios-director-stage{
        will-change:transform,box-shadow!important;
        box-shadow:0 0 0 rgba(0,0,0,0);
        transition:transform .42s cubic-bezier(.2,.76,.22,1),box-shadow 1.05s cubic-bezier(.22,.61,.36,1)!important;
      }
      body.director-divergence .helios-director-stage,
      body.director-resolution .helios-director-stage{
        filter:none!important;
        box-shadow:0 0 calc(4px + var(--director-l)*8px) var(--mode-soft)!important;
      }

      /* One source of truth for atmospheric colour: registered variables, not instant filter swaps. */
      .cosmos>.sun{
        filter:hue-rotate(calc(var(--helios-ambient-hue)*1deg)) saturate(var(--helios-ambient-sat)) brightness(var(--helios-ambient-bright))!important;
        transition:none!important;
      }
      .cosmos>.orbit-field{
        filter:none!important;
        box-shadow:inset 0 0 82px var(--helios-orbit-glow)!important;
        transition:none!important;
      }

      /* Paid-win focus is still readable, but no longer flashes the reels from bright to dark in 160 ms. */
      .reels.win-focus .cell{
        opacity:.48!important;
        filter:saturate(.82) brightness(.90)!important;
        transition:opacity .82s cubic-bezier(.22,.61,.36,1),filter .92s cubic-bezier(.22,.61,.36,1),transform .28s ease,box-shadow .82s ease,border-color .82s ease,color .82s ease!important;
      }
      .reels.win-focus .cell.hit{opacity:1!important;filter:none!important}
      .reels.win-focus .cell.cascade-out,.reels.win-focus .cell.cascade-in{opacity:1!important;filter:none!important}
      .cell,.energy-step,.last-win-card,.mode-btn,.route,.reels{
        transition-property:opacity,filter,transform,box-shadow,border-color,color,background-color!important;
        transition-duration:.72s!important;
        transition-timing-function:cubic-bezier(.22,.61,.36,1)!important;
      }
      .game-panel{transition:box-shadow 1.1s cubic-bezier(.22,.61,.36,1)!important}
      .game-panel.win-impact{box-shadow:0 0 0 1px #8f6b2a99,0 0 28px #ffc95c18,var(--shadow)!important}

      /* Dyson coordinates are supplied from actual UI geometry, not viewport percentages. */
      .cosmos>.helios-dyson-sphere{
        transition:left .72s cubic-bezier(.2,.76,.22,1),top .72s cubic-bezier(.2,.76,.22,1),width .78s cubic-bezier(.2,.76,.22,1),height .78s cubic-bezier(.2,.76,.22,1),transform .72s cubic-bezier(.14,.82,.25,1),opacity 1.1s ease!important;
        transform-origin:50% 50%;
      }

      /* Static baseline trim only: one small step lower, with size/aspect untouched. */
      .cosmos>.planet-horizon{bottom:clamp(-328px,-13.8vw,-205px)!important}

      @media(max-width:720px){
        .cosmos>.planet-horizon{bottom:-250px!important}
      }

      @media(prefers-reduced-motion:reduce){
        body{transition:none!important}
        .helios-stellar-canvas{transform:none!important;transition:opacity .35s ease!important}
        .cosmos>.helios-dyson-sphere{transition:left .18s ease,top .18s ease,width .18s ease,height .18s ease!important}
        .reels.win-focus .cell{transition-duration:.22s!important}
        .game-panel,.helios-director-stage{transition-duration:.22s!important}
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
    state.reels=document.getElementById('reels');
    return Boolean(state.cosmos&&state.canvas&&state.dyson&&state.gamePanel&&state.router&&state.reels);
  }

  function renderDysonTransform(){
    const sphere=state.dyson;
    if(!sphere) return;
    const angle=state.reducedMotion?0:state.dysonAngle;
    const scale=state.reducedMotion?1:state.dysonScale;
    sphere.style.transform=`translate(-50%,-50%) rotate(${(-7+angle).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  function pulseDyson(angleDelta=8,pulse=.01,holdMs=180){
    if(state.reducedMotion||!state.dyson) return;
    state.dysonAngle=(state.dysonAngle+angleDelta)%360;
    state.dysonScale=1+clamp(pulse,0,.05);
    renderDysonTransform();
    clearTimeout(state.pulseTimer);
    state.pulseTimer=setTimeout(()=>{
      state.dysonScale=1;
      renderDysonTransform();
    },Math.max(90,holdMs));
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

    state.dyson.style.left=`${x.toFixed(1)}px`;
    state.dyson.style.top=`${y.toFixed(1)}px`;
    state.dyson.style.width=`${size.toFixed(1)}px`;
    state.dyson.style.height=`${size.toFixed(1)}px`;
    state.dyson.dataset.uiAnchor=sideBySide?'BETWEEN_COLUMNS':'STACKED_GAME_CENTER';
    renderDysonTransform();
  }

  function scheduleAnchor(){
    if(state.anchorRaf) return;
    state.anchorRaf=requestAnimationFrame(syncDysonAnchor);
  }

  function applyCamera(mode,{initial=false}={}){
    state.mode=CAMERA[mode]?mode:'helios';
    if(!state.canvas) return;
    if(state.reducedMotion){
      state.canvas.style.transform='none';
      return;
    }
    const cue=CAMERA[state.mode];
    if(initial){
      const previous=state.canvas.style.transition;
      state.canvas.style.transition='none';
      state.canvas.style.transform=`translate3d(${cue.x}px,${cue.y}px,0) scale(${cue.scale}) rotate(${cue.rotate}deg)`;
      void state.canvas.offsetWidth;
      state.canvas.style.transition=previous;
      return;
    }
    state.canvas.style.transform=`translate3d(${cue.x}px,${cue.y}px,0) scale(${cue.scale}) rotate(${cue.rotate}deg)`;
    pulseDyson(34,.018,260);
  }

  function scanReelMotion(){
    if(!state.reels) return;
    const spinning=state.reels.classList.contains('spinning');
    if(spinning&&!state.spinning) pulseDyson(12,.014,170);
    state.spinning=spinning;

    for(const reel of state.reels.querySelectorAll('.reel')){
      const stopped=reel.classList.contains('reel-stop');
      const previous=state.reelStopState.get(reel)||false;
      if(stopped&&!previous) pulseDyson(7,.008,130);
      state.reelStopState.set(reel,stopped);
    }
  }

  function bindReels(){
    if(!state.reels||state.mutationObserver) return;
    state.mutationObserver=new MutationObserver(scanReelMotion);
    state.mutationObserver.observe(state.reels,{subtree:true,attributes:true,attributeFilter:['class']});
    scanReelMotion();
  }

  function bindMode(){
    if(state.modeObserver) return;
    let previous=document.body.dataset.gameMode||'helios';
    state.modeObserver=new MutationObserver(()=>{
      const next=document.body.dataset.gameMode||'helios';
      if(next===previous) return;
      previous=next;
      applyCamera(next);
    });
    state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
  }

  function bindPresentationEvents(){
    window.addEventListener('helios:cascade',e=>{
      const multiplier=Number(e.detail?.multiplier||1);
      const step=multiplier>=64?30:multiplier>=16?24:multiplier>=4?18:14;
      pulseDyson(step,multiplier>=16?.026:.018,230);
    });
    window.addEventListener('helios:spin-complete',e=>{
      if(Number(e.detail?.spin_win||0)>0) pulseDyson(28,.035,330);
    });
    window.addEventListener('helios:bonus-wheel-start',()=>pulseDyson(36,.028,300));
    window.addEventListener('helios:bonus-session-start',()=>pulseDyson(42,.032,330));
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
      state.dysonScale=1;
      if(state.reducedMotion) state.dysonAngle=0;
      renderDysonTransform();
      applyCamera(document.body.dataset.gameMode||'helios',{initial:true});
    });
  }

  function attach(){
    if(state.attached) return true;
    injectStyles();
    if(!resolveNodes()) return false;
    state.attached=true;
    state.dyson.dataset.presentationBridge=BRIDGE_VERSION;
    bindLayout();
    bindReels();
    bindMode();
    bindPresentationEvents();
    bindMotionPreference();
    applyCamera(document.body.dataset.gameMode||'helios',{initial:true});
    renderDysonTransform();
    window.HELIOS_STELLAR_BRIDGE=Object.freeze({
      version:BRIDGE_VERSION,
      getState:()=>({
        version:BRIDGE_VERSION,
        attached:state.attached,
        ui_anchor:state.dyson?.dataset.uiAnchor||'UNRESOLVED',
        mode:state.mode,
        reduced_motion:state.reducedMotion,
        dyson_angle_deg:state.dysonAngle,
        palette_transition:'REGISTERED_INTERPOLATED_CUSTOM_PROPERTIES',
        black_hole_offset:'STATIC_ONE_STEP_LOWER',
        presentation_only:true,
        reads_bet:false,
        reads_balance:false,
        rng_effect:'NONE',
        rtp_effect:'NONE',
        payout_effect:'NONE',
        compute_routing_effect:'NONE'
      })
    });
    dispatchEvent(new CustomEvent('helios:stellar-bridge-ready',{detail:{version:BRIDGE_VERSION,presentation_only:true,ui_bound_dyson:true,mode_camera_flyby:true,registered_palette_interpolation:true,win_focus_smoothed:true,black_hole_static_lower_step:true,abrupt_contrast_pumping:false,rng_effect:'NONE',rtp_effect:'NONE'}}));
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
