(() => {
  'use strict';

  const VERSION='1.0.0';
  const MODE_BASE=Object.freeze({
    helios:Object.freeze({accent:'#ffc24b',secondary:'#ff8d2a',patterns:['sunburst','rings','alloy']}),
    divine:Object.freeze({accent:'#d7a7ff',secondary:'#80d7ff',patterns:['prism','lattice','rings']}),
    gridjack:Object.freeze({accent:'#95ff9a',secondary:'#58e6ff',patterns:['grid','scan','lattice']}),
    custom:Object.freeze({accent:'#80d7ff',secondary:'#a78bfa',patterns:['blueprint','rings','grid']})
  });
  const ROUTES=Object.freeze({
    MARKET:Object.freeze({mix:'#ffc857',bias:0,gap:[9,14]}),
    SCIENCE:Object.freeze({mix:'#72e7ff',bias:1,gap:[12,18]}),
    TREASURY:Object.freeze({mix:'#ffad42',bias:2,gap:[7,12]}),
    DC:Object.freeze({mix:'#6faeff',bias:1,gap:[8,13]}),
    OPERATOR:Object.freeze({mix:'#ffb45f',bias:2,gap:[10,16]}),
    CUSTOM:Object.freeze({mix:'#a78bfa',bias:0,gap:[11,19]})
  });
  const ROUTE_KEY_TO_SHORT=Object.freeze({market:'MARKET',science:'SCIENCE',jackpot:'TREASURY',datacenter:'DC',operator:'OPERATOR',custom:'CUSTOM'});

  const state={attached:false,reels:null,routeGrid:null,selectedRoute:null,mode:'helios',route:'MARKET',sessionSeed:0,profile:null,routeObserver:null,modeObserver:null};

  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function secureUint(){const a=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(a);else a[0]=(Date.now()*2246822519)>>>0;return a[0]>>>0;}
  function hash32(x){x|=0;x=x+0x7ed55d16+(x<<12);x=x^0xc761c23c^(x>>>19);x=x+0x165667b1+(x<<5);x=x+0xd3a2646c^(x<<9);x=x+0xfd7046c5+(x<<3);x=x^0xb55a4f09^(x>>>16);return x>>>0;}
  function textHash(text){let h=2166136261>>>0;for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
  function unit(salt=0){return hash32((state.sessionSeed^textHash(state.mode)^textHash(state.route)^salt)>>>0)/0xffffffff;}
  function rgb(hex){const raw=String(hex).replace('#','');const n=parseInt(raw.length===3?raw.split('').map(x=>x+x).join(''):raw,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function rgba(hex,a){const c=rgb(hex);return `rgba(${c.r},${c.g},${c.b},${clamp(a,0,1).toFixed(3)})`;}
  function blendHex(a,b,t){const A=rgb(a),B=rgb(b),k=clamp(t,0,1),h=n=>Math.round(n).toString(16).padStart(2,'0');return `#${h(A.r+(B.r-A.r)*k)}${h(A.g+(B.g-A.g)*k)}${h(A.b+(B.b-A.b)*k)}`;}

  function activeRoute(){
    const active=state.routeGrid?.querySelector('.route.active[data-route]');
    const fromKey=active?.dataset.route&&ROUTE_KEY_TO_SHORT[active.dataset.route];
    const fromText=state.selectedRoute?.textContent?.trim().toUpperCase();
    return ROUTES[fromKey]?fromKey:ROUTES[fromText]?fromText:'MARKET';
  }

  function injectStyles(){
    if(document.getElementById('helios-reel-forge-styles')) return;
    const style=document.createElement('style');
    style.id='helios-reel-forge-styles';
    style.textContent=`
      .reels.reel-forge-v1{--forge-gap:12px;--forge-angle:42deg;--forge-cell-radius:8px;--forge-reel-radius:9px;--forge-border:rgba(255,255,255,.11);--forge-surface-a:#111922;--forge-surface-b:#070c11;--forge-accent-soft:rgba(255,194,75,.08);--forge-secondary-soft:rgba(128,215,255,.045);--forge-line:rgba(255,255,255,.035);--forge-depth:16px}
      .reels.reel-forge-v1 .reel[data-reel-index]{border-radius:var(--forge-reel-radius)!important;background:linear-gradient(var(--forge-angle),var(--forge-accent-soft),transparent 28% 72%,var(--forge-secondary-soft)),linear-gradient(90deg,#ffffff04,transparent 24% 76%,#ffffff03)!important;transition:background .9s ease,border-radius .9s ease}
      .reels.reel-forge-v1 .reel[data-reel-index] .cell:not(.hit){border-radius:var(--forge-cell-radius)!important;border-color:var(--forge-border)!important;background:linear-gradient(180deg,var(--forge-surface-a),var(--forge-surface-b))!important;box-shadow:inset 0 0 var(--forge-depth) #0006,inset 0 1px #ffffff07;transition:border-color .65s ease,background .9s ease,border-radius .9s ease,box-shadow .65s ease,color .55s ease,transform .18s ease}
      .reels.reel-forge-v1 .reel[data-reel-index] .cell:before{opacity:.68!important;background-size:auto!important;background-position:center!important;transition:background .9s ease,opacity .55s ease,transform .55s ease,box-shadow .55s ease}
      .reels.reel-forge-v1[data-forge-pattern="sunburst"] .cell:before{background:radial-gradient(circle at 50% 50%,var(--forge-accent-soft),transparent 43%),conic-gradient(from var(--forge-angle),transparent 0 11deg,var(--forge-line) 11deg 15deg,transparent 15deg 37deg)!important}
      .reels.reel-forge-v1[data-forge-pattern="rings"] .cell:before{background:radial-gradient(circle at 50% 50%,transparent 0 25%,var(--forge-line) 26% 27%,transparent 28% 43%,var(--forge-secondary-soft) 44% 45%,transparent 46%)!important}
      .reels.reel-forge-v1[data-forge-pattern="alloy"] .cell:before{background:linear-gradient(var(--forge-angle),var(--forge-accent-soft),transparent 34% 66%,var(--forge-secondary-soft)),repeating-linear-gradient(90deg,transparent 0 var(--forge-gap),var(--forge-line) var(--forge-gap) calc(var(--forge-gap) + 1px))!important}
      .reels.reel-forge-v1[data-forge-pattern="prism"] .cell:before{border-radius:2px!important;background:linear-gradient(var(--forge-angle),transparent 18%,var(--forge-line) 19% 20%,transparent 21% 48%,var(--forge-secondary-soft) 49% 50%,transparent 51%),linear-gradient(calc(var(--forge-angle) + 90deg),var(--forge-accent-soft),transparent 44%)!important}
      .reels.reel-forge-v1[data-forge-pattern="lattice"] .cell:before{border-radius:3px!important;background:repeating-linear-gradient(var(--forge-angle),transparent 0 var(--forge-gap),var(--forge-line) var(--forge-gap) calc(var(--forge-gap) + 1px)),repeating-linear-gradient(calc(var(--forge-angle) + 90deg),transparent 0 var(--forge-gap),var(--forge-secondary-soft) var(--forge-gap) calc(var(--forge-gap) + 1px))!important}
      .reels.reel-forge-v1[data-forge-pattern="grid"] .cell:before{border-radius:3px!important;background:repeating-linear-gradient(0deg,transparent 0 var(--forge-gap),var(--forge-line) var(--forge-gap) calc(var(--forge-gap) + 1px)),repeating-linear-gradient(90deg,transparent 0 var(--forge-gap),var(--forge-secondary-soft) var(--forge-gap) calc(var(--forge-gap) + 1px))!important}
      .reels.reel-forge-v1[data-forge-pattern="scan"] .cell:before{background:linear-gradient(180deg,var(--forge-accent-soft),transparent 28% 72%,var(--forge-secondary-soft)),repeating-linear-gradient(0deg,transparent 0 calc(var(--forge-gap) - 1px),var(--forge-line) calc(var(--forge-gap) - 1px) var(--forge-gap))!important}
      .reels.reel-forge-v1[data-forge-pattern="blueprint"] .cell:before{background:radial-gradient(circle at 50% 50%,transparent 0 31%,var(--forge-secondary-soft) 32% 33%,transparent 34%),linear-gradient(90deg,transparent 49%,var(--forge-line) 50%,transparent 51%),linear-gradient(0deg,transparent 49%,var(--forge-line) 50%,transparent 51%)!important}
      .reels.reel-forge-v1 .cell[data-rank="0"]:before{opacity:.96!important;box-shadow:inset 0 0 18px var(--forge-accent-soft),0 0 12px var(--forge-secondary-soft)}
      @media(prefers-reduced-motion:reduce){.reels.reel-forge-v1 .reel[data-reel-index],.reels.reel-forge-v1 .cell:before{transition-duration:.18s!important}}
    `;
    document.head.appendChild(style);
  }

  function generateProfile(){
    state.mode=MODE_BASE[document.body.dataset.gameMode]?document.body.dataset.gameMode:'helios';
    state.route=activeRoute();
    const mode=MODE_BASE[state.mode],route=ROUTES[state.route]||ROUTES.MARKET;
    const candidates=mode.patterns;
    const pattern=candidates[(Math.floor(unit(17)*candidates.length)+route.bias)%candidates.length];
    const gap=Math.round(route.gap[0]+unit(29)*(route.gap[1]-route.gap[0]));
    const angle=Math.round(18+unit(37)*144);
    const cellRadius=(6+unit(43)*5).toFixed(1)+'px';
    const reelRadius=(7+unit(47)*5).toFixed(1)+'px';
    const depth=(12+unit(53)*12).toFixed(1)+'px';
    const mix=blendHex(mode.accent,route.mix,.26+unit(61)*.18);
    const secondary=blendHex(mode.secondary,route.mix,.18+unit(67)*.17);
    const surfaceA=blendHex('#10171f',mix,.055+unit(71)*.045);
    const surfaceB=blendHex('#070c11',secondary,.035+unit(73)*.035);
    return {pattern,gap,angle,cellRadius,reelRadius,depth,mix,secondary,surfaceA,surfaceB,lineAlpha:.028+unit(79)*.034,accentAlpha:.055+unit(83)*.055,secondaryAlpha:.030+unit(89)*.045,borderAlpha:.09+unit(97)*.07};
  }

  function applyProfile(){
    if(!state.reels) return;
    const p=generateProfile();
    state.profile=p;
    state.reels.classList.add('reel-forge-v1');
    state.reels.dataset.forgePattern=p.pattern;
    state.reels.dataset.forgeMode=state.mode;
    state.reels.dataset.forgeRoute=state.route;
    state.reels.style.setProperty('--forge-gap',`${p.gap}px`);
    state.reels.style.setProperty('--forge-angle',`${p.angle}deg`);
    state.reels.style.setProperty('--forge-cell-radius',p.cellRadius);
    state.reels.style.setProperty('--forge-reel-radius',p.reelRadius);
    state.reels.style.setProperty('--forge-depth',p.depth);
    state.reels.style.setProperty('--forge-border',rgba(p.mix,p.borderAlpha));
    state.reels.style.setProperty('--forge-surface-a',p.surfaceA);
    state.reels.style.setProperty('--forge-surface-b',p.surfaceB);
    state.reels.style.setProperty('--forge-accent-soft',rgba(p.mix,p.accentAlpha));
    state.reels.style.setProperty('--forge-secondary-soft',rgba(p.secondary,p.secondaryAlpha));
    state.reels.style.setProperty('--forge-line',rgba(p.mix,p.lineAlpha));
  }

  function bind(){
    state.routeObserver=new MutationObserver(applyProfile);
    state.routeObserver.observe(state.routeGrid,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    state.routeObserver.observe(state.selectedRoute,{childList:true,characterData:true,subtree:true});
    state.modeObserver=new MutationObserver(applyProfile);
    state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    addEventListener('helios:music-state',e=>{const seed=Number(e.detail?.session_seed);if(Number.isFinite(seed)&&seed>=0){state.sessionSeed=seed>>>0;applyProfile();}});
  }

  function attach(){
    if(state.attached) return true;
    state.reels=document.getElementById('reels');
    state.routeGrid=document.getElementById('route-grid');
    state.selectedRoute=document.getElementById('selected-route');
    if(!state.reels||!state.routeGrid||!state.selectedRoute) return false;
    state.sessionSeed=secureUint();
    state.attached=true;
    injectStyles();
    applyProfile();
    bind();
    window.HELIOS_REEL_FORGE=Object.freeze({
      version:VERSION,
      getState:()=>({version:VERSION,attached:state.attached,mode:state.mode,route:state.route,session_seed:state.sessionSeed,profile:state.profile?{...state.profile}:null,presentation_only:true,reads_mode:true,reads_route:true,reads_music_session_seed:true,reads_visible_symbol:false,reads_spin_math:false,reads_bet:false,reads_balance:false,reads_compute:false,rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'})
    });
    dispatchEvent(new CustomEvent('helios:reel-forge-ready',{detail:{version:VERSION,presentation_only:true,mode_route_seed_forge:true,symbol_text_preserved:true,session_stable:true,rng_effect:'NONE',rtp_effect:'NONE',compute_routing_effect:'NONE'}}));
    return true;
  }

  function init(){if(attach())return;let attempts=0;const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();