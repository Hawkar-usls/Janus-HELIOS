(() => {
  'use strict';

  const VERSION = '1.1.0';
  const PATCH_LEVEL = 'SMOOTH_FLOW_BLACK_HOLE_DYSON_1';
  const DEG = Math.PI / 180;
  const TAU = Math.PI * 2;
  const MAX_DPR = 1.5;
  const TARGET_FPS = 30;
  const FRAME_MS = 1000 / TARGET_FPS;
  const STAR_ALPHA_SMOOTH_MS = 1250;
  const EDGE_FADE_PX = 72;
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') || null;

  // Rounded bright-star facts used as visual orientation anchors only.
  // No catalogue, source code or assets are imported from wisnc/stellar-map.
  const BRIGHT_STAR_ANCHORS = Object.freeze([
    ['Sirius',6.752,-16.716,-1.46,'A'],['Canopus',6.399,-52.696,-0.74,'F'],['Arcturus',14.261,19.182,-0.05,'K'],
    ['Vega',18.615,38.783,0.03,'A'],['Capella',5.279,45.998,0.08,'G'],['Rigel',5.243,-8.202,0.12,'B'],
    ['Procyon',7.655,5.225,0.34,'F'],['Betelgeuse',5.919,7.407,0.42,'M'],['Achernar',1.628,-57.237,0.46,'B'],
    ['Hadar',14.063,-60.373,0.61,'B'],['Altair',19.846,8.868,0.77,'A'],['Acrux',12.443,-63.099,0.76,'B'],
    ['Aldebaran',4.599,16.509,0.85,'K'],['Antares',16.490,-26.432,0.96,'M'],['Spica',13.420,-11.161,0.98,'B'],
    ['Pollux',7.755,28.026,1.14,'K'],['Fomalhaut',22.961,-29.622,1.16,'A'],['Deneb',20.691,45.280,1.25,'A'],
    ['Regulus',10.139,11.967,1.35,'B'],['Adhara',6.977,-28.972,1.50,'B'],['Castor',7.577,31.888,1.58,'A'],
    ['Gacrux',12.519,-57.113,1.63,'M'],['Bellatrix',5.419,6.350,1.64,'B'],['Elnath',5.438,28.607,1.65,'B'],
    ['Miaplacidus',9.220,-69.717,1.67,'A'],['Alnilam',5.603,-1.202,1.69,'B'],['Alnair',22.137,-46.961,1.74,'B'],
    ['Alioth',12.900,55.960,1.76,'A'],['Dubhe',11.062,61.751,1.79,'K'],['Mirfak',3.405,49.861,1.79,'F'],
    ['Kaus Australis',18.403,-34.384,1.79,'B'],['Sargas',17.621,-42.998,1.86,'F'],['Avior',8.376,-59.510,1.86,'K'],
    ['Menkalinan',5.992,44.947,1.90,'A'],['Alhena',6.628,16.399,1.93,'A'],['Peacock',20.427,-56.735,1.94,'B'],
    ['Polaris',2.530,89.264,1.98,'F'],['Denebola',11.818,14.572,2.14,'A'],['Algieba',10.333,19.842,2.08,'K']
  ].map(([name,raHours,decDeg,mag,spectral]) => Object.freeze({
    name, ra:raHours*15*DEG, dec:decDeg*DEG, mag, spectral, realAnchor:true
  })));

  const state = {
    canvas:null, ctx:null, cosmos:null, dyson:null,
    w:0, h:0, dpr:1,
    ra:18.2*15*DEG, dec:18*DEG, fov:78*DEG,
    driftRa:0, driftDec:0,
    lastTs:0, lastDraw:0, lastRenderTs:0, raf:0,
    visible:true,
    reducedMotion:Boolean(motionQuery?.matches),
    stars:[], anchors:[], firstFrame:false
  };

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const wrap=(a)=>{a%=TAU;return a<0?a+TAU:a;};
  const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
  const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
  const norm=(v)=>{const m=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/m,y:v.y/m,z:v.z/m};};
  const vectorFromRaDec=(ra,dec)=>{const c=Math.cos(dec);return{x:c*Math.cos(ra),y:c*Math.sin(ra),z:Math.sin(dec)};};
  const hash01=(n)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453123;return x-Math.floor(x);};
  const smoothstep=(edge0,edge1,x)=>{const t=clamp((x-edge0)/(edge1-edge0),0,1);return t*t*(3-2*t);};

  function spectralColor(type,alpha=1){
    const rgb={O:[166,184,255],B:[184,200,255],A:[214,222,255],F:[248,247,255],G:[255,241,213],K:[255,205,150],M:[255,158,108]}[type]||[236,241,255];
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  }

  // Deterministic Fibonacci-sphere field avoids repeating CSS tiles and star clumps.
  function buildSyntheticSky(count){
    const stars=[];
    const golden=Math.PI*(3-Math.sqrt(5));
    for(let i=0;i<count;i++){
      const y=1-(i/(count-1))*2;
      const r=Math.sqrt(Math.max(0,1-y*y));
      const theta=golden*i+(hash01(i+11)-.5)*.055;
      const v={x:Math.cos(theta)*r,y:Math.sin(theta)*r,z:y};
      const h=hash01(i+101);
      const mag=3.0+Math.pow(h,1.55)*3.5;
      const spectral=['B','A','F','G','K','M'][Math.floor(hash01(i+701)*6)%6];
      stars.push({
        v,mag,spectral,realAnchor:false,twinkle:hash01(i+1301)*TAU,
        twinkleSpeed:.00012+hash01(i+1601)*.00012,
        twinkleAmp:.010+hash01(i+1901)*.014,
        displayAlpha:null
      });
    }
    return stars;
  }

  function buildAnchorVectors(){
    return BRIGHT_STAR_ANCHORS.map((s,i)=>({
      ...s,
      v:vectorFromRaDec(s.ra,s.dec),
      twinkle:hash01(s.ra*100+s.dec*10)*TAU,
      twinkleSpeed:.00008+hash01(i+2301)*.00008,
      twinkleAmp:.004+hash01(i+2601)*.007,
      displayAlpha:null
    }));
  }

  function ensureCanvas(){
    const cosmos=document.querySelector('.cosmos');
    if(!cosmos)return false;
    let canvas=document.querySelector('.helios-stellar-canvas');
    if(!canvas){
      canvas=document.createElement('canvas');
      canvas.className='helios-stellar-canvas';
      canvas.setAttribute('aria-hidden','true');
      cosmos.prepend(canvas);
    }
    const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    if(!ctx)return false;
    state.cosmos=cosmos;
    state.canvas=canvas;
    state.ctx=ctx;
    return true;
  }

  function ensureDysonSphere(){
    const cosmos=state.cosmos||document.querySelector('.cosmos');
    if(!cosmos)return null;
    let sphere=cosmos.querySelector('.helios-dyson-sphere');
    if(!sphere){
      sphere=document.createElement('div');
      sphere.className='helios-dyson-sphere';
      sphere.setAttribute('aria-hidden','true');
      const blackHole=cosmos.querySelector('.planet-horizon');
      if(blackHole)cosmos.insertBefore(sphere,blackHole);else cosmos.appendChild(sphere);
    }
    state.dyson=sphere;
    return sphere;
  }

  function injectStyles(){
    if(document.getElementById('helios-stellar-nav-styles'))return;
    const style=document.createElement('style');
    style.id='helios-stellar-nav-styles';
    style.textContent=`
      .helios-stellar-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0;filter:saturate(.92) contrast(1.02);transition:opacity 2.4s cubic-bezier(.22,.61,.36,1)}
      .cosmos.stellar-active .helios-stellar-canvas{opacity:.88}
      .cosmos:before{transition:opacity 2.4s cubic-bezier(.22,.61,.36,1)!important}
      .cosmos.stellar-active:before{opacity:0!important}
      .cosmos>.sun,.cosmos>.orbit-field,.cosmos>.planet-horizon,.cosmos>.helios-dyson-sphere{position:absolute;z-index:1;pointer-events:none}
      .cosmos>.sun,.cosmos>.orbit-field,.cosmos>.planet-horizon{filter:hue-rotate(0deg) saturate(1) brightness(1);will-change:filter}

      /* Passive Dyson-swarm / lattice sphere behind the left HELIOS slot panel.
         Viewport anchoring keeps Stellar independent from gameplay DOM. */
      .cosmos>.helios-dyson-sphere{
        width:clamp(500px,37vw,720px);
        height:clamp(500px,37vw,720px);
        left:35.5%;
        top:49%;
        transform:translate(-50%,-50%) rotate(-7deg);
        border-radius:50%;
        opacity:.56;
        isolation:isolate;
        overflow:visible;
        border:1px solid rgba(255,205,103,.25);
        background:
          radial-gradient(circle at 50% 50%,rgba(255,255,232,.98) 0 1.6%,rgba(255,228,124,.94) 2.2%,rgba(255,178,47,.74) 4.8%,rgba(255,142,21,.28) 8.5%,rgba(255,180,54,.08) 15%,transparent 24%),
          radial-gradient(circle at 39% 34%,rgba(255,220,130,.10) 0 13%,transparent 39%),
          radial-gradient(circle at 62% 68%,transparent 0 43%,rgba(0,0,0,.24) 63%,rgba(0,0,0,.72) 91%,rgba(0,0,0,.82) 100%),
          repeating-conic-gradient(from 11deg,rgba(255,211,117,.23) 0 1.05deg,rgba(255,188,59,.05) 1.15deg 2deg,transparent 2.1deg 7.2deg),
          repeating-radial-gradient(circle at 50% 50%,transparent 0 30px,rgba(255,216,130,.11) 31px 32px,transparent 33px 61px);
        box-shadow:
          0 0 30px rgba(255,178,50,.10),
          0 0 110px rgba(255,147,26,.08),
          inset 28px -24px 72px rgba(0,0,0,.52),
          inset -18px 14px 58px rgba(255,196,79,.07);
        filter:saturate(1.08) brightness(.96);
        will-change:filter;
      }
      .cosmos>.helios-dyson-sphere::before{
        content:"";
        position:absolute;
        left:5%;right:5%;top:30%;height:38%;
        border-radius:50%;
        border:1px solid rgba(255,214,128,.46);
        box-shadow:0 0 12px rgba(255,178,55,.16),inset 0 0 12px rgba(255,203,100,.09);
        transform:rotate(18deg) scaleY(.34);
        opacity:.72;
        animation:helios-dyson-ring-a 54s linear infinite;
      }
      .cosmos>.helios-dyson-sphere::after{
        content:"";
        position:absolute;
        left:10%;right:10%;top:18%;height:64%;
        border-radius:50%;
        border:1px solid rgba(146,183,232,.28);
        box-shadow:0 0 11px rgba(115,151,213,.12),inset 0 0 16px rgba(255,205,105,.05);
        transform:rotate(-31deg) scaleY(.52);
        opacity:.64;
        animation:helios-dyson-ring-b 71s linear infinite reverse;
      }

      /* Centered lower event-horizon black-hole body. */
      .cosmos>.planet-horizon{
        width:clamp(920px,76vw,1560px)!important;
        height:clamp(315px,27vw,510px)!important;
        left:50%!important;
        right:auto!important;
        bottom:clamp(-300px,-13vw,-188px)!important;
        transform:translateX(-50%);
        border-radius:50%;
        overflow:visible;
        isolation:isolate;
        background:
          radial-gradient(ellipse at 50% 1%,rgba(248,251,255,.74) 0 1.0%,rgba(179,196,231,.34) 1.7%,rgba(101,120,164,.22) 4.2%,transparent 9%),
          radial-gradient(ellipse at 44% 5%,rgba(164,183,222,.12) 0 3%,transparent 16%),
          radial-gradient(ellipse at 57% 6%,rgba(202,215,241,.10) 0 2%,transparent 15%),
          radial-gradient(ellipse at 50% 10%,#18202d 0 7%,#0b1019 17%,#030509 39%,#010102 68%,#000 100%)!important;
        box-shadow:
          0 -2px 5px rgba(236,243,255,.28),
          0 -9px 24px rgba(129,151,205,.18),
          0 -30px 88px rgba(69,91,151,.14),
          inset 0 22px 44px rgba(117,139,188,.08),
          inset 0 58px 110px rgba(0,0,0,.86)!important;
      }
      .cosmos>.planet-horizon::before{
        content:"";
        position:absolute;
        inset:-10px -18px -22px;
        border-radius:50%;
        border-top:2px solid rgba(235,243,255,.72);
        border-left:1px solid rgba(124,148,199,.08);
        border-right:1px solid rgba(124,148,199,.08);
        box-shadow:
          0 -1px 4px rgba(250,252,255,.54),
          0 -8px 22px rgba(131,157,218,.24),
          0 -20px 54px rgba(80,105,170,.14),
          inset 0 18px 34px rgba(118,142,194,.08);
        opacity:.92;
        pointer-events:none;
      }
      .cosmos>.planet-horizon::after{
        content:"";
        position:absolute;
        left:5%;right:5%;top:-21px;height:52px;
        border-radius:50%;
        background:radial-gradient(ellipse at 50% 58%,rgba(255,255,255,.38) 0 2%,rgba(181,198,232,.20) 9%,rgba(98,122,178,.09) 31%,transparent 68%);
        filter:blur(5px);
        transform:scaleY(.44);
        opacity:.72;
        pointer-events:none;
      }

      .cosmos.stellar-active>.sun{animation:helios-stellar-sun-flow 28s ease-in-out infinite alternate}
      .cosmos.stellar-active>.planet-horizon{animation:helios-stellar-blackhole-flow 36s ease-in-out -7s infinite alternate}
      .cosmos.stellar-active>.orbit-field{animation:helios-stellar-orbit-flow 42s ease-in-out -13s infinite alternate}
      .cosmos.stellar-active>.helios-dyson-sphere{animation:helios-dyson-breathe 32s ease-in-out -9s infinite alternate}
      @keyframes helios-stellar-sun-flow{
        0%{filter:hue-rotate(0deg) saturate(1) brightness(1)}
        45%{filter:hue-rotate(2.2deg) saturate(1.018) brightness(1.018)}
        100%{filter:hue-rotate(-1.8deg) saturate(.992) brightness(.988)}
      }
      @keyframes helios-stellar-blackhole-flow{
        0%{filter:hue-rotate(0deg) saturate(.98) brightness(.995)}
        48%{filter:hue-rotate(-2.2deg) saturate(1.018) brightness(1.012)}
        100%{filter:hue-rotate(1.8deg) saturate(.99) brightness(.988)}
      }
      @keyframes helios-stellar-orbit-flow{
        0%{filter:hue-rotate(0deg) saturate(1) brightness(1)}
        50%{filter:hue-rotate(2deg) saturate(1.02) brightness(1.01)}
        100%{filter:hue-rotate(-2deg) saturate(.99) brightness(.995)}
      }
      @keyframes helios-dyson-breathe{
        0%{filter:hue-rotate(-1deg) saturate(1.04) brightness(.94)}
        48%{filter:hue-rotate(1.5deg) saturate(1.10) brightness(1.01)}
        100%{filter:hue-rotate(-1.4deg) saturate(1.06) brightness(.97)}
      }
      @keyframes helios-dyson-ring-a{
        from{transform:rotate(18deg) scaleY(.34)}
        to{transform:rotate(378deg) scaleY(.34)}
      }
      @keyframes helios-dyson-ring-b{
        from{transform:rotate(-31deg) scaleY(.52)}
        to{transform:rotate(329deg) scaleY(.52)}
      }
      @media(max-width:980px){
        .cosmos>.helios-dyson-sphere{left:50%;top:38%;width:660px;height:660px;opacity:.40}
      }
      @media(max-width:720px){
        .cosmos>.planet-horizon{width:980px!important;height:330px!important;bottom:-238px!important}
        .cosmos>.planet-horizon::after{left:12%;right:12%;opacity:.56}
        .cosmos>.helios-dyson-sphere{top:34%;width:560px;height:560px;opacity:.28}
      }
      @media(prefers-reduced-motion:reduce){
        .helios-stellar-canvas{opacity:0;transition:opacity .35s ease}
        .cosmos.stellar-active .helios-stellar-canvas{opacity:.78}
        .cosmos:before{transition:opacity .35s ease!important}
        .cosmos.stellar-active>.sun,.cosmos.stellar-active>.planet-horizon,.cosmos.stellar-active>.orbit-field,.cosmos.stellar-active>.helios-dyson-sphere{animation:none!important;filter:hue-rotate(0deg) saturate(1) brightness(1)!important}
        .cosmos>.helios-dyson-sphere::before,.cosmos>.helios-dyson-sphere::after{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function resize(){
    const c=state.canvas;if(!c)return;
    const rect=c.getBoundingClientRect();
    const dpr=Math.min(MAX_DPR,globalThis.devicePixelRatio||1);
    const pixelW=Math.max(1,Math.round(rect.width*dpr));
    const pixelH=Math.max(1,Math.round(rect.height*dpr));
    if(c.width!==pixelW||c.height!==pixelH){
      c.width=pixelW;c.height=pixelH;state.w=rect.width;state.h=rect.height;state.dpr=dpr;
    }
  }

  function basis(){
    const fwd=vectorFromRaDec(state.ra,state.dec);
    let right=cross({x:0,y:0,z:1},fwd);
    if(Math.hypot(right.x,right.y,right.z)<1e-5)right={x:1,y:0,z:0};
    right=norm(right);
    const up=norm(cross(fwd,right));
    return {fwd,right,up};
  }

  function project(v,b){
    const depth=dot(v,b.fwd);
    if(depth<=.035)return null;
    const focal=(state.h*.5)/Math.tan(state.fov*.5);
    const x=state.w*.5+focal*(dot(v,b.right)/depth);
    const y=state.h*.5-focal*(dot(v,b.up)/depth);
    if(x<-EDGE_FADE_PX||x>state.w+EDGE_FADE_PX||y<-EDGE_FADE_PX||y>state.h+EDGE_FADE_PX)return null;
    return {x,y,depth};
  }

  function drawHaze(ctx){
    const g=ctx.createRadialGradient(state.w*.72,state.h*.86,0,state.w*.72,state.h*.86,Math.max(state.w,state.h)*.72);
    g.addColorStop(0,'rgba(70,91,140,.060)');
    g.addColorStop(.36,'rgba(35,52,84,.026)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h);
  }

  function drawStar(ctx,star,p,ts,renderDt){
    const bright=star.realAnchor?clamp(1.15-(star.mag+1.5)*.10,.52,1):clamp((6.8-star.mag)/4.1,.10,.66);
    const twinkle=state.reducedMotion?1:1+Math.sin(ts*star.twinkleSpeed+star.twinkle)*star.twinkleAmp;
    const edgeDistance=Math.min(p.x,p.y,state.w-p.x,state.h-p.y);
    const edgeFade=smoothstep(-8,EDGE_FADE_PX,edgeDistance);
    const depthFade=smoothstep(.035,.16,p.depth);
    const targetAlpha=clamp(bright*twinkle*edgeFade*depthFade,0,1);
    if(star.displayAlpha===null||!Number.isFinite(star.displayAlpha))star.displayAlpha=targetAlpha;
    else{
      const response=state.reducedMotion?1:1-Math.exp(-Math.max(1,renderDt)/STAR_ALPHA_SMOOTH_MS);
      star.displayAlpha+=(targetAlpha-star.displayAlpha)*response;
    }
    const alpha=clamp(star.displayAlpha,0,1);
    if(alpha<.004)return;
    const radius=star.realAnchor?clamp(2.55-star.mag*.38,1.0,3.0):(star.mag<4.2?1.0:.60);
    ctx.beginPath();ctx.arc(p.x,p.y,radius,0,TAU);ctx.fillStyle=spectralColor(star.spectral,alpha);ctx.fill();
    if(star.realAnchor&&star.mag<.7){
      ctx.beginPath();ctx.arc(p.x,p.y,radius*3.0,0,TAU);ctx.fillStyle=spectralColor(star.spectral,alpha*.052);ctx.fill();
    }
  }

  function render(ts){
    const ctx=state.ctx;if(!ctx||!state.w||!state.h)return;
    const renderDt=state.lastRenderTs?Math.min(250,ts-state.lastRenderTs):FRAME_MS;
    state.lastRenderTs=ts;
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
    ctx.clearRect(0,0,state.w,state.h);
    drawHaze(ctx);
    const b=basis();
    for(const star of state.stars){
      const p=project(star.v,b);
      if(p)drawStar(ctx,star,p,ts,renderDt);else star.displayAlpha=0;
    }
    for(const star of state.anchors){
      const p=project(star.v,b);
      if(p)drawStar(ctx,star,p,ts,renderDt);else star.displayAlpha=0;
    }
    if(!state.firstFrame){
      state.firstFrame=true;
      state.cosmos?.classList.add('stellar-active');
    }
  }

  function update(dt){
    if(state.reducedMotion)return;
    // Passive background-only drift. It is intentionally independent of gameplay and compute state.
    state.driftRa=wrap(state.driftRa+0.0000065*dt);
    state.driftDec=Math.sin(performance.now()*0.000035)*0.55*DEG;
    state.ra=wrap(18.2*15*DEG+state.driftRa);
    state.dec=18*DEG+state.driftDec;
  }

  function tick(ts){
    if(!state.visible){state.raf=requestAnimationFrame(tick);return;}
    if(!state.lastTs)state.lastTs=ts;
    const dt=Math.min(80,ts-state.lastTs);state.lastTs=ts;
    update(dt);
    if(ts-state.lastDraw>=FRAME_MS){state.lastDraw=ts;render(ts);}
    state.raf=requestAnimationFrame(tick);
  }

  function bindLifecycle(){
    addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{state.visible=!document.hidden;state.lastTs=0;state.lastRenderTs=0;});
    motionQuery?.addEventListener?.('change',e=>{
      state.reducedMotion=Boolean(e.matches);
      if(state.reducedMotion){state.driftRa=0;state.driftDec=0;state.ra=18.2*15*DEG;state.dec=18*DEG;}
      for(const star of [...state.stars,...state.anchors])star.displayAlpha=null;
      state.lastRenderTs=0;
      render(performance.now());
    });
  }

  function init(){
    if(!ensureCanvas())return; // static CSS star field remains as fallback
    ensureDysonSphere();
    injectStyles();
    resize();
    const area=Math.max(1,state.w*state.h);
    const count=clamp(Math.round(area/1800),420,1100);
    state.stars=buildSyntheticSky(count);
    state.anchors=buildAnchorVectors();
    bindLifecycle();
    state.raf=requestAnimationFrame(tick);
    window.HELIOS_STELLAR_NAVIGATOR=Object.freeze({
      version:VERSION,
      patch:PATCH_LEVEL,
      getState:()=>({
        version:VERSION,
        patch:PATCH_LEVEL,
        mode:'PASSIVE_BACKGROUND_ONLY',
        ra_rad:state.ra,
        dec_rad:state.dec,
        fov_rad:state.fov,
        reduced_motion:state.reducedMotion,
        synthetic_star_count:state.stars.length,
        real_anchor_count:state.anchors.length,
        brightness_smoothing_ms:STAR_ALPHA_SMOOTH_MS,
        background_body_color_flow:true,
        central_black_hole:true,
        event_horizon_visible:true,
        mercury_reflection:true,
        dyson_sphere_present:Boolean(state.dyson),
        dyson_visual_type:'PARTIAL_SWARM_LATTICE',
        dyson_gameplay_authority:'NONE',
        presentation_only:true,
        gameplay_input_count:0,
        rng_effect:'NONE',
        rtp_effect:'NONE',
        payout_effect:'NONE',
        compute_routing_effect:'NONE'
      })
    });
    dispatchEvent(new CustomEvent('helios:stellar-ready',{detail:{version:VERSION,patch:PATCH_LEVEL,presentation_only:true,passive_background_only:true,brightness_smoothed:true,background_body_color_flow:true,central_black_hole:true,event_horizon_visible:true,mercury_reflection:true,dyson_sphere_present:Boolean(state.dyson),dyson_visual_type:'PARTIAL_SWARM_LATTICE',scientific_catalog:false,external_code_imported:false}}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
