(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const DEFAULTS = {
    cost_multiplier_of_demo_bet: 50,
    free_spins_count: 10,
    retrigger_spins: 2,
    max_total_spins: 16
  };

  let policy = {...DEFAULTS};
  let bypassOnce = false;
  let lastFocused = null;

  const round2 = n => Math.round((Number(n) || 0) * 100) / 100;
  const currentBet = () => Math.max(.01, Number($('bet')?.value || .1));
  const currentCost = () => round2(currentBet() * Number(policy.cost_multiplier_of_demo_bet || 50));

  async function loadPolicy(){
    try{
      const r = await fetch('./config/helios.public.json', {cache:'no-store'});
      if(!r.ok) return;
      const cfg = await r.json();
      const b = cfg?.demo_bonus_buy || {};
      policy = {...DEFAULTS, ...b};
    } catch(_) {}
  }

  function injectStyles(){
    if($('bonus-confirm-styles')) return;
    const s = document.createElement('style');
    s.id = 'bonus-confirm-styles';
    s.textContent = `
      .bonus-confirm-overlay{position:fixed;z-index:880;inset:0;display:grid;place-items:center;padding:18px;background:#010306df;backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:opacity .18s ease}.bonus-confirm-overlay.show{opacity:1;pointer-events:auto}
      .bonus-confirm-card{width:min(460px,94vw);border:1px solid #8a641f;border-radius:18px;background:linear-gradient(180deg,#171006fa,#070a0efa);box-shadow:0 0 70px #ffb12b24,0 28px 100px #000c;padding:18px;position:relative;color:#eef2f4}
      .bonus-confirm-kicker{color:#ffc957;font:900 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.17em}.bonus-confirm-title{margin:5px 0 3px;font-size:21px}.bonus-confirm-sub{color:#89959e;font-size:8px;line-height:1.45}
      .bonus-confirm-price{margin:14px 0 10px;padding:12px;border:1px solid #5e461c;border-radius:12px;background:radial-gradient(circle at 20% 0,#ffb6291d,#090b0e 68%);display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.bonus-confirm-price span{display:block;color:#8f999f;font:7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.09em}.bonus-confirm-price b{display:block;color:#ffd66d;font:950 25px ui-monospace,SFMono-Regular,Consolas,monospace;line-height:1.05}.bonus-confirm-price small{color:#9c875b;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}
      .bonus-confirm-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:9px 0}.bonus-confirm-fact{border:1px solid #2b333a;border-radius:9px;background:#080d11;padding:8px;text-align:center}.bonus-confirm-fact b{display:block;color:#f2dfae;font:900 12px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-confirm-fact span{display:block;color:#78858e;font:6px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:3px}
      .bonus-confirm-consent{display:flex;gap:9px;align-items:flex-start;border:1px solid #343b40;border-radius:10px;background:#080c10;padding:10px;margin-top:10px;cursor:pointer}.bonus-confirm-consent input{margin-top:2px;accent-color:#ffc24b;min-width:16px;min-height:16px}.bonus-confirm-consent span{color:#aab4ba;font-size:8px;line-height:1.45}.bonus-confirm-consent strong{color:#ffd36a}
      .bonus-confirm-actions{display:grid;grid-template-columns:1fr 1.3fr;gap:8px;margin-top:11px}.bonus-confirm-actions button{min-height:42px;border-radius:10px;font:900 9px ui-monospace,SFMono-Regular,Consolas,monospace}.bonus-confirm-cancel{border:1px solid #34404a;background:#0a1015;color:#bac4ca}.bonus-confirm-buy{border:1px solid #946a20;background:linear-gradient(180deg,#ffd363,#e99a20);color:#241600}.bonus-confirm-buy:disabled{opacity:.34;filter:saturate(.4);cursor:not-allowed}
      .bonus-confirm-foot{margin-top:8px;color:#6f7b83;font:6px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;text-align:center}
      @media(max-width:520px){.bonus-confirm-overlay{padding:max(12px,env(safe-area-inset-top)) 10px max(12px,env(safe-area-inset-bottom))}.bonus-confirm-card{width:100%;max-height:calc(100dvh - 24px);overflow:auto}.bonus-confirm-facts{grid-template-columns:1fr}.bonus-confirm-actions{grid-template-columns:1fr}.bonus-confirm-actions button{min-height:46px}}
    `;
    document.head.appendChild(s);
  }

  function buildUI(){
    if($('bonus-confirm-overlay')) return;
    const el = document.createElement('div');
    el.id = 'bonus-confirm-overlay';
    el.className = 'bonus-confirm-overlay';
    el.setAttribute('aria-hidden','true');
    el.innerHTML = `
      <section class="bonus-confirm-card" role="dialog" aria-modal="true" aria-labelledby="bonus-confirm-title" aria-describedby="bonus-confirm-description">
        <div class="bonus-confirm-kicker">☀ HELIOS · PURCHASE REVIEW</div>
        <h3 id="bonus-confirm-title" class="bonus-confirm-title">CONFIRM SOLAR FREE SPINS</h3>
        <div id="bonus-confirm-description" class="bonus-confirm-sub">Review the exact demo cost before starting the feature. Nothing is deducted until you explicitly confirm.</div>
        <div class="bonus-confirm-price">
          <div><span>TOTAL BONUS COST</span><b id="bonus-confirm-cost">0.00</b><small>DEMO PRESENTATION UNITS</small></div>
          <div><span>CURRENT BET</span><b id="bonus-confirm-bet" style="font-size:17px">0.00</b><small id="bonus-confirm-multiplier">50× BET</small></div>
        </div>
        <div class="bonus-confirm-facts">
          <div class="bonus-confirm-fact"><b id="bonus-confirm-spins">10</b><span>AUTO FREE SPINS</span></div>
          <div class="bonus-confirm-fact"><b id="bonus-confirm-retrigger">+2</b><span>3+ ☀ RETRIGGER</span></div>
          <div class="bonus-confirm-fact"><b id="bonus-confirm-max">16</b><span>MAX TOTAL SPINS</span></div>
        </div>
        <label class="bonus-confirm-consent"><input id="bonus-confirm-consent" type="checkbox"><span>I understand that <strong id="bonus-confirm-consent-cost">0.00 demo units</strong> will be deducted when I confirm. This is a demo-only feature with no real-money value.</span></label>
        <div class="bonus-confirm-actions"><button id="bonus-confirm-cancel" class="bonus-confirm-cancel" type="button">CANCEL</button><button id="bonus-confirm-buy" class="bonus-confirm-buy" type="button" disabled>CONFIRM BUY</button></div>
        <div class="bonus-confirm-foot">CONFIRMATION APPLIES TO THIS PURCHASE ONLY · COST IS RECALCULATED FROM THE CURRENT BET EACH TIME</div>
      </section>`;
    document.body.appendChild(el);

    $('bonus-confirm-consent')?.addEventListener('change', e => {
      const confirm = $('bonus-confirm-buy');
      if(confirm) confirm.disabled = !e.target.checked;
    });
    $('bonus-confirm-cancel')?.addEventListener('click', closeDialog);
    $('bonus-confirm-buy')?.addEventListener('click', confirmPurchase);
    el.addEventListener('pointerdown', e => { if(e.target === el) closeDialog(); });
  }

  function openDialog(){
    const overlay = $('bonus-confirm-overlay');
    if(!overlay) return;
    const bet = currentBet(), cost = currentCost();
    lastFocused = document.activeElement;
    $('bonus-confirm-bet').textContent = bet.toFixed(2);
    $('bonus-confirm-cost').textContent = cost.toFixed(2);
    $('bonus-confirm-consent-cost').textContent = `${cost.toFixed(2)} demo units`;
    $('bonus-confirm-multiplier').textContent = `${Number(policy.cost_multiplier_of_demo_bet || 50)}× BET`;
    $('bonus-confirm-spins').textContent = String(Number(policy.free_spins_count || 10));
    $('bonus-confirm-retrigger').textContent = `+${Number(policy.retrigger_spins || 2)}`;
    $('bonus-confirm-max').textContent = String(Number(policy.max_total_spins || 16));
    const consent = $('bonus-confirm-consent'); if(consent) consent.checked = false;
    const confirm = $('bonus-confirm-buy'); if(confirm) confirm.disabled = true;
    overlay.classList.add('show'); overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('bonus-confirm-open');
    setTimeout(() => $('bonus-confirm-consent')?.focus(), 40);
    window.dispatchEvent(new CustomEvent('helios:bonus-buy-review-open',{detail:{bet,cost,free_spins:Number(policy.free_spins_count||10),real_money_value:false}}));
  }

  function closeDialog(){
    const overlay = $('bonus-confirm-overlay');
    if(!overlay?.classList.contains('show')) return;
    overlay.classList.remove('show'); overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('bonus-confirm-open');
    window.dispatchEvent(new CustomEvent('helios:bonus-buy-review-cancel',{detail:{cost:currentCost(),real_money_value:false}}));
    if(lastFocused?.focus) setTimeout(()=>lastFocused.focus(),20);
  }

  function confirmPurchase(){
    const consent = $('bonus-confirm-consent');
    if(!consent?.checked) return;
    const cost = currentCost(), bet = currentBet();
    const overlay = $('bonus-confirm-overlay');
    if(overlay){overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');}
    document.body.classList.remove('bonus-confirm-open');
    window.dispatchEvent(new CustomEvent('helios:bonus-buy-review-confirmed',{detail:{bet,cost,explicit_consent:true,real_money_value:false}}));
    bypassOnce = true;
    const btn = $('bonus-buy-btn');
    if(btn && !btn.disabled) btn.click();
    else bypassOnce = false;
  }

  function interceptBuy(e){
    const target = e.target?.closest?.('#bonus-buy-btn');
    if(!target) return;
    if(bypassOnce){bypassOnce = false;return;}
    if(target.disabled) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openDialog();
  }

  function keyHandler(e){
    const overlay = $('bonus-confirm-overlay');
    if(!overlay?.classList.contains('show')) return;
    if(e.key === 'Escape'){e.preventDefault();closeDialog();}
  }

  async function init(){
    await loadPolicy();
    injectStyles();buildUI();
    document.addEventListener('click', interceptBuy, true);
    document.addEventListener('keydown', keyHandler, true);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
