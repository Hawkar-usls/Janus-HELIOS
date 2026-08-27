(() => {
  'use strict';

  const VERSION = '1.0.0';
  const DEG = Math.PI / 180;
  const TAU = Math.PI * 2;
  const MAX_DPR = 1.5;
  const TARGET_FPS = 30;
  const FRAME_MS = 1000 / TARGET_FPS;
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') || null;

  // Rounded J2000-ish bright-star facts, manually curated for orientation only.
  // This is not a scientific catalogue and is not copied from wisnc/stellar-map.
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

  const MODE_TARGETS = Object.freeze({
    helios:{ra:18.2*15*DEG,dec:18*DEG,fov:78*DEG},
    divine:{ra:6.1*15*DEG,dec:22*DEG,fov:72*DEG},
    gridjack:{ra:12.7*15*DEG,dec:-12*DEG,fov:82*DEG},
    custom:{ra:22.3*15*DEG,dec:6*DEG,fov:76*DEG}
  });

  const ROUTE_OFFSETS = Object.freeze({
    MARKETPLACE:[5,2],SCIENCE:[-7,5],TREASURY:[9,-4],DATACENTER:[-4,-6],OPERATOR:[3,7],CUSTOM:[-9,1],MARKET:[5,2]
  });

  const state = {
    canvas:null,ctx:null,w:0,h:0,dpr:1,
    ra:MODE_TARGETS.helios.ra,dec:MODE_TARGETS.helios.dec,fov:MODE_TARGETS.helios.fov,
    targetRa:MODE_TARGETS.helios.ra,targetDec:MODE_TARGETS.helios.dec,targetFov:MODE_TARGETS.helios.fov,
    yawVelocity:0,pitchVelocity:0,warp:0,flash:0,
    lastTs:0,lastDraw:0,raf:0,frame:0,visible:true,
    reducedMotion:Boolean(motionQuery?.matches),
    stars:[],anchors:[],mode:'helios',route:'MARKETPLACE',spinCount:0
  };

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const wrap=(a)=>{a%=TAU;return a<0?a+TAU:a;};
  const lerp=(a,b,t)=>a+(b-a)*t;
  const easeAngle=(a,b,t)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return wrap(a+d*t);};
  const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
  const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
  const norm=(v)=>{const m=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/m,y:v.y/m,z:v.z/m};};
  const vectorFromRaDec=(ra,dec)=>{const c=Math.cos(dec);return{x:c*Math.cos(ra),y:c*Math.sin(ra),z:Math.sin(dec)};};
  const hash01=(n)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453123;return x-Math.floor(x);};

  function spectralColor(type,alpha=1){
    const rgb={O:[166,184,255],B:[184,200,255],A:[214,222,255],F:[248,247,255],G:[255,241,213],K:[255,205,150],M:[255,158,108]}[type]||[236,241,255];
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  }

  function buildSyntheticSky(count){
    const stars=[];
    const golden=Math.PI*(3-Math.sqrt(5));
    for(let i=0;i<count;i++){
      const y=1-(i/(count-1))*2;
      const r=Math.sqrt(Math.max(0,1-y*y));
      const theta=golden*i + (hash01(i+11)-.5)*.055;
      const v={x:Math.cos(theta)*r,y:Math.sin(theta)*r,z:y};
      const h=hash01(i+101);
      const mag=3.0+Math.pow(h,1.55)*3.5;
      const spectral=['B','A','F','G','K','M'][Math.floor(hash01(i+701)*6)%6];
      stars.push({v,mag,spectral,realAnchor:false,twinkle:hash01(i+1301)*TAU});
    }
    return stars;
  }

  function buildAnchorVectors(){
    return BRIGHT_STAR_ANCHORS.map(s=>({...s,v:vectorFromRaDec(s.ra,s.dec),twinkle:hash01(s.ra*100+s.dec*10)*TAU}));
  }

  function ensureCanvas(){
    const cosmos=document.querySelector('.cosmos');
    if(!cosmos)return false;
    let canvas=document.getElementById('helios-stellar-canvas');
    if(!canvas){
      canvas=document.createElement('canvas');
      canvas.id='helios-stellar-canvas';
      canvas.className='helios-stellar-canvas';
      canvas.setAttribute('aria-hidden','true');
      cosmos.prepend(canvas);
    }
    state.canvas=canvas;
    state.ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    return Boolean(state.ctx);
  }

  function injectStyles(){
    if(document.getElementById('helios-stellar-nav-styles'))return;
    const style=document.createElement('style');
    style.id='helios-stellar-nav-styles';
    style.textContent=`
      .cosmos:before{background-image:none!important;background:none!important}
      .helios-stellar-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:.92;filter:saturate(.93) contrast(1.02)}
      .cosmos>.sun,.cosmos>.station,.cosmos>.orbit-field,.cosmos>.planet-horizon{z-index:1}
      .cosmos>.sun,.cosmos>.station,.cosmos>.orbit-field,.cosmos>.planet-horizon{will-change:opacity}
      @media(prefers-reduced-motion:reduce){.helios-stellar-canvas{opacity:.78}}
    `;
    document.head.appendChild(style);
  }

  function resize(){
    const c=state.canvas;if(!c)return;
    const rect=c.getBoundingClientRect();
    const dpr=Math.min(MAX_DPR,globalThis.devicePixelRatio||1);
    const w=Math.max(1,Math.round(rect.width*dpr));
    const h=Math.max(1,Math.round(rect.height*dpr));
    if(c.width!==w||c.height!==h){c.width=w;c.height=h;state.w=rect.width;state.h=rect.height;state.dpr=dpr;}
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
    if(depth<=.06)return null;
    const focal=(state.h*.5)/Math.tan(state.fov*.5);
    const x=state.w*.5 + focal*(dot(v,b.right)/depth);
    const y=state.h*.5 - focal*(dot(v,b.up)/depth);
    if(x<-30||x>state.w+30||y<-30||y>state.h+30)return null;
    return {x,y,depth};
  }

  function drawHaze(ctx){
    const g=ctx.createRadialGradient(state.w*.70,state.h*.88,0,state.w*.70,state.h*.88,Math.max(state.w,state.h)*.72);
    g.addColorStop(0,'rgba(70,91,140,.075)');g.addColorStop(.36,'rgba(35,52,84,.035)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h);
  }

  function drawStar(ctx,star,p,ts,motionX,motionY){
    const bright=star.realAnchor ? clamp(1.15-(star.mag+1.5)*.10,.52,1) : clamp((6.8-star.mag)/4.1,.11,.68);
    const twinkle=1+(state.reducedMotion?0:Math.sin(ts*.0011+star.twinkle)*.07);
    const alpha=clamp(bright*twinkle,.08,1);
    const radius=star.realAnchor ? clamp(2.75-star.mag*.42,1.05,3.2) : (star.mag<4.2?1.05:.62);
    if(state.warp>.035 && !state.reducedMotion){
      const streak=clamp(state.warp*18,0,12);
      ctx.beginPath();ctx.moveTo(p.x-motionX*streak,p.y-motionY*streak);ctx.lineTo(p.x,p.y);
      ctx.strokeStyle=spectralColor(star.spectral,alpha*.42);ctx.lineWidth=Math.max(.45,radius*.42);ctx.stroke();
    }
    ctx.beginPath();ctx.arc(p.x,p.y,radius,0,TAU);ctx.fillStyle=spectralColor(star.spectral,alpha);ctx.fill();
    if(star.realAnchor && star.mag<.7){
      ctx.beginPath();ctx.arc(p.x,p.y,radius*3.1,0,TAU);ctx.fillStyle=spectralColor(star.spectral,.055);ctx.fill();
    }
  }

  function render(ts){
    const ctx=state.ctx;if(!ctx||!state.w||!state.h)return;
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
    ctx.clearRect(0,0,state.w,state.h);
    drawHaze(ctx);
    const b=basis();
    const motionX=Math.sin(state.ra)*.8 + state.yawVelocity*14;
    const motionY=Math.sin(state.dec)*.25 + state.pitchVelocity*14;
    for(const star of state.stars){const p=project(star.v,b);if(p)drawStar(ctx,star,p,ts,motionX,motionY);}
    for(const star of state.anchors){const p=project(star.v,b);if(p)drawStar(ctx,star,p,ts,motionX,motionY);}
    if(state.flash>.01){ctx.fillStyle=`rgba(255,194,75,${Math.min(.065,state.flash*.045)})`;ctx.fillRect(0,0,state.w,state.h);}
  }

  function update(dt){
    const targetEase=1-Math.exp(-dt/(state.reducedMotion?280:900));
    state.ra=easeAngle(state.ra,state.targetRa,targetEase);
    state.dec=lerp(state.dec,state.targetDec,targetEase);
    state.fov=lerp(state.fov,state.targetFov,targetEase);
    if(!state.reducedMotion){
      state.ra=wrap(state.ra+state.yawVelocity*dt*.001);
      state.dec=clamp(state.dec+state.pitchVelocity*dt*.001,-78*DEG,78*DEG);
      state.yawVelocity*=Math.pow(.90,dt/16.7);
      state.pitchVelocity*=Math.pow(.88,dt/16.7);
      state.warp*=Math.pow(.91,dt/16.7);
      state.flash*=Math.pow(.90,dt/16.7);
      state.targetRa=wrap(state.targetRa+.000010*dt);
    }else{
      state.yawVelocity=0;state.pitchVelocity=0;state.warp=0;state.flash*=.8;
    }
  }

  function tick(ts){
    if(!state.visible){state.raf=requestAnimationFrame(tick);return;}
    if(!state.lastTs)state.lastTs=ts;
    const dt=Math.min(80,ts-state.lastTs);state.lastTs=ts;update(dt);
    if(ts-state.lastDraw>=FRAME_MS){state.lastDraw=ts;state.frame++;render(ts);}
    state.raf=requestAnimationFrame(tick);
  }

  function impulse(kind='spin',strength=.35){
    if(state.reducedMotion){state.flash=Math.max(state.flash,.18);return;}
    const s=clamp(strength,0,1);
    const phase=(state.spinCount++%7)-3;
    state.yawVelocity+=((kind==='route'?-1:1)*(.00028+s*.00062));
    state.pitchVelocity+=phase*.000035*s;
    state.warp=Math.max(state.warp,.18+s*.82);
    state.flash=Math.max(state.flash,.15+s*.55);
    state.targetFov=clamp(state.targetFov-(2.2+4*s)*DEG,58*DEG,92*DEG);
    setTimeout(()=>{const base=MODE_TARGETS[state.mode]||MODE_TARGETS.helios;state.targetFov=base.fov;},220+Math.round(s*360));
  }

  function setMode(mode){
    const next=MODE_TARGETS[mode]||MODE_TARGETS.helios;state.mode=mode;state.targetRa=next.ra;state.targetDec=next.dec;state.targetFov=next.fov;impulse('mode',.32);
  }

  function setRoute(route){
    state.route=route||'MARKETPLACE';const off=ROUTE_OFFSETS[state.route]||[0,0];
    const base=MODE_TARGETS[state.mode]||MODE_TARGETS.helios;
    state.targetRa=wrap(base.ra+off[0]*DEG);state.targetDec=clamp(base.dec+off[1]*DEG,-75*DEG,75*DEG);impulse('route',.22);
  }

  function bindEvents(){
    const spin=document.getElementById('spin');
    spin?.addEventListener('pointerdown',()=>impulse('spin',.42),{passive:true});
    document.getElementById('auto-spin')?.addEventListener('pointerdown',()=>impulse('spin',.30),{passive:true});
    window.addEventListener('helios:cascade',e=>{const m=Number(e.detail?.multiplier||1);impulse('cascade',m>=64?.86:m>=16?.65:.42);});
    window.addEventListener('helios:bonus-wheel-start',()=>impulse('bonus',.78));
    window.addEventListener('helios:bonus-wheel-complete',()=>impulse('bonus',.28));
    window.addEventListener('helios:bonus-session-start',()=>impulse('bonus',.58));
    window.addEventListener('helios:bonus-session-complete',()=>impulse('bonus',.24));
    window.addEventListener('helios:director-state',e=>{if(e.detail?.phase==='DIVERGENCE')impulse('director',clamp(Number(e.detail?.divergence||.25),.1,.7));});

    let mode=document.body.dataset.gameMode||'helios';setMode(mode);
    new MutationObserver(()=>{const next=document.body.dataset.gameMode||'helios';if(next!==mode){mode=next;setMode(next);}}).observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    const route=document.getElementById('selected-route');
    if(route){let prev=route.textContent.trim()||'MARKETPLACE';setRoute(prev);new MutationObserver(()=>{const next=route.textContent.trim();if(next&&next!==prev){prev=next;setRoute(next);}}).observe(route,{childList:true,characterData:true,subtree:true});}

    addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{state.visible=!document.hidden;state.lastTs=0;});
    motionQuery?.addEventListener?.('change',e=>{state.reducedMotion=Boolean(e.matches);if(state.reducedMotion){state.yawVelocity=0;state.pitchVelocity=0;state.warp=0;}render(performance.now());});
  }

  function init(){
    injectStyles();
    if(!ensureCanvas())return;
    resize();
    const area=Math.max(1,state.w*state.h);
    const count=clamp(Math.round(area/1800),420,1100);
    state.stars=buildSyntheticSky(count);
    state.anchors=buildAnchorVectors();
    bindEvents();
    state.raf=requestAnimationFrame(tick);
    window.HELIOS_STELLAR_NAVIGATOR=Object.freeze({
      version:VERSION,
      getState:()=>({version:VERSION,mode:state.mode,route:state.route,ra_rad:state.ra,dec_rad:state.dec,fov_rad:state.fov,reduced_motion:state.reducedMotion,synthetic_star_count:state.stars.length,real_anchor_count:state.anchors.length,presentation_only:true,rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'}),
      impulse:(strength=.3)=>impulse('external',clamp(strength,0,1))
    });
    dispatchEvent(new CustomEvent('helios:stellar-ready',{detail:{version:VERSION,presentation_only:true,scientific_catalog:false,external_code_imported:false}}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
