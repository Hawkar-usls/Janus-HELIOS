(() => {
  'use strict';

  const BONUS_CONFIRM_VERSION = '2.3.0';
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const DEFAULT_TIERS = [
    {id:'standard',name:'STANDARD CORONA',cost_multiplier_of_demo_bet:50,free_spins_count:10,retrigger_spins:2,max_total_spins:16},
    {id:'radiant',name:'RADIANT CORONA',cost_multiplier_of_demo_bet:100,free_spins_count:12,retrigger_spins:2,max_total_spins:20},
    {id:'solar_flare',name:'SOLAR FLARE',cost_multiplier_of_demo_bet:175,free_spins_count:15,retrigger_spins:3,max_total_spins:24}
  ];
  const PURCHASE_WHEEL_VALUES = [6,8,10,12,15,18,20,24];

  let tiers = DEFAULT_TIERS.map(x=>({...x}));
  let selectedTierId = 'standard';
  let lastFocused = null;

  const round2 = n => Math.round((Number(n)||0)*100)/100;
  const currentBet = () => Math.max(.01, Number($('bet')?.value || .1));
  const currentBalance = () => Math.max(0, Number($('balance')?.textContent || 0));
  const tierById = id => tiers.find(x=>x.id===id) || tiers[0] || DEFAULT_TIERS[0];
  const selectedTier = () => tierById(selectedTierId);
  const currentCost = () => round2(currentBet() * Number(selectedTier().cost_multiplier_of_demo_bet || 50));
  const safeText = (value,fallback='',max=96) => String(value ?? fallback).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max) || String(fallback).slice(0,max);
  const safeTierId = (value,fallback) => {
    const normalized=String(value ?? fallback ?? '').trim().replace(/[^A-Za-z0-9_.-]/g,'_').slice(0,64);
    return normalized || String(fallback || 'tier').replace(/[^A-Za-z0-9_.-]/g,'_').slice(0,64) || 'tier';
  };

  function setResult(result,primary,secondary){
    if(!result)return;
    const small=document.createElement('small');
    small.textContent=safeText(secondary,'',128);
    result.replaceChildren(document.createTextNode(safeText(primary,'',64)),small);
  }

  function normalizeTier(raw, fallback, i){
    const f = fallback || DEFAULT_TIERS[Math.min(i,DEFAULT_TIERS.length-1)] || DEFAULT_TIERS[0];
    return {
      id:safeTierId(raw?.id,f.id || `tier_${i+1}`),
      name:safeText(raw?.name,f.name || `BONUS TIER ${i+1}`,80),
      cost_multiplier_of_demo_bet:Math.max(1,Math.min(500,Number(raw?.cost_multiplier_of_demo_bet ?? f.cost_multiplier_of_demo_bet ?? 50))),
      free_spins_count:Math.max(3,Math.min(30,Number(raw?.free_spins_count ?? f.free_spins_count ?? 10))),
      retrigger_spins:Math.max(1,Math.min(8,Number(raw?.retrigger_spins ?? f.retrigger_spins ?? 2))),
      max_total_spins:Math.max(3,Math.min(50,Number(raw?.max_total_spins ?? f.max_total_spins ?? 16)))
    };
  }

  function injectStyles(){
    if($('bonus-confirm-styles')) return;
    const s=document.createElement('style');
    s.id='bonus-confirm-styles';
    s.textContent=`
      .bonus-confirm-overlay[hidden]{display:none!important}.bonus-confirm-overlay{position:fixed;z-index:880;inset:0;display:grid;place-items:center;padding:18px;background:#010306e8;backdrop-filter:blur(12px)}
      .bonus-confirm-card{width:min(620px,95vw);max-height:90dvh;overflow:auto;border:1px solid #8a641f;border-radius:18px;background:linear-gradient(180deg,#171006fa,#070a0efa);box-shadow:0 0 70px #ffb12b24,0 28px 100px #000c;padding:18px;color:#eef2f4}
      .bonus-confirm-kicker{color:#ffc957;font:900 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.17em}.bonus-confirm-title{margin:5px 0 3px;font-size:21px}.bonus-confirm-sub{color:#89959e;font-size:8px;line-height:1.45}
      .bonus-tier-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:13px 0}.bonus-tier-card{border:1px solid #2f3941;border-radius:11px;background:#080d11;color:#c8d1d7;padding:10px;text-align:left;min-height:105px}.bonus-tier-card.active{border-color:#ffc957;background:radial-gradient(circle at 20% 0,#ffb72b1d,#090d11 65%);box-shadow:0 0 20px #ffc13c20}.bonus-tier-card b{display:block;color:#f0d79c;font-size:9px}.bonus-tier-card strong{display:block;color:#ffd76d;font:950 16px ui-monospace,SFMono-Regular,Consolas,monospace;margin:4px 0}.bonus-tier-card span{display:block;color:#89959e;font-size:7px;line-height:1.4}.bonus-tier-card small{display:block;color:#776e5d;font-size:6px;margin-top:5px}
      .bonus-confirm-price{margin:10px 0;padding:12px;border:1px solid #5e461c;border-radius:12px;background:radial-gradient(circle at 20% 0,#ffb6291d,#090b0e 68%);display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.bonus-confirm-price span{display:block;color:#8f999f;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-confirm-price b{display:block;color:#ffd66d;font:950 25px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-confirm-price small{color:#9c875b;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}
      .bonus-confirm-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:9px 0}.bonus-confirm-fact{border:1px solid #2b333a;border-radius:9px;background:#080d11;padding:8px;text-align:center}.bonus-confirm-fact b{display:block;color:#f2dfae;font:900 12px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-confirm-fact span{display:block;color:#78858e;font:6px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:3px}
      .bonus-confirm-note{border:1px solid #493a22;border-radius:9px;background:#0c0a06;padding:8px;color:#9c8d70;font:7px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-confirm-note b{color:#ffd36a}
      .bonus-confirm-consent{display:flex;gap:9px;align-items:flex-start;border:1px solid #343b40;border-radius:10px;background:#080c10;padding:10px;margin-top:10px;cursor:pointer}.bonus-confirm-consent input{margin-top:2px;accent-color:#ffc24b;min-width:16px;min-height:16px}.bonus-confirm-consent span{color:#aab4ba;font-size:8px;line-height:1.45}.bonus-confirm-consent strong{color:#ffd36a}
      .bonus-confirm-actions{display:grid;grid-template-columns:1fr 1.3fr;gap:8px;margin-top:11px}.bonus-confirm-actions button{min-height:42px;border-radius:10px;font:900 9px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-confirm-cancel{border:1px solid #34404a;background:#0a1015;color:#bac4ca}.bonus-confirm-buy{border:1px solid #946a20;background:linear-gradient(180deg,#ffd363,#e99a20);color:#241600}.bonus-confirm-buy:disabled{opacity:.34;filter:saturate(.4);cursor:not-allowed}.bonus-confirm-foot{margin-top:8px;color:#6f7b83;font:6px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;text-align:center}
      @media(max-width:620px){.bonus-confirm-overlay{padding:max(10px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom))}.bonus-confirm-card{width:100%;max-height:calc(100dvh - 20px);padding:13px}.bonus-tier-grid{grid-template-columns:1fr}.bonus-tier-card{min-height:auto}.bonus-confirm-actions{grid-template-columns:1fr}.bonus-confirm-actions button{min-height:46px}}
    `;
    document.head.appendChild(s);
  }

  function buildUI(){
    if($('bonus-confirm-overlay')) return;
    const overlay=document.createElement('div');
    overlay.id='bonus-confirm-overlay';overlay.className='bonus-confirm-overlay';overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`<section class="bonus-confirm-card" role="dialog" aria-modal="true" aria-labelledby="bonus-confirm-title"><div class="bonus-confirm-kicker">☀ HELIOS · BONUS PURCHASE REVIEW</div><h3 id="bonus-confirm-title" class="bonus-confirm-title">CHOOSE SOLAR FREE SPINS</h3><div class="bonus-confirm-sub">Choose a demo tier, review the exact cost, then confirm. Nothing is deducted before confirmation.</div><div id="bonus-tier-grid" class="bonus-tier-grid"></div><div class="bonus-confirm-price"><div><span>TOTAL BONUS COST</span><b id="bonus-confirm-cost">0.00</b><small>DEMO PRESENTATION UNITS</small></div><div><span>CURRENT BET</span><b id="bonus-confirm-bet" style="font-size:17px">0.00</b><small id="bonus-confirm-multiplier">--× BET</small></div></div><div class="bonus-confirm-facts"><div class="bonus-confirm-fact"><b id="bonus-confirm-spins">0</b><span>AUTO FREE SPINS</span></div><div class="bonus-confirm-fact"><b id="bonus-confirm-retrigger">+0</b><span>3+ ☀ RETRIGGER</span></div><div class="bonus-confirm-fact"><b id="bonus-confirm-max">0</b><span>MAX TOTAL SPINS</span></div></div><div class="bonus-confirm-note"><b>Higher tier does not guarantee a win.</b> It buys more free-spin opportunities and a larger disclosed retrigger budget. Compute activity and player history never alter the selected tier.</div><label class="bonus-confirm-consent"><input id="bonus-confirm-consent" type="checkbox"><span>I understand that <strong id="bonus-confirm-consent-cost">0.00 demo units</strong> will be deducted for this selected demo tier when I confirm.</span></label><div class="bonus-confirm-actions"><button id="bonus-confirm-cancel" class="bonus-confirm-cancel" type="button">CANCEL</button><button id="bonus-confirm-buy" class="bonus-confirm-buy" type="button" disabled>CONFIRM BUY</button></div><div id="bonus-confirm-foot" class="bonus-confirm-foot">CONFIRMATION APPLIES TO THIS PURCHASE ONLY</div></section>`;
    document.body.appendChild(overlay);
    $('bonus-confirm-consent')?.addEventListener('change',updateConfirmState);
    $('bonus-confirm-cancel')?.addEventListener('click',()=>closeDialog(true));
    $('bonus-confirm-buy')?.addEventListener('click',confirmPurchase);
    overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)closeDialog(true);});
  }

  function renderTiers(){
    const host=$('bonus-tier-grid');if(!host)return;host.replaceChildren();
    tiers.forEach(tier=>{
      const btn=document.createElement('button');btn.type='button';btn.className='bonus-tier-card';btn.dataset.tier=tier.id;
      const cost=round2(currentBet()*tier.cost_multiplier_of_demo_bet);
      const name=document.createElement('b');name.textContent=tier.name;
      const price=document.createElement('strong');price.textContent=`${tier.cost_multiplier_of_demo_bet}× BET`;
      const rules=document.createElement('span');rules.textContent=`${tier.free_spins_count} free spins · 3+ ☀ gives +${tier.retrigger_spins} · max ${tier.max_total_spins}`;
      const demoCost=document.createElement('small');demoCost.textContent=`${cost.toFixed(2)} DEMO UNITS`;
      btn.append(name,price,rules,demoCost);
      btn.addEventListener('click',()=>selectTier(tier.id));host.appendChild(btn);
    });
    syncSelection();
  }

  function selectTier(id){
    if(!tiers.some(x=>x.id===id))return;selectedTierId=id;
    const c=$('bonus-confirm-consent');if(c)c.checked=false;syncSelection();if(navigator.vibrate)navigator.vibrate(7);
  }

  function syncSelection(){
    document.querySelectorAll('.bonus-tier-card').forEach(x=>x.classList.toggle('active',x.dataset.tier===selectedTierId));
    const tier=selectedTier(),bet=currentBet(),cost=currentCost();
    $('bonus-confirm-bet').textContent=bet.toFixed(2);$('bonus-confirm-cost').textContent=cost.toFixed(2);$('bonus-confirm-consent-cost').textContent=`${cost.toFixed(2)} demo units`;$('bonus-confirm-multiplier').textContent=`${tier.cost_multiplier_of_demo_bet}× BET`;$('bonus-confirm-spins').textContent=String(tier.free_spins_count);$('bonus-confirm-retrigger').textContent=`+${tier.retrigger_spins}`;$('bonus-confirm-max').textContent=String(tier.max_total_spins);updateConfirmState();
  }

  function updateConfirmState(){
    const consent=$('bonus-confirm-consent'),btn=$('bonus-confirm-buy'),foot=$('bonus-confirm-foot');if(!btn)return;
    const cost=currentCost(),available=currentBalance(),enough=available+1e-9>=cost;btn.disabled=!consent?.checked||!enough;
    if(foot)foot.textContent=enough?`AVAILABLE ${available.toFixed(2)} · CONFIRMATION APPLIES TO THIS PURCHASE ONLY`:`INSUFFICIENT DEMO BALANCE · NEED ${cost.toFixed(2)} · AVAILABLE ${available.toFixed(2)}`;
  }

  function openDialog(detail={}){
    const overlay=$('bonus-confirm-overlay');if(!overlay)return;lastFocused=document.activeElement;
    if(Array.isArray(detail.tiers)&&detail.tiers.length){const incoming=detail.tiers.slice(0,6).map((x,i)=>normalizeTier(x,DEFAULT_TIERS[i],i));if(incoming.length)tiers=incoming;}
    if(!tiers.some(x=>x.id===selectedTierId))selectedTierId=tiers[0]?.id||'standard';
    renderTiers();const c=$('bonus-confirm-consent');if(c)c.checked=false;updateConfirmState();overlay.hidden=false;overlay.setAttribute('aria-hidden','false');document.body.classList.add('bonus-confirm-open');const target=[...document.querySelectorAll('.bonus-tier-card')].find(x=>x.dataset.tier===selectedTierId);setTimeout(()=>target?.focus(),30);
  }

  function closeDialog(emitCancel=false){
    const overlay=$('bonus-confirm-overlay');if(!overlay||overlay.hidden)return;overlay.hidden=true;overlay.setAttribute('aria-hidden','true');document.body.classList.remove('bonus-confirm-open');if(emitCancel)window.dispatchEvent(new CustomEvent('helios:bonus-buy-review-cancel',{detail:{tier_id:selectedTierId,cost:currentCost(),real_money_value:false}}));if(lastFocused?.focus)setTimeout(()=>lastFocused.focus(),20);
  }

  function restorePurchaseWheel(handoff){
    const rays=handoff?.rays||[];
    const oldLabels=handoff?.oldLabels||[];
    rays.forEach((ray,i)=>{ray.classList.remove('selected');ray.textContent=oldLabels[i]||ray.textContent;});
  }

  async function releasePurchasedBonusOverlay(handoff, timeoutMs=2600){
    const overlay=handoff?.overlay;
    if(!overlay){restorePurchaseWheel(handoff);return;}
    const started=Date.now();
    while(overlay.classList.contains('show') && Date.now()-started<timeoutMs) await sleep(50);
    if(overlay.classList.contains('show')){
      overlay.classList.remove('show');
      await sleep(180);
    }
    restorePurchaseWheel(handoff);
  }

  async function animatePurchasedBonusWheel(detail){
    const overlay=$('solar-corona-overlay');
    const pointer=$('corona-pointer');
    const result=$('solar-corona-result');
    const sub=$('solar-corona-sub');
    const title=$('solar-corona-title');
    const rays=[...document.querySelectorAll('.corona-ray')];
    if(!overlay||!pointer||!result||!sub||!title||!rays.length)return null;

    const award=Math.max(1,Number(detail.free_spins_count||0));
    const values=[...PURCHASE_WHEEL_VALUES];
    let selected=values.indexOf(award);
    if(selected<0){
      selected=values.reduce((best,v,i)=>Math.abs(v-award)<Math.abs(values[best]-award)?i:best,0);
      values[selected]=award;
    }
    const oldLabels=rays.map(x=>x.textContent);
    const tierName=safeText(detail.tier_name,'BONUS TIER',80);

    rays.forEach((ray,i)=>{
      ray.classList.remove('selected');
      ray.textContent=`${values[i%values.length]} FS`;
    });
    title.textContent='SOLAR CORONA ACTIVATION';
    sub.textContent=`${tierName} · AUTHORIZED · CORONA SPIN`;
    setResult(result,'IGNITING…','FREE-SPIN AWARD ACTIVATION');
    overlay.classList.add('show');

    window.dispatchEvent(new CustomEvent('helios:bonus-wheel-start',{detail:{...detail,tier_name:tierName,presentation_only:true,rng_effect:'NONE',compute_effect:'NONE'}}));

    const angle=(360/rays.length)*selected;
    pointer.style.transition='none';
    pointer.style.transform='rotate(0deg)';
    void pointer.offsetWidth;
    pointer.style.transition='transform 1.85s cubic-bezier(.12,.78,.14,1)';
    pointer.style.transform=`rotate(${1440+angle}deg)`;

    await sleep(1900);
    rays[selected]?.classList.add('selected');
    setResult(result,`${award} FREE SPINS`,`${tierName} · TIER AWARD · VISUAL ACTIVATION`);
    if(navigator.vibrate)navigator.vibrate([16,28,16,28,38]);

    window.dispatchEvent(new CustomEvent('helios:bonus-wheel-complete',{detail:{...detail,tier_name:tierName,spins_awarded:award,presentation_only:true,rng_effect:'NONE',compute_effect:'NONE'}}));

    // Keep this exact overlay visible. The bonus core immediately reuses it for the
    // purchased-session activation message, so there is no close → reopen flash.
    await sleep(850);
    return {overlay,rays,oldLabels};
  }

  async function confirmPurchase(){
    const consent=$('bonus-confirm-consent');if(!consent?.checked)return;const tier=selectedTier(),bet=currentBet(),cost=currentCost();if(currentBalance()+1e-9<cost){updateConfirmState();return;}
    const buy=$('bonus-confirm-buy');if(buy)buy.disabled=true;
    closeDialog(false);
    const detail={feature:'SOLAR_CORONA_FREE_SPINS',tier_id:tier.id,tier_name:tier.name,bet,cost,cost_multiplier:tier.cost_multiplier_of_demo_bet,free_spins_count:tier.free_spins_count,retrigger_spins:tier.retrigger_spins,max_total_spins:tier.max_total_spins,explicit_consent:true,real_money_value:false,production_enabled:false,compute_effect:'NONE'};
    window.dispatchEvent(new CustomEvent('helios:bonus-buy-review-confirmed',{detail}));
    let wheelHandoff=null;
    try{wheelHandoff=await animatePurchasedBonusWheel(detail);}catch(err){console.warn('[HELIOS BONUS WHEEL]',err);}
    window.dispatchEvent(new CustomEvent('helios:bonus-buy-authorized',{detail:{...detail,visual_wheel_complete:true,seamless_overlay_handoff:true}}));
    if(wheelHandoff) await releasePurchasedBonusOverlay(wheelHandoff);
  }

  function keyHandler(e){const overlay=$('bonus-confirm-overlay');if(!overlay||overlay.hidden)return;if(e.key==='Escape'){e.preventDefault();closeDialog(true);}}

  function init(){injectStyles();buildUI();window.addEventListener('helios:bonus-buy-request',e=>openDialog(e.detail||{}));document.addEventListener('keydown',keyHandler,true);window.dispatchEvent(new CustomEvent('helios:bonus-confirm-ready',{detail:{version:BONUS_CONFIRM_VERSION,dynamic_tier_html:false}}));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();