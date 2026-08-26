(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const qa = sel => [...document.querySelectorAll(sel)];

  const DEFAULT_POLICY = {
    enabled:true,
    eligible_game_modes:['helios'],
    trigger_symbol:'☀',
    trigger_count:3,
    multipliers:[2,3,4,5,8,10,16,25],
    reward_ledger:'SOLAR_BONUS_BANK',
    real_money_value:false,
    affects_compute:false,
    affects_rng:false,
    affects_route:false
  };

  const DEFAULT_BUY_POLICY = {
    enabled:true,
    eligible_game_modes:['helios'],
    feature:'SOLAR_CORONA',
    cost_multiplier_of_demo_bet:50,
    purchase_currency:'DEMO_PRESENTATION_UNITS',
    real_money_value:false,
    production_enabled:false,
    affects_compute:false,
    affects_compute_route:false
  };

  let policy={...DEFAULT_POLICY};
  let buyPolicy={...DEFAULT_BUY_POLICY};
  let bonusBank=0;
  let bonusCount=0;
  let bonusBuyCount=0;
  let lastSpinCount=0;
  let busy=false;
  let rawCoreBalance=1000;
  let demoBuySpend=0;
  let lastAdjustedBalance='';
  let balanceObserver=null;

  function secureIndex(max){
    const a=new Uint32Array(1);
    if(globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(a);
    else a[0]=Math.floor(Math.random()*0xffffffff);
    return a[0]%max;
  }

  async function loadPolicy(){
    try{
      const r=await fetch('./config/helios.public.json',{cache:'no-store'});
      if(!r.ok) return;
      const cfg=await r.json();
      const p=cfg?.demo_solar_corona || {};
      const b=cfg?.demo_bonus_buy || {};
      policy={
        ...DEFAULT_POLICY,...p,
        eligible_game_modes:Array.isArray(p.eligible_game_modes)&&p.eligible_game_modes.length?p.eligible_game_modes:DEFAULT_POLICY.eligible_game_modes,
        multipliers:Array.isArray(p.multipliers)&&p.multipliers.length?p.multipliers.map(Number).filter(x=>Number.isFinite(x)&&x>0):DEFAULT_POLICY.multipliers,
        trigger_count:Math.max(3,Math.min(8,Number(p.trigger_count||DEFAULT_POLICY.trigger_count))),
        real_money_value:false,affects_compute:false,affects_rng:false,affects_route:false,reward_ledger:'SOLAR_BONUS_BANK'
      };
      buyPolicy={
        ...DEFAULT_BUY_POLICY,...b,
        eligible_game_modes:Array.isArray(b.eligible_game_modes)&&b.eligible_game_modes.length?b.eligible_game_modes:DEFAULT_BUY_POLICY.eligible_game_modes,
        cost_multiplier_of_demo_bet:Math.max(1,Math.min(500,Number(b.cost_multiplier_of_demo_bet||DEFAULT_BUY_POLICY.cost_multiplier_of_demo_bet))),
        real_money_value:false,production_enabled:false,affects_compute:false,affects_compute_route:false
      };
    }catch(_){ }
  }

  function injectStyles(){
    if($('solar-corona-styles')) return;
    const style=document.createElement('style');
    style.id='solar-corona-styles';
    style.textContent=`
      .solar-bonus-chip{border:1px solid #513a14;background:#100b04;border-radius:8px;padding:4px 7px;color:#9a8254;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.solar-bonus-chip b{color:#ffd36a;margin-left:4px}
      .solar-corona-overlay{position:fixed;z-index:720;inset:0;display:grid;place-items:center;padding:18px;background:radial-gradient(circle at 50% 45%,#5e300b32,#010306e8 55%);backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:opacity .2s}.solar-corona-overlay.show{opacity:1;pointer-events:auto}
      .solar-corona-card{width:min(500px,94vw);border:1px solid #7e581d;border-radius:22px;background:linear-gradient(180deg,#171006f2,#06090df7);box-shadow:0 0 90px #ffae2b2a,0 34px 120px #000;padding:18px;text-align:center;overflow:hidden;position:relative}.solar-corona-card:before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,#ffb52a0b,transparent,#ffd96a10,transparent);animation:coronaAmbient 8s linear infinite;pointer-events:none}
      .solar-corona-kicker{position:relative;color:#ffc54f;font:900 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.2em}.solar-corona-title{position:relative;font-size:23px;margin:5px 0 2px}.solar-corona-sub{position:relative;color:#8f9aa2;font-size:8px;letter-spacing:.08em}
      .corona-stage{position:relative;width:310px;height:310px;margin:10px auto 4px}.corona-ring{position:absolute;inset:20px;border:1px dashed #92662555;border-radius:50%;box-shadow:0 0 60px #ffb43215,inset 0 0 55px #ffb43212}.corona-ring:before,.corona-ring:after{content:"";position:absolute;border-radius:50%;border:1px solid #ffcf6540;inset:28px}.corona-ring:after{inset:64px;border-style:dotted;opacity:.65}
      .corona-sun{position:absolute;left:50%;top:50%;width:112px;height:112px;transform:translate(-50%,-50%);border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#fffad0 0 8%,#ffd865 9% 20%,#ff9f1c 31%,#6d3b09 48%,#140d04 68%);box-shadow:0 0 32px #ffd05caa,0 0 85px #ff9c1d44,inset 0 0 28px #fff4a655;color:#2b1600;font-size:35px;font-weight:950;z-index:4;animation:coronaSunPulse 1.3s ease-in-out infinite alternate}
      .corona-pointer{position:absolute;left:50%;top:50%;width:3px;height:126px;transform-origin:50% 0;z-index:5;pointer-events:none}.corona-pointer:after{content:"";position:absolute;left:-6px;bottom:-3px;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:18px solid #fff2b0;filter:drop-shadow(0 0 8px #ffc34b)}
      .corona-ray{position:absolute;left:50%;top:50%;width:68px;height:38px;margin:-19px -34px;display:grid;place-items:center;border:1px solid #4b391c;border-radius:11px;background:#090c0f;color:#d7c291;font:900 11px ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:inset 0 0 15px #ffb63108;transition:.22s;z-index:3}.corona-ray.selected{border-color:#ffd15f;background:#2a1b06;color:#fff2bd;box-shadow:0 0 24px #ffc03d66,inset 0 0 20px #ffb42d22;transform:var(--ray-transform) scale(1.12)!important}
      .solar-corona-result{position:relative;min-height:43px;margin-top:2px;font:900 25px/1.1 ui-monospace,SFMono-Regular,Consolas,monospace;color:#ffd76d;text-shadow:0 0 18px #ffb62a33}.solar-corona-result small{display:block;color:#89959e;font:700 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;margin-top:5px}.solar-corona-ledger{position:relative;border-top:1px solid #2d271c;margin-top:10px;padding-top:9px;color:#746f65;font-size:7px;line-height:1.45}.solar-corona-ledger b{color:#d8bc78}
      .bonus-buy-panel{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center;border:1px solid #594119;background:linear-gradient(90deg,#100b04e8,#0a0d11e8);border-radius:11px;padding:9px 10px;margin:7px 0}.bonus-buy-title{font:900 9px ui-monospace,SFMono-Regular,Consolas,monospace;color:#ffc957;letter-spacing:.08em}.bonus-buy-meta{font:7px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;color:#7f8b93;margin-top:3px}.bonus-buy-meta b{color:#d7c083}.bonus-buy-btn{min-width:132px;border:1px solid #8a641f;border-radius:9px;background:linear-gradient(180deg,#2b1d07,#100b04);color:#ffd86d;padding:8px 10px;font:900 8px/1.25 ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:0 0 16px #ffc34114}.bonus-buy-btn:disabled{opacity:.38}.bonus-buy-btn small{display:block;color:#9d8757;font-size:6px;margin-top:2px}.bonus-buy-status{color:#8b96a0}
      @keyframes coronaAmbient{to{transform:rotate(360deg)}}@keyframes coronaSunPulse{from{transform:translate(-50%,-50%) scale(.98)}to{transform:translate(-50%,-50%) scale(1.04)}}
      @media(max-width:520px){.corona-stage{width:275px;height:275px}.corona-sun{width:96px;height:96px}.corona-pointer{height:111px}.corona-ray{width:60px;font-size:10px}.bonus-buy-panel{grid-template-columns:1fr}.bonus-buy-btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function buildUI(){
    if(!$('solar-corona-overlay')){
      const overlay=document.createElement('div');
      overlay.id='solar-corona-overlay';overlay.className='solar-corona-overlay';
      overlay.innerHTML=`<section class="solar-corona-card" role="dialog" aria-modal="true" aria-labelledby="solar-corona-title"><div class="solar-corona-kicker">☀ HELIOS FEATURE</div><h3 id="solar-corona-title" class="solar-corona-title">SOLAR CORONA BONUS</h3><div id="solar-corona-sub" class="solar-corona-sub">3 SUNS IGNITE THE CORONA</div><div class="corona-stage"><div class="corona-ring"></div><div id="corona-rays"></div><div id="corona-pointer" class="corona-pointer"></div><div class="corona-sun">☀</div></div><div id="solar-corona-result" class="solar-corona-result">IGNITING…<small>DEMO BONUS FEATURE</small></div><div class="solar-corona-ledger"><b>SOLAR BONUS BANK</b> · separate demo-only ledger · no real-money value · no compute or route effect.</div></section>`;
      document.body.appendChild(overlay);
    }

    const tools=$('helios-game-tools');
    if(tools&&!$('solar-bonus-chip')){const chip=document.createElement('span');chip.id='solar-bonus-chip';chip.className='solar-bonus-chip';chip.innerHTML='☀ CORONA <b id="solar-bonus-bank">0.00</b>';tools.querySelector('.session-mini')?.appendChild(chip);}

    if(!$('bonus-buy-panel')){
      const panel=document.createElement('section');panel.id='bonus-buy-panel';panel.className='bonus-buy-panel';
      panel.innerHTML=`<div><div class="bonus-buy-title">☀ BUY SOLAR CORONA · DEMO</div><div id="bonus-buy-meta" class="bonus-buy-meta">Capability demo only. Production real-money feature buy is disabled.</div><div id="bonus-buy-status" class="bonus-buy-meta bonus-buy-status">HELIOS mode required.</div></div><button id="bonus-buy-btn" class="bonus-buy-btn" type="button">BUY CORONA<small id="bonus-buy-cost">--</small></button>`;
      document.querySelector('.game-controls')?.after(panel);
      $('bonus-buy-btn')?.addEventListener('click',buyBonus);
    }
    renderRays();updateBuyUI();
  }

  function renderRays(){
    const host=$('corona-rays');if(!host)return;host.innerHTML='';const values=policy.multipliers;
    values.forEach((m,i)=>{const angle=(360/values.length)*i,ray=document.createElement('div');ray.className='corona-ray';ray.dataset.index=String(i);const transform=`rotate(${angle}deg) translateY(-130px) rotate(${-angle}deg)`;ray.style.setProperty('--ray-transform',transform);ray.style.transform=transform;ray.textContent=`x${m}`;host.appendChild(ray);});
  }

  function currentMode(){return document.body.dataset.gameMode||'helios';}
  function currentBet(){return Math.max(.01,Number($('bet')?.value||.1));}
  function countTriggerSymbols(){const symbol=String(policy.trigger_symbol||'☀');return qa('#reels .cell').filter(c=>c.textContent.trim()===symbol).length;}
  function eligible(){return Boolean(policy.enabled&&policy.eligible_game_modes.includes(currentMode()));}
  function buyEligible(){return Boolean(buyPolicy.enabled&&buyPolicy.eligible_game_modes.includes(currentMode()));}
  function buyCost(){return Math.round(currentBet()*buyPolicy.cost_multiplier_of_demo_bet*100)/100;}
  function adjustedBalance(){return Math.max(0,Math.round((rawCoreBalance-demoBuySpend)*100)/100);}

  function renderAdjustedBalance(){
    const el=$('balance');if(!el)return;const text=adjustedBalance().toFixed(2);lastAdjustedBalance=text;if(el.textContent!==text)el.textContent=text;updateBuyUI();
  }

  function observeBalance(){
    const el=$('balance');if(!el||balanceObserver)return false;rawCoreBalance=Number(el.textContent||1000);
    balanceObserver=new MutationObserver(()=>{const text=el.textContent.trim();if(text===lastAdjustedBalance)return;const raw=Number(text);if(Number.isFinite(raw)){rawCoreBalance=raw;renderAdjustedBalance();}});
    balanceObserver.observe(el,{childList:true,characterData:true,subtree:true});renderAdjustedBalance();return true;
  }

  function updateBuyUI(){
    const btn=$('bonus-buy-btn'),costEl=$('bonus-buy-cost'),status=$('bonus-buy-status'),meta=$('bonus-buy-meta');if(!btn||!costEl||!status)return;
    const cost=buyCost(),available=adjustedBalance(),modeOk=buyEligible(),spinning=Boolean($('spin')?.disabled||$('reels')?.classList.contains('spinning'));
    costEl.textContent=`${buyPolicy.cost_multiplier_of_demo_bet}× BET · COST ${cost.toFixed(2)}`;
    btn.disabled=!modeOk||busy||spinning||available<cost;
    if(meta)meta.innerHTML=`Uses <b>${buyPolicy.purchase_currency}</b> · reward → <b>SOLAR_BONUS_BANK</b> · production real-money buy disabled.`;
    if(!modeOk)status.textContent='Select HELIOS mode to use the Solar Corona capability demo.';
    else if(busy)status.textContent='Solar Corona sequence in progress.';
    else if(available<cost)status.textContent=`Need ${cost.toFixed(2)} demo units · available ${available.toFixed(2)}.`;
    else status.textContent=`Ready · ${cost.toFixed(2)} demo units · no compute/RNG advantage.`;
  }

  async function triggerBonus(symbolCount,{source='SYMBOL_TRIGGER',purchaseCost=0}={}){
    if(busy||!eligible())return false;busy=true;updateBuyUI();
    const multipliers=policy.multipliers.length?policy.multipliers:DEFAULT_POLICY.multipliers,selected=secureIndex(multipliers.length),multiplier=multipliers[selected],reward=Math.round(currentBet()*multiplier*100)/100,overlay=$('solar-corona-overlay'),pointer=$('corona-pointer'),result=$('solar-corona-result'),sub=$('solar-corona-sub');
    qa('.corona-ray').forEach(x=>x.classList.remove('selected'));
    sub.textContent=source==='DEMO_BONUS_BUY'?`PURCHASED DEMO CORONA · COST ${purchaseCost.toFixed(2)}`:`${symbolCount} SUNS · CORONA IGNITION`;
    result.innerHTML='IGNITING…<small>DEMO BONUS FEATURE</small>';overlay.classList.add('show');
    const auto=$('auto-spin');if(auto?.classList.contains('active'))auto.click();
    const angle=(360/multipliers.length)*selected;pointer.style.transition='none';pointer.style.transform='rotate(0deg)';void pointer.offsetWidth;pointer.style.transition='transform 1.45s cubic-bezier(.16,.82,.18,1)';pointer.style.transform=`rotate(${1080+angle}deg)`;
    await new Promise(r=>setTimeout(r,1500));qa('.corona-ray')[selected]?.classList.add('selected');bonusBank=Math.round((bonusBank+reward)*100)/100;bonusCount++;if($('solar-bonus-bank'))$('solar-bonus-bank').textContent=bonusBank.toFixed(2);result.innerHTML=`x${multiplier} · +${reward.toFixed(2)}<small>SOLAR BONUS UNITS · BANK ${bonusBank.toFixed(2)}</small>`;if(navigator.vibrate)navigator.vibrate([18,32,18,32,28]);
    window.dispatchEvent(new CustomEvent('helios:solar-corona',{detail:{symbol_count:symbolCount,multiplier,reward,bonus_bank:bonusBank,bonus_count:bonusCount,reward_ledger:'SOLAR_BONUS_BANK',trigger_source:source,purchase_cost:purchaseCost,real_money_value:false,game_mode:currentMode(),compute_effect:'NONE',route_effect:'NONE'}}));
    if(source==='DEMO_BONUS_BUY')window.dispatchEvent(new CustomEvent('helios:bonus-buy-complete',{detail:{feature:'SOLAR_CORONA',cost:purchaseCost,multiplier,reward,reward_ledger:'SOLAR_BONUS_BANK',real_money_value:false,production_enabled:false,compute_effect:'NONE'}}));
    await new Promise(r=>setTimeout(r,1250));overlay.classList.remove('show');await new Promise(r=>setTimeout(r,220));busy=false;updateBuyUI();return true;
  }

  async function buyBonus(){
    if(!buyEligible()||busy)return;const cost=buyCost(),available=adjustedBalance();if(available<cost){updateBuyUI();return;}
    const auto=$('auto-spin');if(auto?.classList.contains('active'))auto.click();
    demoBuySpend=Math.round((demoBuySpend+cost)*100)/100;bonusBuyCount++;renderAdjustedBalance();
    window.dispatchEvent(new CustomEvent('helios:bonus-buy-start',{detail:{feature:'SOLAR_CORONA',cost,cost_multiplier:buyPolicy.cost_multiplier_of_demo_bet,buy_count:bonusBuyCount,purchase_currency:'DEMO_PRESENTATION_UNITS',real_money_value:false,production_enabled:false,compute_effect:'NONE',rng_effect:'NONE'}}));
    await triggerBonus(policy.trigger_count,{source:'DEMO_BONUS_BUY',purchaseCost:cost});
  }

  function inspectSettledSpin(){if(busy||!eligible())return;const count=countTriggerSymbols();if(count>=policy.trigger_count)triggerBonus(count,{source:'SYMBOL_TRIGGER'});}
  function observeSpins(){const spins=$('total-spins');if(!spins)return;lastSpinCount=Number(spins.textContent||0);new MutationObserver(()=>{const now=Number(spins.textContent||0);if(now===lastSpinCount)return;lastSpinCount=now;setTimeout(inspectSettledSpin,70);}).observe(spins,{childList:true,characterData:true,subtree:true});}

  function observeModeAndBet(){
    new MutationObserver(updateBuyUI).observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
    const bet=$('bet');if(bet){bet.addEventListener('change',updateBuyUI);new MutationObserver(updateBuyUI).observe(bet,{attributes:true,attributeFilter:['value']});}
    const spin=$('spin');if(spin)new MutationObserver(updateBuyUI).observe(spin,{attributes:true,attributeFilter:['disabled']});
  }

  function guardDisplayedBalance(){
    const spin=$('spin');if(!spin)return;
    spin.addEventListener('click',e=>{if(adjustedBalance()+1e-9<currentBet()){e.preventDefault();e.stopImmediatePropagation();updateBuyUI();}},true);
  }

  async function init(){
    await loadPolicy();injectStyles();buildUI();observeSpins();observeModeAndBet();guardDisplayedBalance();
    let tries=0;const attach=()=>{buildUI();if(observeBalance())return;if(++tries<100)setTimeout(attach,80);};attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
