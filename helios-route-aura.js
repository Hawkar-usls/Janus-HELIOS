(() => {
  'use strict';

  const VERSION='1.1.0';
  const ROUTE_KEY_TO_SHORT=Object.freeze({market:'MARKET',science:'SCIENCE',jackpot:'TREASURY',datacenter:'DC',operator:'OPERATOR',custom:'CUSTOM'});
  const MODE_FALLBACK=Object.freeze({
    helios:Object.freeze({primary:'#ffc24b',secondary:'#ff8d2a',tertiary:'#f2a13a'}),
    divine:Object.freeze({primary:'#d7a7ff',secondary:'#80d7ff',tertiary:'#aaafff'}),
    gridjack:Object.freeze({primary:'#95ff9a',secondary:'#58e6ff',tertiary:'#72f6c9'}),
    custom:Object.freeze({primary:'#80d7ff',secondary:'#a78bfa',tertiary:'#91b3fc'})
  });

  const state={attached:false,reels:null,routeGrid:null,selectedRoute:null,computeState:null,mode:'helios',route:'MARKET',sessionSeed:0,streaming:false,palette:{...MODE_FALLBACK.helios},observer:null,modeObserver:null,computeObserver:null};

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

  function injectStyles(){
    if(document.getElementById('helios-route-aura-styles')) return;
    const style=document.createElement('style');
    style.id='helios-route-aura-styles';
    style.textContent=`
      @property --route-aura-low{syntax:"<color>";inherits:true;initial-value:rgba(255,194,75,.13)}
      @property --route-aura-high{syntax:"<color>";inherits:true;initial-value:rgba(255,141,42,.24)}
      @property --route-aura-spectrum{syntax:"<color>";inherits:true;initial-value:rgba(242,161,58,.15)}
      @property --route-aura-border{syntax:"<color>";inherits:true;initial-value:rgba(255,194,75,.30)}
      .reels.route-aura-v1{
        --route-aura-breath:5.8s;
        transition:--route-aura-low .9s ease,--route-aura-high .9s ease,--route-aura-spectrum .9s ease,--route-aura-border .9s ease,border-color .9s ease,box-shadow .9s ease;
        border-color:var(--route-aura-border)!important;
        animation:heliosRouteAuraBreath var(--route-aura-breath) ease-in-out infinite;
      }
      .reels.route-aura-v1.route-aura-streaming{animation-name:heliosRouteAuraStreaming}
      @keyframes heliosRouteAuraBreath{
        0%,100%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 15px var(--route-aura-low),0 0 29px var(--route-aura-spectrum),0 0 44px transparent}
        50%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 22px var(--route-aura-high),0 0 39px var(--route-aura-low),0 0 58px var(--route-aura-spectrum)}
      }
      @keyframes heliosRouteAuraStreaming{
        0%,100%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 20px var(--route-aura-high),0 0 40px var(--route-aura-spectrum),0 0 56px var(--route-aura-low)}
        50%{box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 29px var(--route-aura-high),0 0 51px var(--route-aura-low),0 0 72px var(--route-aura-spectrum)}
      }
      @media(prefers-reduced-motion:reduce){.reels.route-aura-v1{animation:none!important;box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 20px var(--route-aura-low),0 0 36px var(--route-aura-spectrum)!important}}
    `;
    document.head.appendChild(style);
  }

  function applyProfile(){
    if(!state.reels) return;
    state.mode=document.body.dataset.gameMode||'helios';
    state.route=activeRouteShort();
    state.streaming=Boolean(state.computeState?.textContent?.includes('ACTIVE'));
    readForgePalette();
    const {primary,secondary,tertiary}=state.palette;
    const lowAlpha=(state.streaming?.19:.105)+unit(21)*.050;
    const highAlpha=(state.streaming?.34:.205)+unit(31)*.070;
    const spectrumAlpha=(state.streaming?.24:.125)+unit(37)*.060;
    const borderAlpha=(state.streaming?.49:.29)+unit(41)*.075;
    const breath=(4.9+unit(51)*2.35).toFixed(2)+'s';
    state.reels.classList.add('route-aura-v1');
    state.reels.classList.toggle('route-aura-streaming',state.streaming);
    state.reels.dataset.routeAura=state.route;
    state.reels.dataset.routeAuraMode=state.mode;
    state.reels.dataset.routeAuraPalette='REEL_FORGE';
    state.reels.style.setProperty('--route-aura-low',rgba(primary,lowAlpha));
    state.reels.style.setProperty('--route-aura-high',rgba(secondary,highAlpha));
    state.reels.style.setProperty('--route-aura-spectrum',rgba(tertiary,spectrumAlpha));
    state.reels.style.setProperty('--route-aura-border',rgba(primary,borderAlpha));
    state.reels.style.setProperty('--route-aura-breath',breath);
  }

  function onForgeProfile(e){
    const d=e.detail||{};
    const p=d.palette||{};
    if(validHex(p.primary)&&validHex(p.secondary)) state.palette={primary:p.primary,secondary:p.secondary,tertiary:validHex(p.tertiary)?p.tertiary:p.secondary};
    const seed=Number(d.session_seed);
    if(Number.isFinite(seed)&&seed>=0) state.sessionSeed=seed>>>0;
    applyProfile();
  }

  function bind(){
    state.observer=new MutationObserver(applyProfile);
    if(state.routeGrid) state.observer.observe(state.routeGrid,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    if(state.selectedRoute) state.observer.observe(state.selectedRoute,{childList:true,characterData:true,subtree:true});
    state.modeObserver=new MutationObserver(applyProfile);
    state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    if(state.computeState){state.computeObserver=new MutationObserver(applyProfile);state.computeObserver.observe(state.computeState,{childList:true,characterData:true,subtree:true});}
    addEventListener('helios:reel-forge-profile',onForgeProfile);
    addEventListener('helios:reel-forge-ready',applyProfile);
    addEventListener('helios:music-state',e=>{const seed=Number(e.detail?.session_seed);if(Number.isFinite(seed)&&seed>=0){state.sessionSeed=seed>>>0;applyProfile();}});
  }

  function attach(){
    if(state.attached) return true;
    state.reels=document.getElementById('reels');
    state.routeGrid=document.getElementById('route-grid');
    state.selectedRoute=document.getElementById('selected-route');
    state.computeState=document.getElementById('compute-state');
    if(!state.reels||!state.routeGrid||!state.selectedRoute) return false;
    state.attached=true;
    injectStyles();
    readForgePalette();
    applyProfile();
    bind();
    window.HELIOS_ROUTE_AURA=Object.freeze({
      version:VERSION,
      getState:()=>({version:VERSION,attached:state.attached,route:state.route,mode:state.mode,session_seed:state.sessionSeed,streaming:state.streaming,palette:{...state.palette},palette_source:'REEL_FORGE',presentation_only:true,reads_route:true,reads_mode:true,reads_reel_forge_palette:true,reads_music_session_seed:true,reads_compute_activity_for_intensity_only:true,reads_spin:false,reads_win:false,reads_bet:false,reads_balance:false,rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'})
    });
    dispatchEvent(new CustomEvent('helios:route-aura-ready',{detail:{version:VERSION,presentation_only:true,local_reel_aura:true,session_seeded:true,route_driven:true,forge_palette_driven:true,multispectral:true,rng_effect:'NONE',rtp_effect:'NONE',compute_routing_effect:'NONE'}}));
    return true;
  }

  function init(){if(attach())return;let attempts=0;const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);};retry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();