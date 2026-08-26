(() => {
  'use strict';

  const MODE_META = {
    helios: {
      name:'HELIOS', accent:'SOLAR', lines:'3 lines', core:'☀',
      summary:'Balanced universal demo profile.',
      symbols:['☀','⬡','◈','⚙','✦','∆','◇']
    },
    divine: {
      name:'DIVINE', accent:'RADIANT', lines:'5 lines', core:'✦',
      summary:'Radiant lattice profile inspired by DIVINE_REALM.',
      symbols:['✦','☼','◇','△','❖','✧','⬡']
    },
    gridjack: {
      name:'GRIDJACK', accent:'TREASURY', lines:'9 lines', core:'◈',
      summary:'Dense treasury profile with demo Spin Energy support.',
      symbols:['◈','⬢','⚡','⬡','◆','⬣','◇']
    },
    custom: {
      name:'CUSTOM', accent:'BUILDER', lines:'3 paths', core:'⚙',
      summary:'Buyer-configurable presentation profile.',
      symbols:['⚙','⌘','⧉','⧫','◌','◇','⬡']
    }
  };

  const $ = id => document.getElementById(id);
  const q = sel => document.querySelector(sel);
  const qa = sel => [...document.querySelectorAll(sel)];
  const activity = [];
  let soundEnabled = false;
  let audioCtx = null;
  let bestWin = 0;
  let winStreak = 0;
  let lastSpinCount = Number($('total-spins')?.textContent || 0);
  let lastRoute = $('selected-route')?.textContent || 'MARKET';
  let lastComputeState = $('compute-state')?.textContent || 'OFF';
  let lastMode = document.body.dataset.gameMode || 'helios';

  function injectStyles(){
    const style = document.createElement('style');
    style.id = 'helios-polish-styles';
    style.textContent = `
      .helios-ticker{position:relative;z-index:4;height:25px;margin:-4px 0 10px;border:1px solid #26323a;border-radius:9px;background:#050a0ee8;overflow:hidden;display:flex;align-items:center;box-shadow:inset 0 0 18px #0009;backdrop-filter:blur(10px)}
      .helios-ticker-label{flex:0 0 auto;height:100%;display:flex;align-items:center;padding:0 9px;border-right:1px solid #342816;color:var(--solar);font:700 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;background:#171006bb}
      .helios-ticker-window{overflow:hidden;white-space:nowrap;flex:1}.helios-ticker-track{display:inline-block;min-width:100%;padding-left:100%;animation:heliosTicker 30s linear infinite;color:#83909a;font:8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}.helios-ticker strong{color:#c8d1d7}.helios-ticker .good{color:#7dffb0}.helios-ticker .gold{color:#ffc24b}
      @keyframes heliosTicker{from{transform:translateX(0)}to{transform:translateX(-100%)}}

      .game-tools{display:flex;gap:6px;align-items:center;justify-content:flex-end;margin:4px 0 6px;flex-wrap:wrap}.game-tool{border:1px solid #2d3943;background:#070d12;color:#92a0aa;border-radius:8px;padding:5px 8px;font-size:7px;font-weight:850;letter-spacing:.06em}.game-tool:hover{border-color:#56636c;color:#dbe2e6}.game-tool.active{border-color:var(--mode);color:var(--mode);box-shadow:0 0 12px var(--mode-soft)}
      .session-mini{margin-right:auto;display:flex;gap:5px}.session-chip{border:1px solid #26323b;background:#060b0f;border-radius:8px;padding:4px 7px;color:#7e8b95;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.session-chip b{color:#cbd4da;margin-left:3px}

      .helios-overlay{position:fixed;z-index:500;inset:0;display:grid;place-items:center;pointer-events:none;opacity:0;transition:opacity .18s}.helios-overlay.show{opacity:1}.helios-overlay-card{min-width:260px;padding:18px 26px;text-align:center;border:1px solid var(--mode);border-radius:16px;background:radial-gradient(circle at 50% 0,var(--mode-soft),#05090df5 65%);box-shadow:0 0 50px var(--mode-soft),0 30px 100px #000d;transform:scale(.94);transition:transform .22s}.helios-overlay.show .helios-overlay-card{transform:scale(1)}.helios-overlay-kicker{font-size:8px;letter-spacing:.22em;color:var(--mode);font-weight:900}.helios-overlay-value{font:900 42px/1 ui-monospace,SFMono-Regular,Consolas,monospace;color:#ffe18b;text-shadow:0 0 24px var(--mode-soft);margin:6px 0}.helios-overlay-sub{font-size:8px;color:#8997a1;letter-spacing:.08em}

      .helios-modal{position:fixed;z-index:550;inset:0;display:none;align-items:center;justify-content:center;padding:20px;background:#010306d9;backdrop-filter:blur(12px)}.helios-modal.open{display:flex}.helios-modal-card{width:min(620px,96vw);max-height:86vh;overflow:auto;border:1px solid #3a4650;border-radius:18px;background:linear-gradient(180deg,#0d151def,#05090df7);box-shadow:0 30px 100px #000;padding:16px}.helios-modal-head{display:flex;justify-content:space-between;gap:10px;align-items:center;border-bottom:1px solid #243039;padding-bottom:10px}.helios-modal-head h3{margin:0;color:var(--mode);font-size:15px;letter-spacing:.08em}.helios-modal-close{border:1px solid #39454f;background:#091017;color:#aab6be;border-radius:8px;padding:5px 9px}.mode-matrix-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.mode-matrix-card{border:1px solid #26333c;border-radius:12px;background:#071017;padding:10px}.mode-matrix-card.active{border-color:var(--mode);box-shadow:0 0 18px var(--mode-soft)}.mode-matrix-card b{font-size:10px}.mode-matrix-card p{font-size:8px;color:#87949d;line-height:1.45;margin:5px 0}.symbol-row{display:flex;gap:5px;flex-wrap:wrap}.symbol-row i{font-style:normal;border:1px solid #2b3740;background:#050a0e;border-radius:6px;min-width:27px;padding:4px;text-align:center}.modal-boundary{margin-top:12px;border:1px solid #34404a;border-radius:10px;background:#060b0f;padding:10px;font-size:8px;color:#87949d;line-height:1.5}.modal-boundary strong{color:#7dffb0}

      .energy-step{transition:.2s}.energy-step.band-active{border-color:var(--mode)!important;background:linear-gradient(180deg,var(--mode-soft),#080d12)!important;box-shadow:0 0 20px var(--mode-soft),inset 0 0 12px var(--mode-soft)!important;transform:translateX(2px)}.energy-step.band-active b{color:#fff3c5!important}.energy-step{opacity:.64}.energy-step.band-active{opacity:1}
      .cell.alignment{animation:alignmentPulse .7s ease 2;border-color:var(--mode)!important;box-shadow:0 0 22px var(--mode),inset 0 0 20px var(--mode-soft)!important}
      @keyframes alignmentPulse{0%,100%{transform:none}50%{transform:scale(1.08)}}
      .win-trace{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:visible}.win-trace polyline{fill:none;stroke:var(--mode);stroke-width:2;filter:drop-shadow(0 0 5px var(--mode));stroke-linecap:round;stroke-linejoin:round;animation:traceIn .35s ease forwards}.win-trace circle{fill:#fff3bd;filter:drop-shadow(0 0 5px var(--mode))}@keyframes traceIn{from{stroke-dasharray:8 18;opacity:0}to{stroke-dasharray:2 4;opacity:.9}}
      body[data-game-mode="divine"] .sun{filter:hue-rotate(140deg) saturate(.7)}body[data-game-mode="divine"] .orbit-field{box-shadow:inset 0 0 90px #79dfff14}
      body[data-game-mode="gridjack"] .station{filter:hue-rotate(55deg) saturate(1.2)}body[data-game-mode="gridjack"] .orbit-field{box-shadow:inset 0 0 90px #95ff9a10}
      body[data-game-mode="custom"] .sun{filter:hue-rotate(245deg) saturate(.8)}body[data-game-mode="custom"] .orbit-field{box-shadow:inset 0 0 90px #c998ff14}
      @media(max-width:620px){.mode-matrix-grid{grid-template-columns:1fr}.helios-ticker{margin-top:0}.session-mini{width:100%;order:2}.game-tools{justify-content:flex-start}.helios-overlay-card{min-width:220px}.helios-overlay-value{font-size:34px}}
    `;
    document.head.appendChild(style);
  }

  function buildTicker(){
    if($('helios-ticker')) return;
    const ticker=document.createElement('div');
    ticker.id='helios-ticker';
    ticker.className='helios-ticker';
    ticker.setAttribute('aria-live','polite');
    ticker.innerHTML='<div class="helios-ticker-label">LOCAL DEMO ACTIVITY</div><div class="helios-ticker-window"><div id="helios-ticker-track" class="helios-ticker-track"></div></div>';
    q('.hero')?.before(ticker);
    pushActivity('HELIOS interface online');
    pushActivity(`route armed: ${lastRoute}`);
    pushActivity(`mode: ${modeMeta().name}`);
  }

  function pushActivity(text,kind='normal'){
    const stamp=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
    activity.unshift({text,kind,stamp});
    activity.splice(8);
    const track=$('helios-ticker-track');
    if(!track) return;
    track.innerHTML=activity.map(x=>`<span class="${x.kind==='good'?'good':x.kind==='gold'?'gold':''}">[${x.stamp}] <strong>${escapeHtml(x.text)}</strong></span>`).join(' &nbsp; ◇ &nbsp; ');
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function buildTools(){
    if($('helios-game-tools')) return;
    const tools=document.createElement('div');
    tools.id='helios-game-tools';
    tools.className='game-tools';
    tools.innerHTML=`
      <div class="session-mini"><span class="session-chip">STREAK <b id="session-streak">0</b></span><span class="session-chip">BEST <b id="session-best">0.00</b></span></div>
      <button id="mode-matrix-btn" class="game-tool" type="button">⌘ MODE MATRIX</button>
      <button id="sound-toggle" class="game-tool" type="button">♫ SOUND OFF</button>`;
    q('.mode-strip')?.before(tools);
    $('mode-matrix-btn').onclick=openModeMatrix;
    $('sound-toggle').onclick=toggleSound;
  }

  function buildOverlay(){
    if($('helios-result-overlay')) return;
    const el=document.createElement('div');
    el.id='helios-result-overlay';
    el.className='helios-overlay';
    el.setAttribute('aria-live','assertive');
    el.innerHTML='<div class="helios-overlay-card"><div id="overlay-kicker" class="helios-overlay-kicker">SOLAR WIN</div><div id="overlay-value" class="helios-overlay-value">0.00</div><div id="overlay-sub" class="helios-overlay-sub">DEMO UNITS</div></div>';
    document.body.appendChild(el);
  }

  function showOverlay(kicker,value,sub='DEMO UNITS',duration=1000){
    const host=$('helios-result-overlay');
    if(!host) return;
    $('overlay-kicker').textContent=kicker;
    $('overlay-value').textContent=value;
    $('overlay-sub').textContent=sub;
    host.classList.remove('show');
    void host.offsetWidth;
    host.classList.add('show');
    clearTimeout(host.__hideTimer);
    host.__hideTimer=setTimeout(()=>host.classList.remove('show'),duration);
  }

  function buildModal(){
    if($('helios-mode-modal')) return;
    const modal=document.createElement('div');
    modal.id='helios-mode-modal';
    modal.className='helios-modal';
    modal.innerHTML=`<div class="helios-modal-card" role="dialog" aria-modal="true" aria-labelledby="mode-matrix-title">
      <div class="helios-modal-head"><h3 id="mode-matrix-title">HELIOS MODE MATRIX</h3><button id="mode-modal-close" class="helios-modal-close" type="button">CLOSE</button></div>
      <div id="mode-matrix-grid" class="mode-matrix-grid"></div>
      <div class="modal-boundary"><strong>DEMO GAME PROFILE ONLY.</strong> Modes may change symbols, demo paylines and presentation. They do not select compute routes, alter compute rate, improve odds through compute, or change the provider receipt contract.</div>
    </div>`;
    document.body.appendChild(modal);
    $('mode-modal-close').onclick=closeModeMatrix;
    modal.addEventListener('click',e=>{if(e.target===modal) closeModeMatrix();});
  }

  function openModeMatrix(){
    renderModeMatrix();
    $('helios-mode-modal')?.classList.add('open');
  }
  function closeModeMatrix(){ $('helios-mode-modal')?.classList.remove('open'); }

  function renderModeMatrix(){
    const host=$('mode-matrix-grid');
    if(!host) return;
    const current=document.body.dataset.gameMode || 'helios';
    host.innerHTML=Object.entries(MODE_META).map(([key,m])=>`<article class="mode-matrix-card ${key===current?'active':''}"><b>${m.name} · ${m.lines}</b><p>${m.summary}</p><div class="symbol-row">${m.symbols.map(s=>`<i>${escapeHtml(s)}</i>`).join('')}</div></article>`).join('');
  }

  function modeMeta(){ return MODE_META[document.body.dataset.gameMode || 'helios'] || MODE_META.helios; }

  function enhanceSystemStatus(){
    qa('.sys-row').forEach(row=>{
      const label=row.querySelector('span')?.textContent?.trim();
      const value=row.querySelector('b');
      if(label==='ROUTER' && value && !value.id){ value.id='sys-router'; value.textContent=`Armed · ${lastRoute}`; }
      if(label==='LEDGER' && value && !value.id){ value.id='sys-ledger'; }
    });
  }

  function audio(){
    if(!audioCtx){
      const Ctx=window.AudioContext || window.webkitAudioContext;
      if(Ctx) audioCtx=new Ctx();
    }
    return audioCtx;
  }

  function tone(freq=440,duration=.06,gain=.025,type='sine',delay=0){
    if(!soundEnabled) return;
    const ctx=audio(); if(!ctx) return;
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});
    const osc=ctx.createOscillator(); const amp=ctx.createGain();
    const t=ctx.currentTime+delay;
    osc.type=type; osc.frequency.setValueAtTime(freq,t);
    amp.gain.setValueAtTime(0.0001,t); amp.gain.exponentialRampToValueAtTime(gain,t+.01); amp.gain.exponentialRampToValueAtTime(0.0001,t+duration);
    osc.connect(amp).connect(ctx.destination); osc.start(t); osc.stop(t+duration+.02);
  }

  function toggleSound(){
    soundEnabled=!soundEnabled;
    const b=$('sound-toggle');
    if(b){ b.classList.toggle('active',soundEnabled); b.textContent=soundEnabled?'♫ SOUND ON':'♫ SOUND OFF'; }
    if(soundEnabled){ tone(520,.05,.02,'sine'); tone(780,.07,.016,'sine',.05); }
  }

  function classifyWin(win,bet){
    const ratio=bet>0?win/bet:0;
    if(ratio>=64) return {name:'SOLAR FLARE',band:0};
    if(ratio>=16) return {name:'RADIANT WIN',band:1};
    if(ratio>=4) return {name:'PULSE WIN',band:2};
    return {name:'STABLE WIN',band:3};
  }

  function updateEnergyRail(win,bet){
    const steps=qa('.energy-step');
    steps.forEach(x=>x.classList.remove('band-active'));
    const band=win>0?classifyWin(win,bet).band:3;
    steps[band]?.classList.add('band-active');
  }

  function drawWinTrace(){
    const reels=$('reels'); if(!reels) return;
    reels.querySelector('.win-trace')?.remove();
    const hits=qa('#reels .cell.hit');
    if(hits.length<3) return;
    const root=reels.getBoundingClientRect();
    const points=hits.map(cell=>{
      const r=cell.getBoundingClientRect();
      return {x:r.left-root.left+r.width/2,y:r.top-root.top+r.height/2,left:r.left};
    }).sort((a,b)=>a.left-b.left);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','win-trace'); svg.setAttribute('viewBox',`0 0 ${root.width} ${root.height}`); svg.setAttribute('preserveAspectRatio','none');
    const poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    poly.setAttribute('points',points.map(p=>`${p.x},${p.y}`).join(' ')); svg.appendChild(poly);
    points.forEach(p=>{const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r','2.5');svg.appendChild(c);});
    reels.appendChild(svg); setTimeout(()=>svg.remove(),2200);
  }

  function scanAlignment(){
    const meta=modeMeta();
    const cells=qa('#reels .cell');
    const matching=cells.filter(c=>c.textContent.trim()===meta.core);
    cells.forEach(c=>c.classList.remove('alignment'));
    if(matching.length>=3){
      matching.forEach(c=>c.classList.add('alignment'));
      pushActivity(`${meta.name} alignment ×${matching.length} · visual event only`,'gold');
      setTimeout(()=>matching.forEach(c=>c.classList.remove('alignment')),1500);
    }
  }

  function onSpinSettled(){
    const win=Number($('last-win-value')?.textContent || 0);
    const bet=Number($('bet')?.value || 0.1);
    if(win>0){
      winStreak++; bestWin=Math.max(bestWin,win);
      const cls=classifyWin(win,bet);
      showOverlay(cls.name,win.toFixed(2),`${modeMeta().name} · DEMO UNITS`,1100);
      pushActivity(`${modeMeta().name} win +${win.toFixed(2)} demo units`,'good');
      tone(523.25,.08,.025,'sine'); tone(659.25,.09,.022,'sine',.06); tone(783.99,.12,.02,'sine',.12);
      setTimeout(drawWinTrace,30);
    } else {
      winStreak=0; tone(180,.035,.012,'triangle');
    }
    if($('session-streak')) $('session-streak').textContent=String(winStreak);
    if($('session-best')) $('session-best').textContent=bestWin.toFixed(2);
    updateEnergyRail(win,bet);
    scanAlignment();
  }

  function observeCore(){
    const spins=$('total-spins');
    if(spins) new MutationObserver(()=>{
      const now=Number(spins.textContent||0);
      if(now!==lastSpinCount){ lastSpinCount=now; onSpinSettled(); }
    }).observe(spins,{childList:true,characterData:true,subtree:true});

    const route=$('selected-route');
    if(route) new MutationObserver(()=>{
      const now=route.textContent.trim();
      if(now && now!==lastRoute){ lastRoute=now; pushActivity(`route armed: ${now}`,'gold'); tone(420,.04,.012,'sine'); }
    }).observe(route,{childList:true,characterData:true,subtree:true});

    const compute=$('compute-state');
    if(compute) new MutationObserver(()=>{
      const now=compute.textContent.trim();
      if(now && now!==lastComputeState){
        lastComputeState=now; pushActivity(`compute ${now}`,now.includes('ACTIVE')?'good':'normal');
        const ledger=$('sys-ledger'); if(ledger) ledger.textContent=now.includes('ACTIVE')?'Streaming demo':'Simulated';
      }
    }).observe(compute,{childList:true,characterData:true,subtree:true});

    new MutationObserver(()=>{
      const now=document.body.dataset.gameMode||'helios';
      if(now!==lastMode){ lastMode=now; pushActivity(`game profile: ${modeMeta().name}`,'gold'); renderModeMatrix(); }
    }).observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
  }

  function bindUIAudio(){
    $('spin')?.addEventListener('click',()=>{tone(170,.07,.018,'sawtooth');tone(240,.08,.013,'triangle',.04);},{capture:true});
    $('power-on')?.addEventListener('click',()=>{tone(330,.05,.015,'sine');tone(550,.08,.015,'sine',.05);});
    $('power-off')?.addEventListener('click',()=>tone(150,.09,.014,'triangle'));
    q('.route-grid')?.addEventListener('click',e=>{if(e.target.closest('.route')) tone(390,.035,.01,'sine');});
    q('.mode-strip')?.addEventListener('click',e=>{if(e.target.closest('.mode-btn')) tone(620,.04,.01,'sine');});
  }

  function bindKeyboard(){
    window.addEventListener('keydown',e=>{
      if(e.key==='Escape') closeModeMatrix();
      if(e.key.toLowerCase()==='m' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)) openModeMatrix();
    });
  }

  function init(){
    if($('helios-polish-styles')) return;
    injectStyles(); buildTicker(); buildTools(); buildOverlay(); buildModal(); enhanceSystemStatus();
    updateEnergyRail(0,Number($('bet')?.value||.1));
    observeCore(); bindUIAudio(); bindKeyboard(); renderModeMatrix();
    pushActivity('polish layer: ticker · mode matrix · win trace · audio ready');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});
  else setTimeout(init,0);
})();
