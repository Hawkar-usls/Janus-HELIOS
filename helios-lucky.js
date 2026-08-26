(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  const DEFAULT_POLICY = {
    enabled:true,
    demo_probability_per_receipt:0.12,
    eligible_route_classes:['MARKETPLACE','TREASURY','SCIENCE','PUBLIC_GOOD','DATACENTER','OPERATOR','CUSTOM'],
    demo_reward_units:1,
    reward_ledger:'LUCKY_CONTRIBUTION_LEDGER',
    real_money_value:false,
    wagering_value:false,
    production_requires_authoritative_receipt:true,
    production_browser_self_verification:false
  };

  let policy={...DEFAULT_POLICY};
  let lastReceiptId='';
  let eventCount=0;
  let recognitionUnits=0;
  let busy=false;

  function clamp(n,min,max){ return Math.max(min,Math.min(max,Number(n))); }
  function secureFloat(){
    const a=new Uint32Array(1);
    if(globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(a);
    else a[0]=(Date.now()*2654435761)>>>0;
    return a[0]/0xffffffff;
  }
  function secureScore(){ return Math.floor(secureFloat()*1000000)/1000000; }

  async function loadPolicy(){
    try{
      const r=await fetch('./config/helios.public.json',{cache:'no-store'});
      if(!r.ok) return;
      const cfg=await r.json();
      const p=cfg?.demo_lucky_contribution||{};
      policy={
        ...DEFAULT_POLICY,
        ...p,
        demo_probability_per_receipt:clamp(p.demo_probability_per_receipt??DEFAULT_POLICY.demo_probability_per_receipt,0,0.5),
        eligible_route_classes:Array.isArray(p.eligible_route_classes)&&p.eligible_route_classes.length?p.eligible_route_classes:DEFAULT_POLICY.eligible_route_classes,
        demo_reward_units:Math.max(0,Number(p.demo_reward_units??DEFAULT_POLICY.demo_reward_units)),
        reward_ledger:'LUCKY_CONTRIBUTION_LEDGER',
        real_money_value:false,
        wagering_value:false,
        production_requires_authoritative_receipt:true,
        production_browser_self_verification:false
      };
    }catch(_){ }
  }

  function routeIdentity(routeClass){
    const key=String(routeClass||'').toUpperCase();
    if(key==='TREASURY'||key==='MARKETPLACE') return {name:'LUCKY HASH',icon:'◆',detail:'RARE ACCEPTED COMPUTE CONTRIBUTION'};
    if(key==='SCIENCE'||key==='PUBLIC_GOOD') return {name:'IMPACT HIT',icon:'✦',detail:'SIGNIFICANT RESEARCH CONTRIBUTION'};
    return {name:'GOLDEN TASK',icon:'⬡',detail:'SIGNIFICANT VERIFIED WORK UNIT'};
  }

  function injectStyles(){
    if($('lucky-contribution-styles')) return;
    const style=document.createElement('style');
    style.id='lucky-contribution-styles';
    style.textContent=`
      .lucky-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid #806222;background:#120d04;border-radius:8px;padding:4px 7px;color:#a28d58;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.lucky-chip b{color:#ffe08a}.lucky-chip.pulse{animation:luckyChip .8s ease}
      .lucky-overlay{position:fixed;z-index:760;inset:0;display:grid;place-items:center;padding:18px;background:radial-gradient(circle at 50% 45%,#a06e162d,#010306df 58%);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .18s}.lucky-overlay.show{opacity:1;pointer-events:auto}
      .lucky-card{width:min(470px,92vw);position:relative;overflow:hidden;text-align:center;border:1px solid #a27b2d;border-radius:22px;background:linear-gradient(180deg,#171208f4,#06090df8);box-shadow:0 0 80px #ffc44a2a,0 34px 120px #000;padding:25px 18px}.lucky-card:before{content:"";position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent,#ffd86a12,transparent,#fff1a522,transparent);animation:luckyOrbit 4s linear infinite}.lucky-icon{position:relative;font-size:54px;color:#ffd96c;text-shadow:0 0 28px #ffc14c88;animation:luckyPulse .8s ease-in-out infinite alternate}.lucky-title{position:relative;margin:6px 0 2px;color:#ffe39a;font:950 25px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}.lucky-detail{position:relative;color:#9aa7af;font:8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em}.lucky-score{position:relative;margin:14px auto 7px;width:min(330px,90%);border:1px solid #3c3525;border-radius:12px;background:#070b0f;padding:10px;color:#cdbf91;font:9px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}.lucky-score b{color:#7dffb0}.lucky-ledger{position:relative;color:#817a69;font:7px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}.lucky-ledger strong{color:#e0c783}
      @keyframes luckyOrbit{to{transform:rotate(360deg)}}@keyframes luckyPulse{from{transform:scale(.96)}to{transform:scale(1.06)}}@keyframes luckyChip{0%{box-shadow:none}45%{box-shadow:0 0 26px #ffd55d88;transform:scale(1.06)}100%{box-shadow:none;transform:none}}
    `;
    document.head.appendChild(style);
  }

  function buildUI(){
    if(!$('lucky-overlay')){
      const overlay=document.createElement('div');
      overlay.id='lucky-overlay';overlay.className='lucky-overlay';
      overlay.innerHTML=`<section class="lucky-card" role="status" aria-live="polite"><div id="lucky-icon" class="lucky-icon">◆</div><div id="lucky-title" class="lucky-title">LUCKY HASH</div><div id="lucky-detail" class="lucky-detail">SIMULATED SIGNIFICANT CONTRIBUTION</div><div id="lucky-score" class="lucky-score">WAITING FOR VERIFIED WORK…</div><div class="lucky-ledger"><strong>LUCKY CONTRIBUTION LEDGER</strong> · recognition only in this public demo · no wagering value · no RNG/RTP/personal jackpot effect.</div></section>`;
      document.body.appendChild(overlay);
    }
    const mini=document.querySelector('#helios-game-tools .session-mini');
    if(mini&&!$('lucky-chip')){
      const chip=document.createElement('span');chip.id='lucky-chip';chip.className='lucky-chip';chip.innerHTML='◆ LUCKY <b id="lucky-count">0</b> · <b id="lucky-units">0.00</b>';
      mini.appendChild(chip);
    }
  }

  function parseReceipt(){
    const el=$('receipt'); if(!el) return null;
    try{return JSON.parse(el.textContent);}catch(_){return null;}
  }

  function isEligibleReceipt(receipt){
    if(!policy.enabled||!receipt||receipt.mode!=='SIMULATION') return false;
    if(!receipt.receipt_id||receipt.receipt_id===lastReceiptId) return false;
    return policy.eligible_route_classes.includes(String(receipt.provider_route||'').toUpperCase());
  }

  async function celebrate(receipt,score){
    if(busy) return;busy=true;
    const id=routeIdentity(receipt.provider_route);
    const reward=Number(policy.demo_reward_units||0);
    eventCount++;recognitionUnits=Math.round((recognitionUnits+reward)*100)/100;
    if($('lucky-count')) $('lucky-count').textContent=String(eventCount);
    if($('lucky-units')) $('lucky-units').textContent=recognitionUnits.toFixed(2);
    const chip=$('lucky-chip');chip?.classList.remove('pulse');if(chip){void chip.offsetWidth;chip.classList.add('pulse');}
    $('lucky-icon').textContent=id.icon;$('lucky-title').textContent=id.name;$('lucky-detail').textContent=`${id.detail} · SIMULATED`;
    $('lucky-score').innerHTML=`receipt <b>${String(receipt.receipt_id)}</b><br>route <b>${String(receipt.provider_route)}</b><br>significance score <b>${score.toFixed(6)}</b><br>recognition +<b>${reward.toFixed(2)}</b>`;
    $('lucky-overlay').classList.add('show');
    if(navigator.vibrate) navigator.vibrate([12,22,12,22,36]);

    window.dispatchEvent(new CustomEvent('helios:lucky-contribution',{detail:{
      event_name:id.name,
      route_class:receipt.provider_route,
      receipt_id:receipt.receipt_id,
      demo_significance_score:score,
      reward_units:reward,
      recognition_units:recognitionUnits,
      reward_ledger:'LUCKY_CONTRIBUTION_LEDGER',
      authoritative:false,
      simulated:true,
      real_money_value:false,
      wagering_value:false,
      rng_effect:'NONE',
      rtp_effect:'NONE',
      personal_jackpot_weight_effect:'NONE'
    }}));

    await new Promise(r=>setTimeout(r,1900));
    $('lucky-overlay').classList.remove('show');
    await new Promise(r=>setTimeout(r,220));busy=false;
  }

  function inspectReceipt(){
    const receipt=parseReceipt();
    if(!receipt||!receipt.receipt_id||receipt.receipt_id===lastReceiptId) return;
    lastReceiptId=String(receipt.receipt_id);
    if(!policy.enabled||receipt.mode!=='SIMULATION') return;
    if(!policy.eligible_route_classes.includes(String(receipt.provider_route||'').toUpperCase())) return;
    const score=secureScore();
    if(score < 1-policy.demo_probability_per_receipt) return;
    celebrate(receipt,score);
  }

  function observeReceipts(){
    const el=$('receipt');if(!el)return false;
    new MutationObserver(()=>setTimeout(inspectReceipt,20)).observe(el,{childList:true,characterData:true,subtree:true});
    setTimeout(inspectReceipt,50);return true;
  }

  async function init(){
    await loadPolicy();injectStyles();buildUI();
    let tries=0;const attach=()=>{buildUI();if(observeReceipts())return;if(++tries<100)setTimeout(attach,80);};attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
