(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const qa = sel => [...document.querySelectorAll(sel)];

  const MODES = {
    helios:{name:'HELIOS',subtitle:'Universal Core',lines:3,payoutScale:1,core:'☀',symbols:[['☀',1.60],['⬡',1.30],['◈',1.10],['⚙',.90],['✦',.72],['∆',.52],['◇',.36]],feature:'3+ ☀ anywhere on a settled non-bonus grid can ignite the natural Solar Corona wheel. BUY BONUS starts a separate Solar Free Spins session.'},
    divine:{name:'DIVINE',subtitle:'Radiant Lattice',lines:5,payoutScale:.58,core:'✦',symbols:[['✦',1.60],['☼',1.30],['◇',1.10],['△',.90],['❖',.72],['✧',.52],['⬡',.36]],feature:'Five-line radiant profile. Cascades and the shared x1 → x4 → x16 → x64 ladder remain active.'},
    gridjack:{name:'GRIDJACK',subtitle:'Treasury Pulse',lines:9,payoutScale:.34,core:'◈',symbols:[['◈',1.60],['⬢',1.30],['⚡',1.10],['⬡',.90],['◆',.72],['⬣',.52],['◇',.36]],feature:'Nine-line treasury profile. This mode can accrue demo Spin Energy while an eligible compute route is actively streaming.'},
    custom:{name:'CUSTOM',subtitle:'Builder Profile',lines:3,payoutScale:.82,core:'⚙',symbols:[['⚙',1.60],['⌘',1.30],['⧉',1.10],['⧫',.90],['◌',.72],['◇',.52],['⬡',.36]],feature:'Buyer-facing configurable presentation profile with three demo paths.'}
  };

  let guideOpen = false;
  let lastFocus = null;

  const currentModeKey = () => document.body.dataset.gameMode || 'helios';
  const currentMode = () => MODES[currentModeKey()] || MODES.helios;
  const currentBet = () => Math.max(.01, Number($('bet')?.value || .1));
  const round2 = n => Math.round((Number(n)||0)*100)/100;

  function injectStyles(){
    if($('slot-ux-styles')) return;
    const s=document.createElement('style');
    s.id='slot-ux-styles';
    s.textContent=`
      .helios-bet-stepper{display:inline-grid;grid-template-columns:34px minmax(78px,1fr) 34px;gap:5px;align-items:center}.helios-bet-step{height:34px;border:1px solid #34434e;border-radius:8px;background:linear-gradient(180deg,#111922,#080d12);color:#dce3e7;font:950 16px/1 ui-monospace,SFMono-Regular,Consolas,monospace;display:grid;place-items:center;box-shadow:inset 0 1px #ffffff08}.helios-bet-step:hover,.helios-bet-step:focus{border-color:var(--mode);color:#fff2ba;outline:none;box-shadow:0 0 12px var(--mode-soft)}.helios-bet-step:active{transform:translateY(1px)}.helios-bet-step:disabled{opacity:.32;cursor:not-allowed}.helios-bet-stepper .helios-bet-picker{min-width:0}.helios-bet-stepper .helios-bet-button{width:100%;min-width:78px}
      .reels.win-focus .cell{opacity:.28;filter:saturate(.55) brightness(.72);transition:opacity .16s,filter .16s,transform .16s,box-shadow .16s}.reels.win-focus .cell.hit{opacity:1;filter:none}.reels.win-focus .cell.cascade-out,.reels.win-focus .cell.cascade-in{opacity:1;filter:none}
      .slot-guide-overlay{position:fixed;z-index:870;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:#010306df;backdrop-filter:blur(12px)}.slot-guide-overlay.open{display:flex}.slot-guide-card{width:min(720px,96vw);max-height:88dvh;overflow:auto;border:1px solid #3d4a54;border-radius:18px;background:linear-gradient(180deg,#0e161eef,#05090df8);box-shadow:0 28px 100px #000d;padding:16px;color:#edf2f4}.slot-guide-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-bottom:1px solid #26323a;padding-bottom:10px}.slot-guide-head h3{margin:0;color:var(--mode);font-size:16px;letter-spacing:.08em}.slot-guide-head p{margin:3px 0 0;color:#83919a;font-size:8px;line-height:1.45}.slot-guide-close{border:1px solid #394750;background:#091017;color:#aeb9c0;border-radius:9px;min-width:42px;min-height:36px}.slot-guide-section{margin-top:12px;border:1px solid #26333c;border-radius:12px;background:#071017;padding:11px}.slot-guide-section h4{margin:0 0 8px;color:#dfe7eb;font-size:9px;letter-spacing:.08em}.slot-guide-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.slot-guide-stat{border:1px solid #2d3942;border-radius:9px;background:#050b10;padding:8px;text-align:center}.slot-guide-stat b{display:block;color:#fff0b2;font:900 13px ui-monospace,SFMono-Regular,Consolas,monospace}.slot-guide-stat span{display:block;color:#71808a;font:6px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:3px}.slot-guide-table{width:100%;border-collapse:collapse;font:8px ui-monospace,SFMono-Regular,Consolas,monospace}.slot-guide-table th,.slot-guide-table td{padding:7px 6px;border-bottom:1px solid #1e2931;text-align:right}.slot-guide-table th:first-child,.slot-guide-table td:first-child{text-align:left}.slot-guide-table th{color:#7f8d96;font-size:6px;letter-spacing:.08em}.slot-guide-symbol{font-size:17px;color:#fff}.slot-guide-feature{color:#96a5ae;font-size:8px;line-height:1.55}.slot-guide-feature strong{color:var(--mode)}.slot-guide-boundary{color:#81909a;font-size:7px;line-height:1.5}.slot-guide-boundary b{color:#7dffb0}.slot-guide-bet-note{color:#ffd76d}.slot-guide-tool{white-space:nowrap}
      @media(max-width:620px){.helios-bet-stepper{grid-template-columns:38px minmax(76px,1fr) 38px;width:100%}.helios-bet-step{height:44px}.slot-guide-overlay{padding:max(10px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom))}.slot-guide-card{width:100%;max-height:calc(100dvh - 20px);padding:13px}.slot-guide-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.slot-guide-table{font-size:7px}.slot-guide-table th,.slot-guide-table td{padding:6px 4px}}
    `;
    document.head.appendChild(s);
  }

  function moveBetPickerIntoStepper(){
    const select=$('bet');
    const picker=document.querySelector('.helios-bet-picker');
    const betbox=select?.closest('.betbox');
    if(!select||!picker||!betbox||$('helios-bet-stepper')) return false;
    const wrap=document.createElement('div');wrap.id='helios-bet-stepper';wrap.className='helios-bet-stepper';
    const minus=document.createElement('button');minus.id='bet-step-down';minus.type='button';minus.className='helios-bet-step';minus.setAttribute('aria-label','Decrease demo bet');minus.textContent='−';
    const plus=document.createElement('button');plus.id='bet-step-up';plus.type='button';plus.className='helios-bet-step';plus.setAttribute('aria-label','Increase demo bet');plus.textContent='+';
    picker.before(wrap);wrap.append(minus,picker,plus);
    const step=delta=>{
      if(select.disabled) return;
      const options=[...select.options];const current=Math.max(0,options.findIndex(o=>o.value===select.value));const next=Math.max(0,Math.min(options.length-1,current+delta));
      if(next===current) return;
      select.value=options[next].value;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));
      if(navigator.vibrate) navigator.vibrate(7);
    };
    minus.addEventListener('click',()=>step(-1));plus.addEventListener('click',()=>step(1));
    const sync=()=>{const options=[...select.options];const i=Math.max(0,options.findIndex(o=>o.value===select.value));minus.disabled=select.disabled||i<=0;plus.disabled=select.disabled||i>=options.length-1;};
    select.addEventListener('change',sync);new MutationObserver(sync).observe(select,{attributes:true,attributeFilter:['disabled','value']});sync();return true;
  }

  function payoutFor(mode,base,count,bet){
    const factor=count===5?4:count===4?2:1;
    return round2(bet*base*factor*mode.payoutScale);
  }

  function guideHtml(){
    const mode=currentMode(),bet=currentBet();
    const rows=mode.symbols.map(([symbol,base],i)=>`<tr><td><span class="slot-guide-symbol">${symbol}</span>${i===0?' <small style="color:var(--mode)">CORE</small>':''}</td><td>${base.toFixed(2)}</td><td>${payoutFor(mode,base,3,bet).toFixed(2)}</td><td>${payoutFor(mode,base,4,bet).toFixed(2)}</td><td>${payoutFor(mode,base,5,bet).toFixed(2)}</td></tr>`).join('');
    const bonusCost=round2(bet*50);
    return `<div class="slot-guide-head"><div><h3>ⓘ HELIOS GAME GUIDE · ${mode.name}</h3><p>Transparent demo rules for the currently selected profile. Values below recalculate from the current BET.</p></div><button id="slot-guide-close" class="slot-guide-close" type="button">✕</button></div>
      <section class="slot-guide-section"><div class="slot-guide-summary"><div class="slot-guide-stat"><b>${mode.lines}</b><span>PAYLINES / PATHS</span></div><div class="slot-guide-stat"><b>${mode.core}</b><span>SIGNATURE CORE</span></div><div class="slot-guide-stat"><b>x1→x64</b><span>CASCADE LADDER</span></div><div class="slot-guide-stat"><b>${bet.toFixed(2)}</b><span>CURRENT BET</span></div></div></section>
      <section class="slot-guide-section"><h4>PAYTABLE · CURRENT BET <span class="slot-guide-bet-note">${bet.toFixed(2)}</span></h4><table class="slot-guide-table"><thead><tr><th>SYMBOL</th><th>BASE</th><th>3×</th><th>4×</th><th>5×</th></tr></thead><tbody>${rows}</tbody></table></section>
      <section class="slot-guide-section"><h4>FEATURES</h4><div class="slot-guide-feature"><strong>${mode.name}</strong> — ${mode.feature}<br><br><strong>CASCADES</strong> — every paid line removes its winning symbols, the remaining symbols collapse, new symbols refill from above, and another paid cascade advances the ladder x1 → x4 → x16 → x64.<br><br><strong>HELIOS BONUS BUY</strong> — in HELIOS mode the current public demo cost is <span class="slot-guide-bet-note">50× BET = ${bonusCost.toFixed(2)} demo units</span>. The purchase review must be explicitly confirmed before anything is deducted.<br><br><strong>WIN FOCUS</strong> — non-winning cells temporarily dim while paid hit cells and the trace remain emphasized.</div></section>
      <section class="slot-guide-section"><h4>DEMO BOUNDARY</h4><div class="slot-guide-boundary"><b>Gameplay and compute remain independent.</b> The selected route, compute units, receipts, Lucky Contribution and World Matrix do not improve RNG, RTP, paylines, cascades or bonus probability. This public page uses demo units and is not a certified real-money game math package.</div></section>`;
  }

  function buildGuide(){
    if(!$('slot-guide-overlay')){
      const overlay=document.createElement('div');overlay.id='slot-guide-overlay';overlay.className='slot-guide-overlay';overlay.setAttribute('aria-hidden','true');
      const card=document.createElement('section');card.id='slot-guide-card';card.className='slot-guide-card';card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');overlay.appendChild(card);document.body.appendChild(overlay);
      overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)closeGuide();});
    }
    const tools=$('helios-game-tools');
    if(tools&&!$('slot-guide-btn')){const btn=document.createElement('button');btn.id='slot-guide-btn';btn.className='game-tool slot-guide-tool';btn.type='button';btn.textContent='ⓘ GAME GUIDE';btn.addEventListener('click',openGuide);const matrix=$('mode-matrix-btn');matrix?.before(btn);}
    return Boolean($('slot-guide-overlay')&&$('slot-guide-btn'));
  }

  function openGuide(){
    const overlay=$('slot-guide-overlay'),card=$('slot-guide-card');if(!overlay||!card)return;lastFocus=document.activeElement;card.innerHTML=guideHtml();overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');guideOpen=true;$('slot-guide-close')?.addEventListener('click',closeGuide);setTimeout(()=>$('slot-guide-close')?.focus(),30);
  }

  function closeGuide(){
    const overlay=$('slot-guide-overlay');if(!overlay)return;overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');guideOpen=false;if(lastFocus?.focus)setTimeout(()=>lastFocus.focus(),20);
  }

  function observeWinFocus(){
    const reels=$('reels');if(!reels||reels.dataset.winFocusBound==='1')return false;reels.dataset.winFocusBound='1';
    const sync=()=>{const any=Boolean(reels.querySelector('.cell.hit'));reels.classList.toggle('win-focus',any);};
    new MutationObserver(sync).observe(reels,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});sync();return true;
  }

  function observeModeAndBet(){
    new MutationObserver(()=>{if(guideOpen)openGuide();}).observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    $('bet')?.addEventListener('change',()=>{if(guideOpen)openGuide();});
  }

  function bindKeyboard(){
    document.addEventListener('keydown',e=>{if(guideOpen&&e.key==='Escape'){e.preventDefault();closeGuide();}},true);
  }

  function init(){
    injectStyles();observeModeAndBet();bindKeyboard();
    let tries=0;const attach=()=>{const a=moveBetPickerIntoStepper(),b=buildGuide(),c=observeWinFocus();if(a&&b&&c)return;if(++tries<120)setTimeout(attach,75);};attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
