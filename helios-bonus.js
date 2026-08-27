(() => {
  'use strict';

  const BONUS_ENGINE_VERSION='1.4.0';
  const $=id=>document.getElementById(id);
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const CORONA_VALUES=[2,3,4,5,8,10,16,25];
  const DEFAULT_POLICY={enabled:true,eligible_mode:'helios',trigger_symbol:'☀',minimum_trigger_count:3,reward_type:'DEMO_MULTIPLIER_BANK',real_money_value:false,compute_effect:'NONE'};
  const DEFAULT_BUY_POLICY={
    enabled:true,
    feature:'SOLAR_CORONA_FREE_SPINS',
    purchase_currency:'DEMO_PRESENTATION_UNITS',
    explicit_confirmation_required:true,
    tier_selection_required:true,
    real_money_value:false,
    production_enabled:false,
    free_spins_only:true,
    retrigger_symbol:'☀',
    retrigger_minimum_count:3,
    tiers:[
      {id:'standard',name:'STANDARD CORONA',cost_multiplier_of_demo_bet:50,free_spins_count:10,retrigger_spins:2,max_total_spins:16,extra_retrigger_chance:0},
      {id:'radiant',name:'RADIANT CORONA',cost_multiplier_of_demo_bet:100,free_spins_count:12,retrigger_spins:2,max_total_spins:20,extra_retrigger_chance:.12},
      {id:'solar_flare',name:'SOLAR FLARE',cost_multiplier_of_demo_bet:175,free_spins_count:15,retrigger_spins:3,max_total_spins:24,extra_retrigger_chance:.20}
    ]
  };

  let policy={...DEFAULT_POLICY};
  let buyPolicy={...DEFAULT_BUY_POLICY,tiers:DEFAULT_BUY_POLICY.tiers.map(x=>({...x}))};
  let naturalBonusBusy=false;
  let lastObservedSpins=Number($('total-spins')?.textContent||0);
  let bonusSessionActive=false;
  let bonusSpinsLeft=0;
  let bonusSessionWin=0;
  let bonusTier=null;
  let observers=[];

  const round2=n=>Math.round((Number(n)||0)*100)/100;
  const safeText=(value,fallback='',max=96)=>String(value??fallback).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max)||String(fallback).slice(0,max);
  const safeTierId=(value,fallback)=>String(value??fallback??'tier').trim().replace(/[^A-Za-z0-9_.-]/g,'_').slice(0,64)||'tier';
  const currentBet=()=>Math.max(.01,Number($('bet')?.value||.1));
  const currentBalance=()=>Math.max(0,Number($('balance')?.textContent||0));
  const currentMode=()=>document.body.dataset.gameMode||'helios';
  const coreApi=()=>window.HELIOS_GAME_CORE||null;
  function secureUint(){const a=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(a);else a[0]=(Math.random()*0xffffffff)>>>0;return a[0]>>>0;}
  function secureUnit(){return secureUint()/0xffffffff;}

  function normalizeTier(raw,fallback,i){
    const f=fallback||DEFAULT_BUY_POLICY.tiers[Math.min(i,DEFAULT_BUY_POLICY.tiers.length-1)]||DEFAULT_BUY_POLICY.tiers[0];
    return {
      id:safeTierId(raw?.id,f.id||`tier_${i+1}`),
      name:safeText(raw?.name,f.name||`BONUS TIER ${i+1}`,80),
      cost_multiplier_of_demo_bet:Math.max(1,Math.min(500,Number(raw?.cost_multiplier_of_demo_bet??f.cost_multiplier_of_demo_bet??50))),
      free_spins_count:Math.max(3,Math.min(30,Number(raw?.free_spins_count??f.free_spins_count??10))),
      retrigger_spins:Math.max(1,Math.min(8,Number(raw?.retrigger_spins??f.retrigger_spins??2))),
      max_total_spins:Math.max(3,Math.min(50,Number(raw?.max_total_spins??f.max_total_spins??16))),
      extra_retrigger_chance:Math.max(0,Math.min(.5,Number(raw?.extra_retrigger_chance??f.extra_retrigger_chance??0)))
    };
  }
  function normalizeBuyPolicy(raw={}){
    const incoming=Array.isArray(raw.tiers)&&raw.tiers.length?raw.tiers:DEFAULT_BUY_POLICY.tiers;
    const tiers=incoming.slice(0,6).map((x,i)=>normalizeTier(x,DEFAULT_BUY_POLICY.tiers[i],i));
    return {
      ...DEFAULT_BUY_POLICY,...raw,
      feature:safeText(raw.feature,DEFAULT_BUY_POLICY.feature,80),
      purchase_currency:safeText(raw.purchase_currency,DEFAULT_BUY_POLICY.purchase_currency,80),
      retrigger_symbol:safeText(raw.retrigger_symbol,DEFAULT_BUY_POLICY.retrigger_symbol,8),
      enabled:raw.enabled!==false,
      explicit_confirmation_required:raw.explicit_confirmation_required!==false,
      tier_selection_required:raw.tier_selection_required!==false,
      real_money_value:false,
      production_enabled:false,
      free_spins_only:true,
      retrigger_minimum_count:Math.max(3,Math.min(5,Number(raw.retrigger_minimum_count||3))),
      tiers
    };
  }

  function injectStyles(){
    if($('solar-corona-styles'))return;
    const s=document.createElement('style');s.id='solar-corona-styles';s.textContent=`
      .solar-corona-overlay{position:fixed;z-index:760;inset:0;display:grid;place-items:center;padding:16px;background:radial-gradient(circle at 50% 45%,#3b2108a8,#020407ed 70%);backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:opacity .18s}.solar-corona-overlay.show{opacity:1;pointer-events:auto}.solar-corona-card{width:min(440px,94vw);border:1px solid #8a641f;border-radius:20px;background:linear-gradient(180deg,#181006f7,#07090df7);box-shadow:0 0 80px #ffb2292e,0 32px 100px #000d;padding:16px;text-align:center}.solar-corona-kicker{color:#ffca59;font:900 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em}.solar-corona-title{margin:5px 0 2px;font-size:22px}.solar-corona-sub{color:#8d969d;font-size:8px;line-height:1.4}.corona-stage{position:relative;width:290px;height:290px;margin:12px auto}.corona-orb{position:absolute;inset:50%;width:62px;height:62px;margin:-31px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#fff6bf 0 8%,#ffd05b 14%,#f49b17 34%,#2c1905 66%);box-shadow:0 0 35px #ffbd3a8c,0 0 80px #ff9a182f;color:#2d1700;font-size:24px;z-index:4}.corona-rays{position:absolute;inset:0;border-radius:50%;border:1px solid #4d3918;background:radial-gradient(circle,#ffb83212 0 30%,transparent 31%),repeating-conic-gradient(from -22.5deg,#f5b94416 0 2deg,transparent 2deg 45deg)}.corona-ray{position:absolute;left:50%;top:50%;width:58px;height:24px;margin:-12px -29px;transform-origin:29px 12px;color:#927e56;font:900 9px ui-monospace,SFMono-Regular,Consolas,monospace;display:grid;place-items:center;border:1px solid #49391d;border-radius:8px;background:#0d0c08}.corona-ray.selected{border-color:#ffe087;color:#fff2bd;background:#3c2808;box-shadow:0 0 18px #ffca5580}.corona-pointer{position:absolute;z-index:5;left:50%;top:50%;width:5px;height:112px;margin:-112px -2.5px 0;border-radius:99px;background:linear-gradient(#fff2aa,#ffb31f);box-shadow:0 0 15px #ffc244;transform-origin:50% 112px}.corona-pointer:before{content:"";position:absolute;top:-7px;left:-5px;width:15px;height:15px;border-radius:50%;background:#fff5c9;box-shadow:0 0 15px #ffc84d}.solar-corona-result{min-height:54px;color:#ffe08c;font:950 35px/1 ui-monospace,SFMono-Regular,Consolas,monospace}.solar-corona-result small{display:block;margin-top:7px;color:#8d7b56;font:800 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em}.solar-bonus-bank{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin:7px 0;padding:8px;border:1px solid #59421d;border-radius:10px;background:#0c0a06}.solar-bonus-bank span{color:#917e59;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.solar-bonus-bank b{color:#ffd66b;font:900 15px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-buy-panel{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin:7px 0;padding:8px;border:1px solid #4a3820;border-radius:10px;background:linear-gradient(180deg,#100c06,#080b0e)}.bonus-buy-copy b{display:block;color:#f0c968;font:900 8px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-buy-copy span{display:block;color:#817661;font:6px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:3px}.bonus-buy-btn{border:1px solid #806020;border-radius:9px;background:linear-gradient(180deg,#ffd35e,#df8f18);color:#271700;padding:8px 10px;font:950 8px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-buy-btn:disabled{opacity:.32}.solar-free-spins-hud{display:none;grid-template-columns:repeat(3,1fr);gap:6px;margin:7px 0;padding:8px;border:1px solid #7b5922;border-radius:10px;background:radial-gradient(circle at 50% 0,#ffb72a1a,#090a0c 72%);box-shadow:0 0 22px #ffc13f10}.solar-free-spins-hud.active{display:grid}.free-spin-stat{border:1px solid #3a321f;border-radius:8px;background:#0a0b0c;padding:7px;text-align:center}.free-spin-stat span{display:block;color:#86795c;font:6px ui-monospace,SFMono-Regular,Consolas,monospace}.free-spin-stat b{display:block;color:#ffe18a;font:900 14px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:3px}.solar-free-spins-hud .session-rule{grid-column:1/-1;text-align:center;color:#776d59;font:6px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-session-active .bonus-buy-btn{opacity:.35;pointer-events:none}.bonus-session-active #auto-spin{opacity:.35;pointer-events:none}@media(max-width:520px){.corona-stage{width:245px;height:245px}.corona-pointer{height:94px;margin-top:-94px;transform-origin:50% 94px}.solar-free-spins-hud{grid-template-columns:1fr 1fr}.solar-free-spins-hud .free-spin-stat:nth-child(3){grid-column:1/-1}.bonus-buy-panel{grid-template-columns:1fr}.bonus-buy-btn{width:100%}}
    `;document.head.appendChild(s);
  }

  function setOverlayResult(primary,secondary=''){
    const result=$('solar-corona-result');if(!result)return;
    const small=document.createElement('small');small.textContent=safeText(secondary,'',128);
    result.replaceChildren(document.createTextNode(safeText(primary,'',64)),small);
  }

  function buildOverlay(){
    if($('solar-corona-overlay'))return;
    const o=document.createElement('div');o.id='solar-corona-overlay';o.className='solar-corona-overlay';o.innerHTML='<section class="solar-corona-card"><div class="solar-corona-kicker">☀ HELIOS · SOLAR EVENT</div><h3 id="solar-corona-title" class="solar-corona-title">SOLAR CORONA</h3><div id="solar-corona-sub" class="solar-corona-sub"></div><div class="corona-stage"><div id="corona-rays" class="corona-rays"></div><div id="corona-pointer" class="corona-pointer"></div><div class="corona-orb">☀</div></div><div id="solar-corona-result" class="solar-corona-result"></div></section>';document.body.appendChild(o);renderRays();
  }
  function renderRays(){const host=$('corona-rays');if(!host)return;host.replaceChildren();CORONA_VALUES.forEach((v,i)=>{const ray=document.createElement('div');ray.className='corona-ray';ray.textContent=`x${v}`;const a=i*45;ray.style.transform=`rotate(${a}deg) translateY(-125px) rotate(${-a}deg)`;host.appendChild(ray);});}
  function buildBank(){if($('solar-bonus-bank'))return;const d=document.createElement('div');d.id='solar-bonus-bank';d.className='solar-bonus-bank';d.innerHTML='<span>SOLAR BONUS BANK · DEMO ONLY</span><b id="solar-bonus-bank-value">x0</b>';document.querySelector('.game-controls')?.before(d);}
  function buildBuyUI(){
    if($('bonus-buy-panel'))return;const d=document.createElement('section');d.id='bonus-buy-panel';d.className='bonus-buy-panel';d.innerHTML='<div class="bonus-buy-copy"><b>☀ SOLAR FREE SPINS</b><span id="bonus-buy-meta">TIERED DEMO BONUS · REVIEW PRICE BEFORE PURCHASE</span></div><button id="bonus-buy" class="bonus-buy-btn" type="button">CHOOSE BONUS</button>';document.querySelector('.game-controls')?.before(d);$('bonus-buy')?.addEventListener('click',requestBonusPurchase);updateBuyUI();
  }
  function buildFreeSpinsHud(){
    if($('solar-free-spins-hud'))return;const h=document.createElement('section');h.id='solar-free-spins-hud';h.className='solar-free-spins-hud';h.innerHTML='<div class="free-spin-stat"><span>SPINS LEFT</span><b id="free-spins-left">0</b></div><div class="free-spin-stat"><span>BONUS WIN</span><b id="free-spins-win">0.00</b></div><div class="free-spin-stat"><span>CURRENT EVENT</span><b id="free-spins-event">STABLE</b></div><div id="free-spins-rule" class="session-rule">Standard game RNG · no forced wins · no compute effect.</div>';document.querySelector('.game-controls')?.before(h);updateFreeSpinsHud();
  }

  function selectedDefaultTier(){return buyPolicy.tiers[0]||DEFAULT_BUY_POLICY.tiers[0];}
  function updateBuyUI(){
    const btn=$('bonus-buy'),meta=$('bonus-buy-meta');if(!btn||!meta)return;const tier=selectedDefaultTier(),cost=round2(currentBet()*tier.cost_multiplier_of_demo_bet),can=buyPolicy.enabled&&!bonusSessionActive&&currentBalance()>=cost;btn.disabled=!can;btn.textContent='CHOOSE BONUS';meta.textContent=`FROM ${tier.cost_multiplier_of_demo_bet}× BET · ${tier.free_spins_count}–${Math.max(...buyPolicy.tiers.map(x=>x.free_spins_count))} STARTING SPINS · DEMO ONLY`;
  }
  function updateFreeSpinsHud(eventText='STABLE'){
    const h=$('solar-free-spins-hud');if(!h)return;h.classList.toggle('active',bonusSessionActive);$('free-spins-left').textContent=String(bonusSpinsLeft);$('free-spins-win').textContent=bonusSessionWin.toFixed(2);$('free-spins-event').textContent=safeText(eventText,'STABLE',40);const rule=$('free-spins-rule');if(rule){const t=bonusTier;rule.textContent=t?`${t.name} · 3+ ${buyPolicy.retrigger_symbol} = +${t.retrigger_spins} · max ${t.max_total_spins} · game-core BONUS source · no forced win.`:'Standard game RNG · no forced wins · no compute effect.';}
  }
  function countTriggerSymbols(){return [...document.querySelectorAll('.cell')].filter(c=>c.textContent===buyPolicy.retrigger_symbol).length;}
  function lockBonusControls(on){document.body.classList.toggle('bonus-session-active',on);const buy=$('bonus-buy');if(buy)buy.disabled=on||buy.disabled;const auto=$('auto-spin');if(auto&&on)auto.click?.();updateBuyUI();}
  function rejectPurchase(reason,detail={}){window.dispatchEvent(new CustomEvent('helios:bonus-buy-rejected',{detail:{reason,...detail,real_money_value:false}}));}

  function requestBonusPurchase(e){
    if(e?.isTrusted===false)return;const tier=selectedDefaultTier(),bet=currentBet(),cost=round2(bet*tier.cost_multiplier_of_demo_bet);if(bonusSessionActive){rejectPurchase('BONUS_SESSION_ACTIVE');return;}if(currentBalance()<cost){rejectPurchase('INSUFFICIENT_DEMO_BALANCE',{cost,available:currentBalance()});return;}window.dispatchEvent(new CustomEvent('helios:bonus-buy-request',{detail:{feature:buyPolicy.feature,bet,default_tier_id:tier.id,tiers:buyPolicy.tiers.map(x=>({...x})),cost,explicit_confirmation_required:true,tier_selection_required:true,real_money_value:false,production_enabled:false,compute_effect:'NONE'}}));
  }

  async function buyBonusAuthorized(event){
    const d=event?.detail||{};if(d.feature!==buyPolicy.feature||d.explicit_consent!==true){rejectPurchase('EXPLICIT_CONFIRMATION_REQUIRED');return;}if(bonusSessionActive){rejectPurchase('BONUS_SESSION_ACTIVE');return;}
    const tier=buyPolicy.tiers.find(x=>x.id===d.tier_id);if(!tier){rejectPurchase('UNKNOWN_TIER',{tier_id:d.tier_id});return;}
    const bet=currentBet(),expectedCost=round2(bet*tier.cost_multiplier_of_demo_bet),authorizedCost=round2(d.cost),authorizedBet=round2(d.bet);if(Math.abs(authorizedCost-expectedCost)>.0001||Math.abs(authorizedBet-round2(bet))>.0001){rejectPurchase('PRICE_OR_BET_CHANGED',{expected_cost:expectedCost,authorized_cost:authorizedCost,current_bet:bet,authorized_bet:authorizedBet});return;}if(currentBalance()<expectedCost){rejectPurchase('INSUFFICIENT_DEMO_BALANCE',{cost:expectedCost,available:currentBalance()});return;}
    const core=coreApi();if(!core?.bonus?.openSession||!core?.bonus?.spin||!core?.ledger?.debitDemoBalance){rejectPurchase('GAME_CORE_BONUS_API_UNAVAILABLE');return;}
    const opened=core.bonus.openSession({feature:buyPolicy.feature,tier_id:tier.id,initial_spins:tier.free_spins_count,max_total_spins:tier.max_total_spins,session_id:`${tier.id}-${Date.now()}`});
    if(!opened?.ok){rejectPurchase(opened?.reason||'BONUS_CORE_SESSION_OPEN_FAILED');return;}
    const debit=core.ledger.debitDemoBalance({amount:expectedCost,reason:'BONUS_PURCHASE'});
    if(!debit?.ok){core.bonus.closeSession(opened.token);rejectPurchase(debit?.reason||'BONUS_CORE_LEDGER_DEBIT_FAILED',{cost:expectedCost,available:currentBalance()});return;}
    window.dispatchEvent(new CustomEvent('helios:bonus-buy-start',{detail:{tier_id:tier.id,tier_name:tier.name,cost:expectedCost,bet,free_spins_count:tier.free_spins_count,retrigger_spins:tier.retrigger_spins,max_total_spins:tier.max_total_spins,source_authority:'GAME_CORE',real_money_value:false,compute_effect:'NONE'}}));
    try{await runPurchasedFreeSpins(expectedCost,tier,opened.token);}catch(error){console.error('[HELIOS BONUS]',error);rejectPurchase('BONUS_SESSION_RUNTIME_ERROR',{message:safeText(error?.message||error,'UNKNOWN',120)});}
  }

  function possibleRetrigger(triggerCount,tier,totalGranted){
    const base=triggerCount>=buyPolicy.retrigger_minimum_count;
    const extra=!base&&tier.extra_retrigger_chance>0&&secureUnit()<tier.extra_retrigger_chance;
    if(!base&&!extra)return {added:0,kind:'NONE'};
    const room=Math.max(0,tier.max_total_spins-totalGranted),wanted=base?tier.retrigger_spins:1,added=Math.min(wanted,room);return {added,kind:added>0?(base?'SUN_RETRIGGER':'TIER_EXTRA_RETRIGGER'):'MAX_REACHED'};
  }

  async function runPurchasedFreeSpins(cost,tier,coreToken){
    const core=coreApi(),coreBonus=core?.bonus;if(!coreBonus?.spin||!coreBonus?.grantSpins||!coreBonus?.closeSession)throw new Error('GAME_CORE_BONUS_API_UNAVAILABLE');
    bonusSessionActive=true;bonusTier=tier;bonusSpinsLeft=tier.free_spins_count;bonusSessionWin=0;let totalGranted=tier.free_spins_count,spinIndex=0;
    lockBonusControls(true);updateFreeSpinsHud('ACTIVATING');
    window.dispatchEvent(new CustomEvent('helios:bonus-session-start',{detail:{feature:buyPolicy.feature,tier_id:tier.id,tier_name:tier.name,spins_awarded:tier.free_spins_count,retrigger_spins:tier.retrigger_spins,max_total_spins:tier.max_total_spins,purchase_cost:cost,source:'bonus',source_authority:'GAME_CORE',real_money_value:false,compute_effect:'NONE'}}));
    await showOverlayMessage('SOLAR FREE SPINS',`${tier.name} · GAME-CORE BONUS SOURCE`,`${tier.free_spins_count} FREE SPINS`,`3+ ${buyPolicy.retrigger_symbol} = +${tier.retrigger_spins} · MAX ${tier.max_total_spins}`,950);
    try{
      while(bonusSpinsLeft>0&&totalGranted<=tier.max_total_spins){
        spinIndex++;updateFreeSpinsHud(`SPIN ${spinIndex}`);
        const coreSpin=await coreBonus.spin(coreToken);if(!coreSpin?.ok)throw new Error(coreSpin?.reason||'BONUS_CORE_SPIN_FAILED');
        const detail=coreSpin.detail||{};bonusSpinsLeft=Math.max(0,bonusSpinsLeft-1);const triggerCount=countTriggerSymbols(),retrigger=possibleRetrigger(triggerCount,tier,totalGranted);let granted=0;
        if(retrigger.added>0){const grant=coreBonus.grantSpins(coreToken,retrigger.added);if(!grant?.ok)throw new Error(grant?.reason||'BONUS_CORE_GRANT_FAILED');granted=Number(grant.granted||0);bonusSpinsLeft+=granted;totalGranted+=granted;}
        const bonusWin=round2(Number(detail.spin_win||0));bonusSessionWin=round2(bonusSessionWin+bonusWin);
        const eventText=granted>0?(retrigger.kind==='SUN_RETRIGGER'?`+${granted} SUNS`:`+${granted} TIER`):'STABLE';updateFreeSpinsHud(eventText);
        window.dispatchEvent(new CustomEvent('helios:bonus-spin',{detail:{feature:buyPolicy.feature,tier_id:tier.id,index:spinIndex,spins_left:bonusSpinsLeft,trigger_symbol_count:triggerCount,retrigger:granted,retrigger_kind:retrigger.kind,spin_win:bonusWin,bonus_win_total:bonusSessionWin,game_balance_effect:'WINNINGS_CREDITED_BY_GAME_CORE',stake_charge:'NONE',source:'bonus',source_authority:'GAME_CORE',core_bonus_remaining:coreSpin.snapshot?.remaining,real_money_value:false,compute_effect:'NONE'}}));
        await sleep(260);
      }
      updateFreeSpinsHud('COMPLETE');
      await showOverlayMessage('BONUS COMPLETE',`${tier.name} · DEMO SESSION`,`${bonusSessionWin.toFixed(2)} WON`,`${spinIndex} SPINS PLAYED · GAME-CORE BONUS SOURCE`,1050);
      window.dispatchEvent(new CustomEvent('helios:bonus-session-complete',{detail:{feature:buyPolicy.feature,tier_id:tier.id,tier_name:tier.name,spins_played:spinIndex,total_spins_granted:totalGranted,bonus_win_total:bonusSessionWin,purchase_cost:cost,source:'bonus',source_authority:'GAME_CORE',stake_refund_bridge:false,real_money_value:false,compute_effect:'NONE'}}));
      window.dispatchEvent(new CustomEvent('helios:bonus-buy-complete',{detail:{tier_id:tier.id,cost,spins_played:spinIndex,bonus_win_total:bonusSessionWin,source_authority:'GAME_CORE',real_money_value:false}}));
    }finally{
      const closed=coreBonus.closeSession(coreToken);if(!closed?.ok)console.warn('[HELIOS BONUS CORE CLOSE]',closed?.reason||'UNKNOWN');bonusSessionActive=false;bonusSpinsLeft=0;bonusTier=null;lockBonusControls(false);updateFreeSpinsHud('STABLE');updateBuyUI();
    }
  }

  async function showOverlayMessage(titleText,subText,primaryText,secondaryText,duration=900){
    const overlay=$('solar-corona-overlay');if(!overlay)return;$('solar-corona-title').textContent=safeText(titleText,'SOLAR EVENT',80);$('solar-corona-sub').textContent=safeText(subText,'',120);setOverlayResult(primaryText,secondaryText);overlay.classList.add('show');await sleep(duration);overlay.classList.remove('show');await sleep(190);
  }

  function setNaturalResult(multiplier){setOverlayResult(`x${multiplier}`,'DEMO MULTIPLIER STORED IN SOLAR BONUS BANK');}
  async function triggerNaturalCorona(){
    if(naturalBonusBusy||bonusSessionActive)return;naturalBonusBusy=true;const overlay=$('solar-corona-overlay'),pointer=$('corona-pointer'),rays=[...document.querySelectorAll('.corona-ray')],idx=Math.floor(secureUnit()*CORONA_VALUES.length),multiplier=CORONA_VALUES[idx];$('solar-corona-title').textContent='SOLAR CORONA';$('solar-corona-sub').textContent='3+ ☀ ON SETTLED HELIOS GRID · PRESENTATION-ONLY WHEEL';setOverlayResult('IGNITING…','NATURAL SOLAR EVENT');rays.forEach(x=>x.classList.remove('selected'));overlay.classList.add('show');const angle=idx*45;pointer.style.transition='none';pointer.style.transform='rotate(0deg)';void pointer.offsetWidth;pointer.style.transition='transform 1.45s cubic-bezier(.16,.82,.18,1)';pointer.style.transform=`rotate(${1080+angle}deg)`;await sleep(1500);rays[idx]?.classList.add('selected');setNaturalResult(multiplier);window.dispatchEvent(new CustomEvent('helios:solar-corona',{detail:{multiplier,reward_type:policy.reward_type,real_money_value:false,compute_effect:'NONE',rng_effect:'PRESENTATION_REWARD_ONLY'}}));await sleep(900);overlay.classList.remove('show');await sleep(190);naturalBonusBusy=false;
  }

  function inspectSettledSpin(){
    if(bonusSessionActive||naturalBonusBusy||currentMode()!==policy.eligible_mode)return;const cells=[...document.querySelectorAll('.cell')];if(cells.some(c=>c.classList.contains('spin')||c.classList.contains('cascade-remove')||c.classList.contains('cascade-refill')))return;const count=cells.filter(c=>c.textContent===policy.trigger_symbol).length;if(count>=policy.minimum_trigger_count)triggerNaturalCorona();
  }
  function observeSettledSpins(){const total=$('total-spins');if(!total)return;const ob=new MutationObserver(()=>{const now=Number(total.textContent||0);if(now===lastObservedSpins)return;lastObservedSpins=now;setTimeout(inspectSettledSpin,80);updateBuyUI();});ob.observe(total,{childList:true,characterData:true,subtree:true});observers.push(ob);}
  function observeBalance(){const el=$('balance');if(!el)return;const ob=new MutationObserver(()=>updateBuyUI());ob.observe(el,{childList:true,characterData:true,subtree:true});observers.push(ob);}
  function guardBonusInput(e){if(!e.isTrusted)return;if(bonusSessionActive){e.preventDefault();e.stopImmediatePropagation();return;}}

  async function loadPolicy(){
    try{const r=await fetch('./config/helios.public.json',{cache:'no-store'});if(!r.ok)return;const cfg=await r.json();window.__HELIOS_PUBLIC_CONFIG=cfg;policy={...DEFAULT_POLICY,...(cfg?.solar_corona||{}),trigger_symbol:safeText(cfg?.solar_corona?.trigger_symbol,DEFAULT_POLICY.trigger_symbol,8)};buyPolicy=normalizeBuyPolicy(cfg?.demo_bonus_buy||{});}catch(_){ }
  }
  async function init(){injectStyles();buildOverlay();buildBank();buildBuyUI();buildFreeSpinsHud();await loadPolicy();updateBuyUI();observeSettledSpins();observeBalance();window.addEventListener('helios:bonus-buy-authorized',buyBonusAuthorized);$('spin')?.addEventListener('click',guardBonusInput,true);document.addEventListener('keydown',e=>{if(bonusSessionActive&&e.code==='Space'&&e.isTrusted){e.preventDefault();e.stopImmediatePropagation();}},true);window.dispatchEvent(new CustomEvent('helios:bonus-engine-ready',{detail:{version:BONUS_ENGINE_VERSION,first_class_bonus_core_source:true,stake_refund_bridge:false,dynamic_metadata_html:false}}));window.addEventListener('pagehide',()=>observers.forEach(x=>x.disconnect()),{once:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();