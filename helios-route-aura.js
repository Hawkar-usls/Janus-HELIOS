(() => {
  'use strict';

  const VERSION='1.2.0';
  const ROUTE_KEY_TO_SHORT=Object.freeze({market:'MARKET',science:'SCIENCE',jackpot:'TREASURY',datacenter:'DC',operator:'OPERATOR',custom:'CUSTOM'});
  const MODE_FALLBACK=Object.freeze({
    helios:Object.freeze({primary:'#ffc24b',secondary:'#ff8d2a',tertiary:'#f2a13a'}),
    divine:Object.freeze({primary:'#d7a7ff',secondary:'#80d7ff',tertiary:'#aaafff'}),
    gridjack:Object.freeze({primary:'#95ff9a',secondary:'#58e6ff',tertiary:'#72f6c9'}),
    custom:Object.freeze({primary:'#80d7ff',secondary:'#a78bfa',tertiary:'#91b3fc'})
  });

  const state={
    attached:false,reels:null,gamePanel:null,routeGrid:null,selectedRoute:null,computeState:null,
    mode:'helios',route:'MARKET',sessionSeed:0,streaming:false,palette:{...MODE_FALLBACK.helios},
    resource:{cpu_percent:15,gpu_percent:0,cpu_max_percent:30,gpu_max_percent:80,visual_envelope_ratio:.175,max_policy:false,resource_class:'CPU'},
    observer:null,modeObserver:null,computeObserver:null,sparkTimer:null,sparkCounter:0,reducedMotion:Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
  };

  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function hash32(x){x|=0;x=x+0x7ed55d16+(x<<12);x=x^0xc761c23c^(x>>>19);x=x+0x165667b1+(x<<5);x=x+0xd3a2646c^(x<<9);x=x+0xfd7046c5+(x<<3);x=x^0xb55a4f09^(x>>>16);return x>>>0;}
  function textHash(text){let h=2166136261>>>0;for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
  function unit(salt=0){return hash32((state.sessionSeed^textHash(state.mode)^textHash(state.route)^salt)>>>0)/0xffffffff;}
  function hexRgb(hex){const raw=String(hex).replace('#','');const n=parseInt(raw.length===3?raw.split('').map(x=>x+x).join(''):raw,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function rgba(hex,a){const c=hexRgb(hex);return `rgba(${c.r},${c.g},${c.b},${clamp(a,0,1).toFixed(3)})`;}
  function validHex(value){return /^#[0-9a-f]{6}$/i.test(String(value||''));}

  function activeRouteShort(){
    const active=state.routeGrid?.querySelector('.route.active[data-route]');
    const fromKey=active?.dataset.route&&ROUTE_KEY_TO_SHORT[active.dataset.route];
    const fromText=state.selectedRoute?.textContent?.trim().toUpperCase();
    return fromKey||fromText||'MARKET';
  }

  function readForgePalette(){
    const forge=window.HELIOS_REEL_FORGE?.getState?.();
    const p=forge?.profile;
    if(p&&validHex(p.mix)&&validHex(p.secondary)){
      state.sessionSeed=Number(forge.session_seed||state.sessionSeed)>>>0;
      state.palette={primary:p.mix,secondary:p.secondary,tertiary:validHex(p.tertiary)?p.tertiary:p.secondary};
      return true;
    }
    const styles=state.reels?getComputedStyle(state.reels):null;
    const primary=styles?.getPropertyValue('--forge-accent-solid')?.trim();
    const secondary=styles?.getPropertyValue('--forge-secondary-solid')?.trim();
    const tertiary=styles?.getPropertyValue('--forge-tertiary-solid')?.trim();
    if(validHex(primary)&&validHex(secondary)){
      state.palette={primary,secondary,tertiary:validHex(tertiary)?tertiary:secondary};
      return true;
    }
    state.palette={...(MODE_FALLBACK[state.mode]||MODE_FALLBACK.helios)};
    return false;
  }

  function readResourcePolicy(){
    const p=window.HELIOS_RESOURCE_POLICY?.getState?.();
    if(p){
      state.resource={
        cpu_percent:Number(p.cpu_percent||0),gpu_percent:Number(p.gpu_percent||0),
        cpu_max_percent:Number(p.cpu_max_percent||30),gpu_max_percent:Number(p.gpu_max_percent||80),
        visual_envelope_ratio:clamp(p.visual_envelope_ratio,0,1),max_policy:Boolean(p.max_policy),resource_class:String(p.resource_class||'IDLE')
      };
      return true;
    }
    const cpu=document.getElementById('cpu'),gpu=document.getElementById('gpu');
    const cpuValue=Number(cpu?.value||0),gpuValue=Number(gpu?.value||0),cpuMax=Math.max(1,Number(cpu?.max||30)),gpuMax=Math.max(1,Number(gpu?.max||80));
    const cpuRatio=clamp(cpuValue/cpuMax,0,1),gpuRatio=clamp(gpuValue/gpuMax,0,1);
    state.resource={cpu_percent:cpuValue,gpu_percent:gpuValue,cpu_max_percent:cpuMax,gpu_max_percent:gpuMax,visual_envelope_ratio:clamp(cpuRatio*.35+gpuRatio*.65,0,1),max_policy:cpuValue===cpuMax&&gpuValue===gpuMax,resource_class:cpuValue>0&&gpuValue>0?'HYBRID':gpuValue>0?'GPU':cpuValue>0?'CPU':'IDLE'};
    return false;
  }

  function injectStyles(){
    if(document.getElementById('helios-route-aura-styles')) return;
    const style=document.createElement('style');
    style.id='helios-route-aura-styles';
    style.textContent=`
      @property --route-aura-low{syntax:"<color>";inherits:true;initial-value:rgba(255,194,75,.10)}
      @property --route-aura-high{syntax:"<color>";inherits:true;initial-value:rgba(255,141,42,.18)}
      @property --route-aura-spectrum{syntax:"<color>";inherits:true;initial-value:rgba(242,161,58,.12)}
      @property --route-aura-border{syntax:"<color>";inherits:true;initial-value:rgba(255,194,75,.24)}
      .reels.route-aura-v1{
        --route-aura-breath:5.8s;--route-aura-r1:18px;--route-aura-r2:34px;--route-aura-r3:52px;
        transition:--route-aura-low .7s ease,--route-aura-high .7s ease,--route-aura-spectrum .7s ease,--route-aura-border .7s ease,border-color .7s ease,box-shadow .7s ease;
        border-color:var(--route-aura-border)!important;
        animation:heliosRouteAuraBreath var(--route-aura-breath) ease-in-out infinite;
      }
      .reels.route-aura-v1.route-aura-streaming{animation-name:heliosRouteAuraStreaming}
      @keyframes heliosRouteAuraBreath{
        0%,100%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 var(--route-aura-r1) var(--route-aura-low),0 0 var(--route-aura-r2) var(--route-aura-spectrum),0 0 var(--route-aura-r3) transparent}
        50%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 var(--route-aura-r1) var(--route-aura-high),0 0 var(--route-aura-r2) var(--route-aura-low),0 0 var(--route-aura-r3) var(--route-aura-spectrum)}
      }
      @keyframes heliosRouteAuraStreaming{
        0%,100%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 var(--route-aura-r1) var(--route-aura-high),0 0 var(--route-aura-r2) var(--route-aura-spectrum),0 0 var(--route-aura-r3) var(--route-aura-low)}
        50%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 calc(var(--route-aura-r1) + 7px) var(--route-aura-high),0 0 calc(var(--route-aura-r2) + 10px) var(--route-aura-low),0 0 calc(var(--route-aura-r3) + 14px) var(--route-aura-spectrum)}
      }
      .helios-route-aura-spark{position:absolute;z-index:12;width:3px;height:3px;border-radius:50%;pointer-events:none;background:var(--spark-color);box-shadow:0 0 5px var(--spark-color),0 0 11px var(--spark-color);transform:translate(-50%,-50%);animation:heliosRouteAuraSpark .72s cubic-bezier(.18,.67,.31,1) forwards}
      @keyframes heliosRouteAuraSpark{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}18%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--spark-dx)),calc(-50% + var(--spark-dy))) scale(.08)}}
      @media(prefers-reduced-motion:reduce){.reels.route-aura-v1{animation:none!important;box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 var(--route-aura-r1) var(--route-aura-low),0 0 var(--route-aura-r2) var(--route-aura-spectrum)!important}.helios-route-aura-spark{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function shouldSpark(){return state.streaming&&state.resource.max_policy&&!state.reducedMotion;}

  function emitSpark(){
    if(!shouldSpark()||!state.gamePanel||!state.reels) return;
    const panel=state.gamePanel.getBoundingClientRect(),box=state.reels.getBoundingClientRect();
    if(!panel.width||!box.width) return;
    const n=hash32((state.sessionSeed^Math.imul(++state.sparkCounter,0x9e3779b1))>>>0),edge=n%4,t=((n>>>4)%1000)/999;
    let x,y,dx,dy;
    if(edge===0){x=box.left-panel.left+box.width*t;y=box.top-panel.top-2;dx=(t-.5)*18;dy=-18-((n>>>14)%18);}
    else if(edge===1){x=box.right-panel.left+2;y=box.top-panel.top+box.height*t;dx=18+((n>>>14)%18);dy=(t-.5)*18;}
    else if(edge===2){x=box.left-panel.left+box.width*t;y=box.bottom-panel.top+2;dx=(t-.5)*18;dy=18+((n>>>14)%18);}
    else{x=box.left-panel.left-2;y=box.top-panel.top+box.height*t;dx=-18-((n>>>14)%18);dy=(t-.5)*18;}
    const colors=[state.palette.primary,state.palette.secondary,state.palette.tertiary],color=colors[(n>>>10)%colors.length];
    const spark=document.createElement('i');spark.className='helios-route-aura-spark';spark.style.left=`${x.toFixed(1)}px`;spark.style.top=`${y.toFixed(1)}px`;spark.style.setProperty('--spark-dx',`${dx.toFixed(1)}px`);spark.style.setProperty('--spark-dy',`${dy.toFixed(1)}px`);spark.style.setProperty('--spark-color',color);state.gamePanel.appendChild(spark);setTimeout(()=>spark.remove(),760);
  }

  function syncSparkTimer(){
    if(shouldSpark()&&!state.sparkTimer){state.sparkTimer=setInterval(()=>{emitSpark();if((state.sparkCounter&3)===0)setTimeout(emitSpark,110);},430);emitSpark();}
    else if(!shouldSpark()&&state.sparkTimer){clearInterval(state.sparkTimer);state.sparkTimer=null;}
  }

  function applyProfile(){
    if(!state.reels) return;
    state.mode=document.body.dataset.gameMode||'helios';state.route=activeRouteShort();state.streaming=Boolean(state.computeState?.textContent?.includes('ACTIVE'));
    readForgePalette();readResourcePolicy();
    const {primary,secondary,tertiary}=state.palette,intensity=clamp(state.resource.visual_envelope_ratio,0,1),stream=state.streaming?1:0;
    const lowAlpha=.055+intensity*.105+stream*.025+unit(21)*.025;
    const highAlpha=.095+intensity*.175+stream*.045+unit(31)*.035;
    const spectrumAlpha=.065+intensity*.135+stream*.03+unit(37)*.03;
    const borderAlpha=.19+intensity*.24+stream*.055+unit(41)*.045;
    const breath=(6.4-intensity*1.85+unit(51)*1.35).toFixed(2)+'s';
    const r1=(13+intensity*16+stream*3).toFixed(1)+'px',r2=(25+intensity*26+stream*5).toFixed(1)+'px',r3=(38+intensity*37+stream*8).toFixed(1)+'px';
    state.reels.classList.add('route-aura-v1');state.reels.classList.toggle('route-aura-streaming',state.streaming);state.reels.classList.toggle('route-aura-max-policy',state.resource.max_policy);
    state.reels.dataset.routeAura=state.route;state.reels.dataset.routeAuraMode=state.mode;state.reels.dataset.routeAuraPalette='REEL_FORGE';state.reels.dataset.routeAuraResourceClass=state.resource.resource_class;
    state.reels.style.setProperty('--route-aura-low',rgba(primary,lowAlpha));state.reels.style.setProperty('--route-aura-high',rgba(secondary,highAlpha));state.reels.style.setProperty('--route-aura-spectrum',rgba(tertiary,spectrumAlpha));state.reels.style.setProperty('--route-aura-border',rgba(primary,borderAlpha));state.reels.style.setProperty('--route-aura-breath',breath);state.reels.style.setProperty('--route-aura-r1',r1);state.reels.style.setProperty('--route-aura-r2',r2);state.reels.style.setProperty('--route-aura-r3',r3);
    syncSparkTimer();
  }

  function onForgeProfile(e){
    const d=e.detail||{},p=d.palette||{};if(validHex(p.primary)&&validHex(p.secondary))state.palette={primary:p.primary,secondary:p.secondary,tertiary:validHex(p.tertiary)?p.tertiary:p.secondary};const seed=Number(d.session_seed);if(Number.isFinite(seed)&&seed>=0)state.sessionSeed=seed>>>0;applyProfile();
  }
  function onResourcePolicy(e){const d=e.detail||{};state.resource={...state.resource,...d,visual_envelope_ratio:clamp(d.visual_envelope_ratio,0,1),max_policy:Boolean(d.max_policy)};applyProfile();}

  function bind(){
    state.observer=new MutationObserver(applyProfile);if(state.routeGrid)state.observer.observe(state.routeGrid,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});if(state.selectedRoute)state.observer.observe(state.selectedRoute,{childList:true,characterData:true,subtree:true});state.modeObserver=new MutationObserver(applyProfile);state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});if(state.computeState){state.computeObserver=new MutationObserver(applyProfile);state.computeObserver.observe(state.computeState,{childList:true,characterData:true,subtree:true});}
    addEventListener('helios:reel-forge-profile',onForgeProfile);addEventListener('helios:reel-forge-ready',applyProfile);addEventListener('helios:resource-policy',onResourcePolicy);addEventListener('helios:resource-console-ready',applyProfile);addEventListener('helios:music-state',e=>{const seed=Number(e.detail?.session_seed);if(Number.isFinite(seed)&&seed>=0){state.sessionSeed=seed>>>0;applyProfile();}});
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener?.('change',e=>{state.reducedMotion=Boolean(e.matches);syncSparkTimer();});
    addEventListener('pagehide',()=>{if(state.sparkTimer)clearInterval(state.sparkTimer);state.sparkTimer=null;},{once:true});
  }

  function attach(){
    if(state.attached) return true;
    state.reels=document.getElementById('reels');state.gamePanel=document.getElementById('game-panel');state.routeGrid=document.getElementById('route-grid');state.selectedRoute=document.getElementById('selected-route');state.computeState=document.getElementById('compute-state');if(!state.reels||!state.gamePanel||!state.routeGrid||!state.selectedRoute)return false;
    state.attached=true;injectStyles();readForgePalette();readResourcePolicy();applyProfile();bind();
    window.HELIOS_ROUTE_AURA=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,route:state.route,mode:state.mode,session_seed:state.sessionSeed,streaming:state.streaming,palette:{...state.palette},resource_policy:{...state.resource},palette_source:'REEL_FORGE',intensity_source:'CPU_GPU_USER_POLICY',max_policy_sparks:shouldSpark(),presentation_only:true,reads_route:true,reads_mode:true,reads_reel_forge_palette:true,reads_resource_policy:true,reads_music_session_seed:true,reads_compute_activity_for_intensity_only:true,reads_spin:false,reads_win:false,reads_bet:false,reads_balance:false,rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'})});
    dispatchEvent(new CustomEvent('helios:route-aura-ready',{detail:{version:VERSION,presentation_only:true,local_reel_aura:true,session_seeded:true,route_driven:true,forge_palette_driven:true,cpu_gpu_policy_intensity:true,max_policy_sparks:true,multispectral:true,rng_effect:'NONE',rtp_effect:'NONE',compute_routing_effect:'NONE'}}));return true;
  }

  function init(){if(attach())return;let attempts=0;const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
