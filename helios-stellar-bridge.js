(() => {
  'use strict';

  const BRIDGE_VERSION = '1.0.3';
  const PALETTE_DURATION_MS = 3200;
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') || null;
  const clamp = (n,min,max) => Math.max(min,Math.min(max,Number(n)||0));
  const lerp = (a,b,t) => a+(b-a)*t;

  const CAMERA = Object.freeze({
    helios:{x:0,y:0,rotate:0,scale:1.055},
    divine:{x:-42,y:18,rotate:-1.15,scale:1.072},
    gridjack:{x:38,y:-14,rotate:1.05,scale:1.068},
    custom:{x:-28,y:-24,rotate:.78,scale:1.076}
  });

  // Mode colour is an interface accent only. Global illumination is intentionally mode-neutral.
  const PALETTES = Object.freeze({
    helios:{mode:[255,194,75],soft:[255,194,75,.125]},
    divine:{mode:[121,223,255],soft:[121,223,255,.141]},
    gridjack:{mode:[149,255,154],soft:[149,255,154,.125]},
    custom:{mode:[201,152,255],soft:[201,152,255,.125]}
  });

  const clonePalette = p => ({mode:[...p.mode],soft:[...p.soft]});
  const mixArray = (a,b,t) => a.map((v,i)=>lerp(v,b[i],t));
  const rgba = a => `rgba(${Math.round(a[0])},${Math.round(a[1])},${Math.round(a[2])},${Number(a[3]??1).toFixed(4)})`;
  const rgb = a => `rgb(${Math.round(a[0])},${Math.round(a[1])},${Math.round(a[2])})`;
  const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;

  const initialMode = document.body.dataset.gameMode||'helios';
  const state = {
    attached:false,
    reducedMotion:Boolean(motionQuery?.matches),
    cosmos:null,
    canvas:null,
    dyson:null,
    gamePanel:null,
    router:null,
    reels:null,
    cpuInput:null,
    computeState:null,
    resizeObserver:null,
    mutationObserver:null,
    modeObserver:null,
    computeObserver:null,
    anchorRaf:0,
    paletteRaf:0,
    paletteStart:0,
    paletteFrom:clonePalette(PALETTES[initialMode]||PALETTES.helios),
    paletteCurrent:clonePalette(PALETTES[initialMode]||PALETTES.helios),
    paletteTarget:clonePalette(PALETTES[initialMode]||PALETTES.helios),
    pulseTimer:0,
    spinning:false,
    reelStopState:new WeakMap(),
    dysonAngle:0,
    dysonScale:1,
    cpuPercent:0,
    computeActive:false,
    mode:initialMode
  };

  function injectStyles(){
    if(document.getElementById('helios-stellar-bridge-styles')) return;
    const style=document.createElement('style');
    style.id='helios-stellar-bridge-styles';
    style.textContent=`
      /* Camera motion is presentation-only and never changes outcome timing. */
      .helios-stellar-canvas{
        transform-origin:50% 50%;
        will-change:transform,opacity;
        transition:opacity 2.4s cubic-bezier(.22,.61,.36,1),transform 2.8s cubic-bezier(.16,.78,.22,1)!important;
      }

      /* Director owns geometry/narrative only. No exposure, contrast, core-light or shadow pumping. */
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

      /*
       * SINGLE LIGHT AUTHORITY:
       * modes do not touch astronomical illumination at all.
       * Sun/orbit motion is a long-period autonomous ambient cycle, so changing mode cannot restart
       * or snap hue/brightness. These animations override the old polish mode selectors without
       * changing planet geometry.
       */
      .cosmos.stellar-active>.sun{
        animation:helios-bridge-sun-ambient 32s ease-in-out -5s infinite alternate!important;
        transition:none!important;
      }
      .cosmos.stellar-active>.orbit-field{
        animation:helios-bridge-orbit-ambient 39s ease-in-out -11s infinite alternate!important;
        transition:none!important;
      }
      @keyframes helios-bridge-sun-ambient{
        0%{filter:hue-rotate(-1deg) saturate(.995) brightness(.992)}
        46%{filter:hue-rotate(1.4deg) saturate(1.012) brightness(1.010)}
        100%{filter:hue-rotate(-.7deg) saturate(1.002) brightness(.998)}
      }
      @keyframes helios-bridge-orbit-ambient{
        0%{filter:hue-rotate(-1deg) saturate(.995) brightness(.997);box-shadow:inset 0 0 78px rgba(255,177,61,.035)}
        52%{filter:hue-rotate(1.2deg) saturate(1.012) brightness(1.006);box-shadow:inset 0 0 86px rgba(144,183,222,.045)}
        100%{filter:hue-rotate(-.6deg) saturate(1.002) brightness(.999);box-shadow:inset 0 0 80px rgba(255,177,61,.032)}
      }

      /* Win feedback is local only; no whole-machine exposure shifts. */
      .reels.win-focus .cell{
        opacity:.76!important;
        filter:none!important;
        transition:opacity 1.25s cubic-bezier(.22,.61,.36,1),box-shadow .9s ease,border-color .9s ease,color .9s ease!important;
      }
      .reels.win-focus .cell.hit{opacity:1!important;filter:none!important}
      .reels.win-focus .cell.cascade-out,.reels.win-focus .cell.cascade-in{opacity:1!important;filter:none!important}
      .cell.hit{transition:border-color .9s ease,box-shadow .9s ease,color .9s ease,transform .18s ease!important}
      .energy-step,.mode-btn,.route,.reels{transition:border-color .9s ease,box-shadow .9s ease,color .9s ease,background-color .9s ease!important}
      .game-panel{transition:box-shadow .9s ease!important}
      .game-panel.win-impact{box-shadow:var(--shadow)!important}
      @keyframes heliosSoftWinPop{0%{transform:scale(.995)}45%{transform:scale(1.012)}100%{transform:none}}
      .last-win-card.win{animation:heliosSoftWinPop .82s cubic-bezier(.22,.61,.36,1)!important}
      .helios-overlay{transition:opacity .55s cubic-bezier(.22,.61,.36,1)!important}
      .helios-overlay-card{transition:transform .55s cubic-bezier(.22,.61,.36,1),box-shadow .9s ease!important}

      /* Dyson follows actual UI geometry; CPU policy controls its physical presentation size. */
      .cosmos>.helios-dyson-sphere{
        transition:left .72s cubic-bezier(.2,.76,.22,1),top .72s cubic-bezier(.2,.76,.22,1),width 1.05s cubic-bezier(.2,.76,.22,1),height 1.05s cubic-bezier(.2,.76,.22,1),transform .72s cubic-bezier(.14,.82,.25,1),opacity 1.15s ease!important;
        transform-origin:50% 50%;
      }
      .cosmos>.helios-dyson-sphere.dyson-active{opacity:.82!important}
      .cosmos>.helios-dyson-sphere.dyson-dormant{opacity:.30!important}
      .cosmos>.helios-dyson-sphere.dyson-dormant,
      .cosmos>.helios-dyson-sphere.dyson-dormant *{animation-play-state:paused!important}

      /* Black-hole geometry remains the approved one-step-lower static baseline. */
      .cosmos>.planet-horizon{bottom:clamp(-328px,-13.8vw,-205px)!important}
      @media(max-width:720px){.cosmos>.planet-horizon{bottom:-250px!important}}

      @media(prefers-reduced-motion:reduce){
        .helios-stellar-canvas{transform:none!important;transition:opacity .35s ease!important}
        .cosmos.stellar-active>.sun,.cosmos.stellar-active>.orbit-field{animation:none!important;filter:none!important}
        .cosmos>.orbit-field{box-shadow:inset 0 0 82px rgba(255,177,61,.035)!important}
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
    state.reels=document.getElementById('reels');
    state.cpuInput=document.getElementById('cpu');
    state.computeState=document.getElementById('compute-state');
    return Boolean(state.cosmos&&state.canvas&&state.dyson&&state.gamePanel&&state.router&&state.reels&&state.cpuInput&&state.computeState);
  }

  function writePalette(p){
    // Only interface accent colours are mode-coupled. Astronomical light is not.
    const body=document.body;
    body.style.setProperty('--mode',rgb(p.mode));
    body.style.setProperty('--mode-soft',rgba(p.soft));
  }

  function paletteFrame(now){
    state.paletteRaf=0;
    const duration=state.reducedMotion?160:PALETTE_DURATION_MS;
    const t=clamp((now-state.paletteStart)/duration,0,1);
    const e=ease(t);
    state.paletteCurrent={
      mode:mixArray(state.paletteFrom.mode,state.paletteTarget.mode,e),
      soft:mixArray(state.paletteFrom.soft,state.paletteTarget.soft,e)
    };
    writePalette(state.paletteCurrent);
    if(t<1) state.paletteRaf=requestAnimationFrame(paletteFrame);
  }

  function transitionPalette(mode,{initial=false}={}){
    const target=PALETTES[mode]||PALETTES.helios;
    cancelAnimationFrame(state.paletteRaf);
    state.paletteRaf=0;
    state.paletteFrom=clonePalette(state.paletteCurrent);
    state.paletteTarget=clonePalette(target);
    if(initial||state.reducedMotion){
      state.paletteCurrent=clonePalette(target);
      writePalette(state.paletteCurrent);
      return;
    }
    state.paletteStart=performance.now();
    state.paletteRaf=requestAnimationFrame(paletteFrame);
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
    if(!active){
      clearTimeout(state.pulseTimer);
      state.dysonScale=1;
      renderDysonTransform();
    }
    scheduleAnchor();
  }

  function renderDysonTransform(){
    const sphere=state.dyson;
    if(!sphere) return;
    const angle=(state.reducedMotion||!state.computeActive)?0:state.dysonAngle;
    const scale=(state.reducedMotion||!state.computeActive)?1:state.dysonScale;
    sphere.style.transform=`translate(-50%,-50%) rotate(${(-7+angle).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  function pulseDyson(angleDelta=8,pulse=.01,holdMs=180){
    if(state.reducedMotion||!state.computeActive||!state.dyson) return;
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
    size*=dysonPolicyScale();

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
    if(state.reducedMotion){state.canvas.style.transform='none';return;}
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
      transitionPalette(next);
      applyCamera(next);
    });
    state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
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

  function bindPresentationEvents(){
    window.addEventListener('helios:cascade',e=>{
      const multiplier=Number(e.detail?.multiplier||1);
      const step=multiplier>=64?30:multiplier>=16?24:multiplier>=4?18:14;
      pulseDyson(step,multiplier>=16?.026:.018,230);
    });
    window.addEventListener('helios:spin-complete',e=>{if(Number(e.detail?.spin_win||0)>0)pulseDyson(28,.035,330);});
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
      if(state.reducedMotion)state.dysonAngle=0;
      transitionPalette(document.body.dataset.gameMode||'helios',{initial:true});
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
    transitionPalette(document.body.dataset.gameMode||'helios',{initial:true});
    bindLayout();
    bindComputePolicy();
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
        cpu_policy_percent:state.cpuPercent,
        dyson_compute_active:state.computeActive,
        dyson_angle_deg:state.dysonAngle,
        ui_palette_transition:'REQUEST_ANIMATION_FRAME_RGB_INTERPOLATION',
        palette_duration_ms:PALETTE_DURATION_MS,
        global_lighting_mode_coupling:'NONE',
        global_lighting_motion:'AUTONOMOUS_CONTINUOUS_AMBIENT_ONLY',
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
    dispatchEvent(new CustomEvent('helios:stellar-bridge-ready',{detail:{version:BRIDGE_VERSION,presentation_only:true,ui_bound_dyson:true,cpu_policy_scaled_dyson:true,compute_gated_dyson_motion:true,mode_camera_flyby:true,raf_ui_palette_interpolation:true,global_lighting_mode_coupling:'NONE',autonomous_ambient_lighting:true,win_exposure_pumping:false,black_hole_static_lower_step:true,rng_effect:'NONE',rtp_effect:'NONE'}}));
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