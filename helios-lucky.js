(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const DEFAULT_POLICY = {
    enabled:true,
    demo_probability_per_receipt:0.005,
    eligible_route_classes:['MARKETPLACE','TREASURY','SCIENCE','PUBLIC_GOOD','DATACENTER','OPERATOR','CUSTOM'],
    demo_reward_units:1,
    reward_ledger:'LUCKY_CONTRIBUTION_LEDGER',
    real_money_value:false,
    wagering_value:false,
    production_requires_authoritative_receipt:true,
    production_browser_self_verification:false,
    showcase_manual_trigger:true
  };

  let policy={...DEFAULT_POLICY};
  let lastReceiptId='';
  let lastEligibleReceipt=null;
  let eventCount=0;
  let recognitionUnits=0;

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
      if(!r.ok)return;
      const cfg=await r.json();const p=cfg?.demo_lucky_contribution||{};
      policy={
        ...DEFAULT_POLICY,...p,
        demo_probability_per_receipt:clamp(p.demo_probability_per_receipt??DEFAULT_POLICY.demo_probability_per_receipt,0,0.05),
        eligible_route_classes:Array.isArray(p.eligible_route_classes)&&p.eligible_route_classes.length?p.eligible_route_classes:DEFAULT_POLICY.eligible_route_classes,
        demo_reward_units:Math.max(0,Number(p.demo_reward_units??DEFAULT_POLICY.demo_reward_units)),
        reward_ledger:'LUCKY_CONTRIBUTION_LEDGER',real_money_value:false,wagering_value:false,
        production_requires_authoritative_receipt:true,production_browser_self_verification:false
      };
    }catch(_){ }
  }

  function routeIdentity(routeClass){
    const key=String(routeClass||'').toUpperCase();
    if(key==='TREASURY'||key==='MARKETPLACE')return {name:'LUCKY HASH',icon:'◆',detail:'RARE ACCEPTED COMPUTE CONTRIBUTION'};
    if(key==='SCIENCE'||key==='PUBLIC_GOOD')return {name:'IMPACT HIT',icon:'✦',detail:'SIGNIFICANT RESEARCH CONTRIBUTION'};
    return {name:'GOLDEN TASK',icon:'⬡',detail:'SIGNIFICANT VERIFIED WORK UNIT'};
  }

  function parseReceipt(){
    try{return JSON.parse($('receipt')?.textContent||'');}catch(_){return null;}
  }
  function eligibleReceipt(receipt){
    if(!policy.enabled||!receipt||receipt.mode!=='SIMULATION'||!receipt.receipt_id)return false;
    return policy.eligible_route_classes.includes(String(receipt.provider_route||'').toUpperCase());
  }

  function emitRecognition(receipt,score,{showcase=false}={}){
    if(!eligibleReceipt(receipt))return false;
    const id=routeIdentity(receipt.provider_route);const reward=Number(policy.demo_reward_units||0);
    eventCount++;recognitionUnits=Math.round((recognitionUnits+reward)*100)/100;
    window.dispatchEvent(new CustomEvent('helios:lucky-contribution',{detail:{
      event_name:id.name,event_icon:id.icon,event_detail:id.detail,
      route_class:receipt.provider_route,receipt_id:receipt.receipt_id,
      demo_significance_score:score,reward_units:reward,recognition_units:recognitionUnits,
      reward_ledger:'LUCKY_CONTRIBUTION_LEDGER',authoritative:false,simulated:true,showcase,
      real_money_value:false,wagering_value:false,rng_effect:'NONE',rtp_effect:'NONE',
      bonus_probability_effect:'NONE',personal_jackpot_weight_effect:'NONE',
      notification_surface:'HELIOS_PROFILE'
    }}));
    if(navigator.vibrate&&!showcase)navigator.vibrate([8,18,8]);
    return true;
  }

  function inspectReceipt(){
    const receipt=parseReceipt();
    if(!receipt||!receipt.receipt_id||receipt.receipt_id===lastReceiptId)return;
    lastReceiptId=String(receipt.receipt_id);
    if(!eligibleReceipt(receipt))return;
    lastEligibleReceipt=receipt;
    const score=secureScore();
    if(score < 1-policy.demo_probability_per_receipt)return;
    emitRecognition(receipt,score,{showcase:false});
  }

  function showcase(){
    if(!policy.showcase_manual_trigger)return;
    const receipt=eligibleReceipt(parseReceipt())?parseReceipt():lastEligibleReceipt;
    if(!receipt){
      window.dispatchEvent(new CustomEvent('helios:profile-message',{detail:{message:'Run an eligible compute route until at least one simulated receipt exists.'}}));
      return;
    }
    emitRecognition(receipt,.999999,{showcase:true});
  }

  function observeReceipts(){
    const el=$('receipt');if(!el)return false;
    new MutationObserver(()=>setTimeout(inspectReceipt,20)).observe(el,{childList:true,characterData:true,subtree:true});
    setTimeout(inspectReceipt,60);return true;
  }

  async function init(){
    await loadPolicy();window.addEventListener('helios:showcase-lucky-contribution',showcase);
    let tries=0;const attach=()=>{if(observeReceipts())return;if(++tries<100)setTimeout(attach,80);};attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
