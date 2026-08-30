(() => {
  'use strict';

  const VERSION='1.0.0';
  const ROUTES=Object.freeze({
    MARKET:Object.freeze({key:'market',primary:'#ffc857',secondary:'#ff8a3d'}),
    SCIENCE:Object.freeze({key:'science',primary:'#72e7ff',secondary:'#8ea8ff'}),
    TREASURY:Object.freeze({key:'jackpot',primary:'#ffb24a',secondary:'#d97b28'}),
    DC:Object.freeze({key:'datacenter',primary:'#6fb8ff',secondary:'#5f7dff'}),
    OPERATOR:Object.freeze({key:'operator',primary:'#ffb45f',secondary:'#ffd37a'}),
    CUSTOM:Object.freeze({key:'custom',primary:'#a78bfa',secondary:'#61d9ff'})
  });
  const MODES=Object.freeze({helios:'#ffc24b',divine:'#d7a7ff',gridjack:'#95ff9a',custom:'#80d7ff'});
  const ROUTE_KEY_TO_SHORT=Object.freeze({market:'MARKET',science:'SCIENCE',jackpot:'TREASURY',datacenter:'DC',operator:'OPERATOR',custom:'CUSTOM'});

  const state={attached:false,reels:null,routeGrid:null,selectedRoute:null,computeState:null,mode:'helios',route:'MARKET',sessionSeed:0,streaming:false,observer:null,modeObserver:null,computeObserver:null};

  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function secureUint(){const a=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(a);else a[0]=(Date.now()*2654435761)>>>0;return a[0]>>>0;}
  function hash32(x){x|=0;x=x+0x7ed55d16+(x<<12);x=x^0xc761c23c^(x>>>19);x=x+0x165667b1+(x<<5);x=x+0xd3a2646c^(x<<9);x=x+0xfd7046c5+(x<<3);x=x^0xb55a4f09^(x>>>16);return x>>>0;}
  function textHash(text){let h=2166136261>>>0;for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
  function unit(salt=0){return hash32((state.sessionSeed^textHash(state.mode)^textHash(state.route)^salt)>>>0)/0xffffffff;}
  function hexRgb(hex){const raw=String(hex).replace('#','');const n=parseInt(raw.length===3?raw.split('').map(x=>x+x).join(''):raw,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function blend(a,b,t){const A=hexRgb(a),B=hexRgb(b),k=clamp(t,0,1);const c=x=>Math.round(x);return `rgb(${c(A.r+(B.r-A.r)*k)} ${c(A.g+(B.g-A.g)*k)} ${c(A.b+(B.b-A.b)*k)})`;}
  function rgba(hex,a){const c=hexRgb(hex);return `rgba(${c.r},${c.g},${c.b},${clamp(a,0,1).toFixed(3)})`;}

  function activeRouteShort(){
    const active=state.routeGrid?.querySelector('.route.active[data-route]');
    const fromKey=active?.dataset.route&&ROUTE_KEY_TO_SHORT[active.dataset.route];
    const fromText=state.selectedRoute?.textContent?.trim().toUpperCase();
    return ROUTES[fromKey]?fromKey:ROUTES[fromText]?fromText:'MARKET';
  }

  function injectStyles(){
    if(document.getElementById('helios-route-aura-styles')) return;
    const style=document.createElement('style');
    style.id='helios-route-aura-styles';
    style.textContent=`
      @property --route-aura-low{syntax:"<color>";inherits:true;initial-value:rgba(255,200,87,.14)}
      @property --route-aura-high{syntax:"<color>";inherits:true;initial-value:rgba(255,200,87,.26)}
      @property --route-aura-border{syntax:"<color>";inherits:true;initial-value:rgba(255,200,87,.32)}
      .reels.route-aura-v1{
        --route-aura-breath:5.8s;
        transition:--route-aura-low .9s ease,--route-aura-high .9s ease,--route-aura-border .9s ease,border-color .9s ease,box-shadow .9s ease;
        border-color:var(--route-aura-border)!important;
        animation:heliosRouteAuraBreath var(--route-aura-breath) ease-in-out infinite;
      }
      .reels.route-aura-v1.route-aura-streaming{animation-name:heliosRouteAuraStreaming}
      @keyframes heliosRouteAuraBreath{
        0%,100%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 18px var(--route-aura-low),0 0 34px transparent}
        50%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 24px var(--route-aura-high),0 0 48px var(--route-aura-low)}
      }
      @keyframes heliosRouteAuraStreaming{
        0%,100%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 22px var(--route-aura-high),0 0 44px var(--route-aura-low)}
        50%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 30px var(--route-aura-high),0 0 62px var(--route-aura-low)}
      }
      @media(prefers-reduced-motion:reduce){.reels.route-aura-v1{animation:none!important;box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 22px var(--route-aura-low)!important}}
    `;
    document.head.appendChild(style);
  }

  function applyProfile(){
    if(!state.reels) return;
    state.mode=document.body.dataset.gameMode||'helios';
    state.route=activeRouteShort();
    state.streaming=Boolean(state.computeState?.textContent?.includes('ACTIVE'));
    const route=ROUTES[state.route]||ROUTES.MARKET;
    const modeColor=MODES[state.mode]||MODES.helios;
    const routePrimary=route.primary;
    const mixed=blend(routePrimary,modeColor,.16+unit(11)*.10);
    const lowAlpha=(state.streaming?.20:.12)+unit(21)*.055;
    const highAlpha=(state.streaming?.38:.24)+unit(31)*.075;
    const borderAlpha=(state.streaming?.54:.34)+unit(41)*.08;
    const breath=(4.9+unit(51)*2.35).toFixed(2)+'s';
    state.reels.classList.add('route-aura-v1');
    state.reels.classList.toggle('route-aura-streaming',state.streaming);
    state.reels.dataset.routeAura=state.route;
    state.reels.dataset.routeAuraMode=state.mode;
    state.reels.style.setProperty('--route-aura-low',rgba(routePrimary,lowAlpha));
    state.reels.style.setProperty('--route-aura-high',rgba(route.secondary,highAlpha));
    state.reels.style.setProperty('--route-aura-border',mixed.replace('rgb(','rgba(').replace(')',`,${clamp(borderAlpha,0,1).toFixed(3)})`));
    state.reels.style.setProperty('--route-aura-breath',breath);
  }

  function bind(){
    state.observer=new MutationObserver(applyProfile);
    if(state.routeGrid) state.observer.observe(state.routeGrid,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    if(state.selectedRoute) state.observer.observe(state.selectedRoute,{childList:true,characterData:true,subtree:true});
    state.modeObserver=new MutationObserver(applyProfile);
    state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    if(state.computeState){state.computeObserver=new MutationObserver(applyProfile);state.computeObserver.observe(state.computeState,{childList:true,characterData:true,subtree:true});}
    addEventListener('helios:music-state',e=>{const seed=Number(e.detail?.session_seed);if(Number.isFinite(seed)&&seed>=0){state.sessionSeed=seed>>>0;applyProfile();}});
  }

  function attach(){
    if(state.attached) return true;
    state.reels=document.getElementById('reels');
    state.routeGrid=document.getElementById('route-grid');
    state.selectedRoute=document.getElementById('selected-route');
    state.computeState=document.getElementById('compute-state');
    if(!state.reels||!state.routeGrid||!state.selectedRoute) return false;
    state.sessionSeed=secureUint();
    state.attached=true;
    injectStyles();
    applyProfile();
    bind();
    window.HELIOS_ROUTE_AURA=Object.freeze({
      version:VERSION,
      getState:()=>({version:VERSION,attached:state.attached,route:state.route,mode:state.mode,session_seed:state.sessionSeed,streaming:state.streaming,presentation_only:true,reads_route:true,reads_mode:true,reads_music_session_seed:true,reads_compute_activity_for_intensity_only:true,reads_spin:false,reads_win:false,reads_bet:false,reads_balance:false,rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'})
    });
    dispatchEvent(new CustomEvent('helios:route-aura-ready',{detail:{version:VERSION,presentation_only:true,local_reel_aura:true,session_seeded:true,route_driven:true,mode_blended:true,rng_effect:'NONE',rtp_effect:'NONE',compute_routing_effect:'NONE'}}));
    return true;
  }

  function init(){if(attach())return;let attempts=0;const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();