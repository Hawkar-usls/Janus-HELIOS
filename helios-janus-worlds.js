(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const DEFAULT_POLICY = {
    enabled:true,
    samples:256,
    porta_entropy_threshold:0.90,
    presentation_only:true,
    affects_rng:false,
    affects_payout:false,
    affects_rtp:false,
    affects_compute:false,
    affects_route:false,
    weapon_domain:false
  };

  const state={
    policy:{...DEFAULT_POLICY},
    seed:0,
    sequence:0,
    last:null,
    attached:false
  };

  function clamp(n,min,max){ return Math.max(min,Math.min(max,Number(n))); }
  function secureUint(){
    const a=new Uint32Array(1);
    if(globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(a);
    else a[0]=(Date.now()*2654435761)>>>0;
    return a[0]>>>0;
  }
  function hash32(x){
    x|=0;x=x+0x7ed55d16+(x<<12);x=x^0xc761c23c^(x>>>19);x=x+0x165667b1+(x<<5);x=x+0xd3a2646c^(x<<9);x=x+0xfd7046c5+(x<<3);x=x^0xb55a4f09^(x>>>16);return x>>>0;
  }
  function unit(seed){ return hash32(seed>>>0)/0xffffffff; }
  function normal(seedA,seedB){
    const u1=Math.max(1e-9,unit(seedA));
    const u2=unit(seedB);
    return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);
  }
  function mean(xs){ return xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length); }
  function sd(xs,m){ return Math.sqrt(xs.reduce((a,b)=>a+(b-m)*(b-m),0)/Math.max(1,xs.length)); }

  async function loadPolicy(){
    try{
      const r=await fetch('./config/helios.public.json',{cache:'no-store'});
      if(!r.ok)return;
      const cfg=await r.json();
      const p=cfg?.janus_world_matrix||{};
      state.policy={
        ...DEFAULT_POLICY,...p,
        samples:Math.max(64,Math.min(1024,Number(p.samples||DEFAULT_POLICY.samples))),
        porta_entropy_threshold:clamp(p.porta_entropy_threshold??DEFAULT_POLICY.porta_entropy_threshold,.80,.995),
        presentation_only:true,affects_rng:false,affects_payout:false,affects_rtp:false,affects_compute:false,affects_route:false,weapon_domain:false
      };
    }catch(_){ }
  }

  function routeKey(){ return ($('selected-route')?.textContent||'MARKET').trim().toUpperCase(); }
  function modeKey(){ return document.body.dataset.gameMode||'helios'; }
  function routeBias(route){
    const map={MARKET:[.12,.05,.10,.08],SCIENCE:[-.08,.02,-.04,.18],TREASURY:[.16,.12,.20,-.06],DC:[.04,.18,.12,.02],OPERATOR:[.08,.14,.10,.04],CUSTOM:[0,0,0,0]};
    return map[route]||map.CUSTOM;
  }
  function modeBias(mode){
    const map={helios:[.12,.02,.04,.16],divine:[-.04,-.06,-.08,.22],gridjack:[.10,.16,.20,-.04],custom:[0,.08,.08,.02]};
    return map[mode]||map.helios;
  }

  function generateMatrix({event='IDLE',energy=0}={}){
    if(!state.policy.enabled)return null;
    const N=state.policy.samples;
    const rb=routeBias(routeKey()),mb=modeBias(modeKey());
    const flux=[],drift=[],turbulence=[],resonance=[];
    const base=(state.seed^Math.imul(++state.sequence,0x9e3779b1)^hash32(event.length*2654435761))>>>0;
    for(let i=0;i<N;i++){
      const s=hash32(base^Math.imul(i+1,0x85ebca6b));
      const z1=normal(s,s^0xa511e9b3),z2=normal(s^0x63d83595,s^0xb5297a4d),z3=normal(s^0x1b56c4e9,s^0x68e31da4),z4=normal(s^0x7feb352d,s^0x846ca68b);
      flux.push(clamp(.50+rb[0]+mb[0]+z1*.17+energy*.10,0,1));
      drift.push(clamp(.50+rb[1]+mb[1]+z2*.18+energy*.06,0,1));
      turbulence.push(clamp(.45+rb[2]+mb[2]+z3*.20+energy*.18,0,1));
      resonance.push(clamp(.52+rb[3]+mb[3]+z4*.16+energy*.14,0,1));
    }
    const fm=mean(flux),dm=mean(drift),tm=mean(turbulence),rm=mean(resonance);
    const spread=(sd(flux,fm)+sd(drift,dm)+sd(turbulence,tm)+sd(resonance,rm))/4;
    const structural=clamp((spread/.20)*.55 + ((tm+Math.abs(fm-dm)+Math.abs(rm-.5))/2.2)*.20 + energy*.08,0,.72);
    const phaseDivergence=unit(base^0xd1b54a35)*.32;
    const entropy=clamp(structural+phaseDivergence,0,1);
    const label=worldLabel({flux:fm,drift:dm,turbulence:tm,resonance:rm,entropy});
    const out={
      engine:'JANUS_WORLD_MATRIX',formula:'RESPICIENS_ET_PROSPICIENS',event,sequence:state.sequence,samples:N,
      mode:modeKey(),route:routeKey(),
      centroid:{flux:+fm.toFixed(4),drift:+dm.toFixed(4),turbulence:+tm.toFixed(4),resonance:+rm.toFixed(4)},
      entropy:+entropy.toFixed(4),phase_divergence:+phaseDivergence.toFixed(4),world:label,
      presentation_only:true,rng_effect:'NONE',payout_effect:'NONE',rtp_effect:'NONE',compute_effect:'NONE',route_effect:'NONE',weapon_domain:false
    };
    state.last=out;applyWorld(out);return out;
  }

  function worldLabel(v){
    if(v.entropy>.84)return 'LIMEN';
    if(v.turbulence>.66)return 'VORTEX';
    if(v.resonance>.67)return 'AETHER';
    if(v.flux>.64)return 'AUREA';
    return 'UMBRA';
  }

  function injectStyles(){
    if($('janus-world-styles'))return;
    const s=document.createElement('style');s.id='janus-world-styles';s.textContent=`
      .janus-world-chip{display:inline-flex;align-items:center;gap:4px;border:1px solid #375062;background:#071019;border-radius:8px;padding:4px 7px;color:#8fa8b8;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.janus-world-chip b{color:#ffd36a}.janus-world-chip i{font-style:normal;color:#80d7ff}
      .janus-porta{position:fixed;z-index:910;left:50%;top:16%;transform:translate(-50%,-16px) scale(.96);opacity:0;pointer-events:none;border:1px solid #b98a34;border-radius:14px;background:radial-gradient(circle at 50% 0,#3b2609ee,#05080df4 70%);box-shadow:0 0 45px #ffbf4038,0 22px 70px #000b;padding:12px 18px;text-align:center;transition:.24s}.janus-porta.show{opacity:1;transform:translate(-50%,0) scale(1)}.janus-porta b{display:block;color:#ffd66d;font:900 13px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em}.janus-porta small{display:block;color:#9ba8b1;font:7px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:4px;letter-spacing:.08em}
      body[data-janus-world="AUREA"] .cosmos{filter:saturate(1.10) brightness(1.04)}
      body[data-janus-world="AETHER"] .cosmos{filter:hue-rotate(12deg) saturate(.92) brightness(1.05)}
      body[data-janus-world="VORTEX"] .cosmos{filter:saturate(1.16) contrast(1.05)}
      body[data-janus-world="UMBRA"] .cosmos{filter:saturate(.82) brightness(.90)}
      body[data-janus-world="LIMEN"] .cosmos{filter:saturate(1.25) contrast(1.08) brightness(1.05)}
      @media(max-width:640px){.janus-porta{top:10%;width:min(92vw,380px)}}
    `;document.head.appendChild(s);
  }

  function buildUI(){
    if(!$('janus-porta')){const p=document.createElement('div');p.id='janus-porta';p.className='janus-porta';p.innerHTML='<b>APERIATUR PORTA</b><small>JANUS WORLD MATRIX · PRESENTATION EVENT</small>';document.body.appendChild(p);}
    if($('janus-world-chip'))return true;
    const mini=document.querySelector('#helios-game-tools .session-mini');if(!mini)return false;
    const chip=document.createElement('span');chip.id='janus-world-chip';chip.className='janus-world-chip';chip.innerHTML='JANUS <b id="janus-world-name">—</b> <i id="janus-world-entropy">H —</i>';mini.appendChild(chip);return true;
  }

  function applyWorld(out){
    document.body.dataset.janusWorld=out.world;
    document.body.style.setProperty('--janus-flux',String(out.centroid.flux));
    document.body.style.setProperty('--janus-drift',String(out.centroid.drift));
    document.body.style.setProperty('--janus-turbulence',String(out.centroid.turbulence));
    document.body.style.setProperty('--janus-resonance',String(out.centroid.resonance));
    if($('janus-world-name'))$('janus-world-name').textContent=out.world;
    if($('janus-world-entropy'))$('janus-world-entropy').textContent=`H ${out.entropy.toFixed(2)}`;
    window.dispatchEvent(new CustomEvent('helios:world-matrix',{detail:out}));
    if(out.entropy>=state.policy.porta_entropy_threshold)openPorta(out);
  }

  function openPorta(out){
    const p=$('janus-porta');if(!p)return;
    p.querySelector('small').textContent=`${out.world} · H ${out.entropy.toFixed(2)} · ${out.samples} FUTURE STATES`;
    p.classList.remove('show');void p.offsetWidth;p.classList.add('show');clearTimeout(p.__t);p.__t=setTimeout(()=>p.classList.remove('show'),1450);
    window.dispatchEvent(new CustomEvent('helios:porta-aperta',{detail:{...out,rarity:'HIGH_ENTROPY_PRESENTATION_EVENT'}}));
  }

  function eventEnergy(e){
    const d=e?.detail||{};
    const peak=Number(d.peak_multiplier||d.multiplier||1);
    const cascades=Number(d.cascades||0);
    const retrigger=Boolean(d.retriggered);
    return clamp((Math.log2(Math.max(1,peak))/6)*.45 + Math.min(.35,cascades*.06) + (retrigger?.20:0),0,.95);
  }

  function bindEvents(){
    window.addEventListener('helios:spin-complete',e=>generateMatrix({event:'SPIN_COMPLETE',energy:eventEnergy(e)}));
    window.addEventListener('helios:bonus-session-start',()=>generateMatrix({event:'BONUS_SESSION_START',energy:.55}));
    window.addEventListener('helios:bonus-spin',e=>generateMatrix({event:'BONUS_SPIN',energy:eventEnergy(e)}));
    window.addEventListener('helios:solar-corona',()=>generateMatrix({event:'SOLAR_CORONA',energy:.78}));
    window.addEventListener('helios:lucky-contribution',()=>generateMatrix({event:'LUCKY_CONTRIBUTION',energy:.72}));
    new MutationObserver(()=>generateMatrix({event:'MODE_CHANGE',energy:.18})).observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    const route=$('selected-route');if(route)new MutationObserver(()=>generateMatrix({event:'ROUTE_CHANGE',energy:.16})).observe(route,{childList:true,characterData:true,subtree:true});
  }

  async function init(){
    state.seed=secureUint();await loadPolicy();injectStyles();bindEvents();
    let tries=0;const attach=()=>{buildUI();if(buildUI()){generateMatrix({event:'INIT',energy:.08});return;}if(++tries<100)setTimeout(attach,80);};attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
