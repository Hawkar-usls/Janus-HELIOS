(() => {
  'use strict';

  const CORE_VERSION='1.7.0';
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const VALID_SPIN_SOURCES = new Set(['balance','energy','bonus']);
  const MODE_META = {
    helios:{name:'HELIOS',icon:'☀',lines:'3L',summary:'Universal Core · balanced demo profile',symbols:['☀','⬡','◈','⚙','✦','∆','◇'],weights:[8,15,16,18,17,14,12],pays:{'☀':[0,0,1.8,4,10],'⬡':[0,0,1.3,3,7],'◈':[0,0,1.1,2.5,6],'⚙':[0,0,.9,2,4.5],'✦':[0,0,.8,1.7,3.8],'∆':[0,0,.7,1.5,3.2],'◇':[0,0,.6,1.2,2.5]}},
    divine:{name:'DIVINE',icon:'✦',lines:'5L',summary:'Science Child · radiant lattice profile',symbols:['✦','☼','◇','△','❖','✧','⬡'],weights:[8,13,16,17,16,14,16],pays:{'✦':[0,0,2,4.5,11],'☼':[0,0,1.5,3.2,7.5],'◇':[0,0,1.2,2.7,6.3],'△':[0,0,1,2.2,5],'❖':[0,0,.9,1.9,4.2],'✧':[0,0,.75,1.6,3.4],'⬡':[0,0,.65,1.35,2.7]}},
    gridjack:{name:'GRIDJACK',icon:'◈',lines:'9L',summary:'Treasury Child · dense jackpot profile',symbols:['◈','⬢','⚡','⬡','◆','⬣','◇'],weights:[7,12,15,16,17,17,16],pays:{'◈':[0,0,2.2,5,12],'⬢':[0,0,1.6,3.5,8],'⚡':[0,0,1.3,3,6.8],'⬡':[0,0,1,2.3,5.2],'◆':[0,0,.9,1.9,4.3],'⬣':[0,0,.75,1.6,3.3],'◇':[0,0,.6,1.3,2.6]}},
    custom:{name:'CUSTOM',icon:'⚙',lines:'3P',summary:'Buyer Config · abstract operator profile',symbols:['⚙','⌘','⧉','⧫','◌','◇','⬡'],weights:[9,13,15,16,16,16,15],pays:{'⚙':[0,0,1.9,4.2,10],'⌘':[0,0,1.45,3.1,7.2],'⧉':[0,0,1.15,2.6,6],'⧫':[0,0,1,2.2,5],'◌':[0,0,.85,1.8,4],'◇':[0,0,.7,1.45,3],'⬡':[0,0,.6,1.25,2.5]}}
  };
  const DEFAULT_ROUTES=[
    {id:'market',label:'MARKET',route_class:'MARKETPLACE',icon:'↗',description:'Paid workload marketplace',path:'CONSENT → HELIOS → MARKETPLACE → REQUESTOR → VERIFIED PAYMENT → PLAYER VALUE + TREASURY'},
    {id:'science',label:'SCIENCE',route_class:'SCIENCE',icon:'✦',description:'Research / public-good workload',path:'CONSENT → HELIOS → SCIENCE → VERIFIED WORK UNIT → IMPACT LEDGER'},
    {id:'jackpot',label:'TREASURY',route_class:'TREASURY',icon:'◈',description:'Shared economic compute pool',path:'CONSENT → HELIOS → TREASURY → VERIFIED RECEIPT → SHARED POOL'},
    {id:'datacenter',label:'DC',route_class:'DATACENTER',icon:'▦',description:'Operator data-center offload',path:'CONSENT → HELIOS → DATACENTER → WORKLOAD → VERIFIED RECEIPT'},
    {id:'operator',label:'OPERATOR',route_class:'OPERATOR',icon:'⌘',description:'Buyer-owned infrastructure',path:'CONSENT → HELIOS → OPERATOR INFRA → VERIFIED RECEIPT'},
    {id:'custom',label:'CUSTOM',route_class:'CUSTOM',icon:'⚙',description:'Buyer-defined approved provider',path:'CONSENT → HELIOS → CUSTOM PROVIDER → VERIFIED RECEIPT'}
  ];
  const PAYLINES={
    helios:[[1,1,1,1,1],[0,1,2,1,0],[2,1,0,1,2]],
    divine:[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2]],
    gridjack:[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,1,2,1],[1,2,1,0,1]],
    custom:[[1,1,1,1,1],[0,1,2,1,0],[2,1,0,1,2]]
  };
  const CASCADE_LADDER=[1,4,16,64];
  const CASCADE_MAX_STEPS=8;
  const CASCADE_COLLAPSE_MS=260;
  const CASCADE_REFILL_MS=340;

  let mode='helios',routes=DEFAULT_ROUTES,route='market',computeOn=false,units=0,balance=1000,totalWins=0,totalSpins=0,spinning=false,autoLeft=0,receiptSeq=0;
  let lastPaidWin=0,spinEnergyBank=0,spinEnergyProgress=0,lastEnergyTick=Date.now(),energyTimer=null;
  let bonusEntitlement={active:false,token:null,session_id:null,feature:null,tier_id:null,remaining:0,total_granted:0,max_total_spins:0};

  function secureRandomUint(){const a=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(a);else a[0]=(Math.random()*0xffffffff)>>>0;return a[0]>>>0;}
  function secureUnit(){return secureRandomUint()/0xffffffff;}
  function secureOpaqueToken(prefix='bonus'){if(globalThis.crypto?.randomUUID)return `${prefix}:${globalThis.crypto.randomUUID()}`;if(globalThis.crypto?.getRandomValues){const bytes=new Uint8Array(24);globalThis.crypto.getRandomValues(bytes);return `${prefix}:${[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('')}`;}throw new Error('SECURE_RANDOM_REQUIRED_FOR_BONUS_CAPABILITY');}
  function weightedPick(meta){const sum=meta.weights.reduce((a,b)=>a+b,0);let r=secureUnit()*sum;for(let i=0;i<meta.symbols.length;i++){r-=meta.weights[i];if(r<=0)return meta.symbols[i];}return meta.symbols.at(-1);}
  function round2(n){return Math.round(Number(n)*100)/100;}
  function coreBalanceText(){const el=$('balance');if(el)el.textContent=balance.toFixed(2);}

  function bonusSnapshot(){return Object.freeze({active:bonusEntitlement.active,session_id:bonusEntitlement.session_id,feature:bonusEntitlement.feature,tier_id:bonusEntitlement.tier_id,remaining:bonusEntitlement.remaining,total_granted:bonusEntitlement.total_granted,max_total_spins:bonusEntitlement.max_total_spins});}
  function openBonusSession({feature='SOLAR_CORONA_FREE_SPINS',tier_id='unknown',initial_spins,max_total_spins,session_id=null}={}){
    if(bonusEntitlement.active)return {ok:false,reason:'BONUS_SESSION_ALREADY_ACTIVE'};
    const initial=Math.max(1,Math.min(100,Math.floor(Number(initial_spins)||0)));
    const cap=Math.max(initial,Math.min(200,Math.floor(Number(max_total_spins)||initial));
    const token=secureOpaqueToken('helios-bonus');
    bonusEntitlement={active:true,token,session_id:String(session_id||`bonus-${Date.now()}`),feature:String(feature),tier_id:String(tier_id),remaining:initial,total_granted:initial,max_total_spins:cap};
    window.dispatchEvent(new CustomEvent('helios:core-bonus-session-open',{detail:{...bonusSnapshot(),source_authority:'GAME_CORE',real_money_value:false}}));
    return {ok:true,token,snapshot:bonusSnapshot()};
  }
  function grantBonusSpins(token,count){
    if(!bonusEntitlement.active||token!==bonusEntitlement.token)return {ok:false,reason:'INVALID_BONUS_CAPABILITY',granted:0,snapshot:bonusSnapshot()};
    const requested=Math.max(0,Math.floor(Number(count)||0));
    const room=Math.max(0,bonusEntitlement.max_total_spins-bonusEntitlement.total_granted);
    const granted=Math.min(requested,room);
    bonusEntitlement.remaining+=granted;bonusEntitlement.total_granted+=granted;
    if(granted>0)window.dispatchEvent(new CustomEvent('helios:core-bonus-spins-granted',{detail:{granted,...bonusSnapshot(),source_authority:'GAME_CORE',real_money_value:false}}));
    return {ok:true,granted,snapshot:bonusSnapshot()};
  }
  async function spinBonus(token){
    if(!bonusEntitlement.active||token!==bonusEntitlement.token)return {ok:false,reason:'INVALID_BONUS_CAPABILITY'};
    if(bonusEntitlement.remaining<=0)return {ok:false,reason:'BONUS_ENTITLEMENT_EXHAUSTED',snapshot:bonusSnapshot()};
    if(spinning)return {ok:false,reason:'SPIN_ALREADY_ACTIVE',snapshot:bonusSnapshot()};
    bonusEntitlement.remaining-=1;
    try{
      const detail=await spin({source:'bonus',bonusCapability:token});
      if(!detail){bonusEntitlement.remaining+=1;return {ok:false,reason:'BONUS_SPIN_NOT_STARTED',snapshot:bonusSnapshot()};}
      return {ok:true,detail,snapshot:bonusSnapshot()};
    }catch(error){bonusEntitlement.remaining+=1;throw error;}
  }
  function closeBonusSession(token){
    if(!bonusEntitlement.active||token!==bonusEntitlement.token)return {ok:false,reason:'INVALID_BONUS_CAPABILITY'};
    const closed=bonusSnapshot();
    bonusEntitlement={active:false,token:null,session_id:null,feature:null,tier_id:null,remaining:0,total_granted:0,max_total_spins:0};
    window.dispatchEvent(new CustomEvent('helios:core-bonus-session-close',{detail:{...closed,source_authority:'GAME_CORE',real_money_value:false}}));
    return {ok:true,snapshot:closed};
  }
  function debitDemoBalance({amount,reason}={}){
    const value=round2(Number(amount)||0);
    if(reason!=='BONUS_PURCHASE')return {ok:false,reason:'UNSUPPORTED_LEDGER_DEBIT_REASON',balance};
    if(spinning)return {ok:false,reason:'SPIN_ACTIVE',balance};
    if(!(value>0))return {ok:false,reason:'INVALID_DEBIT_AMOUNT',balance};
    if(balance+1e-9<value)return {ok:false,reason:'INSUFFICIENT_DEMO_BALANCE',balance};
    balance=round2(balance-value);coreBalanceText();
    const detail={reason,amount:value,balance,ledger:'DEMO_BALANCE',source_authority:'GAME_CORE',real_money_value:false};
    window.dispatchEvent(new CustomEvent('helios:core-ledger-debit',{detail}));
    return {ok:true,...detail};
  }

  function modeMeta(){return MODE_META[mode]||MODE_META.helios;}
  function currentLines(){return PAYLINES[mode]||PAYLINES.helios;}
  function routeObj(){return routes.find(r=>r.id===route)||routes[0];}
  function gameGrid(){return Array.from({length:5},()=>Array.from({length:3},()=>({s:weightedPick(modeMeta())})));}
  function evalGrid(grid){
    const meta=modeMeta(),wins=[];
    currentLines().forEach((line,li)=>{
      const first=grid[0][line[0]].s;let count=1;
      for(let col=1;col<5;col++){if(grid[col][line[col]].s===first)count++;else break;}
      if(count>=3){const pay=meta.pays[first]?.[count]||0;if(pay>0)wins.push({line:li,count,symbol:first,pay,cells:Array.from({length:count},(_,col)=>[col,line[col]])});}
    });
    return wins;
  }
  function winAmount(wins,bet,multiplier=1){return round2(wins.reduce((s,w)=>s+w.pay*bet,s)*multiplier);}
  function cellAt(col,row){return document.querySelector(`.reel[data-col="${col}"] .cell[data-row="${row}"]`);}
  function renderGrid(grid,{clearHits=true}={}){
    for(let c=0;c<5;c++)for(let r=0;r<3;r++){const el=cellAt(c,r);if(!el)continue;el.textContent=grid[c][r].s;if(clearHits)el.classList.remove('hit');}
  }
  function markWinningCells(wins){wins.forEach(w=>w.cells.forEach(([c,r])=>cellAt(c,r)?.classList.add('hit')));}
  function cascadeIndex(step){return Math.min(step,CASCADE_LADDER.length-1);}
  function cascadeMultiplier(step){return CASCADE_LADDER[cascadeIndex(step)];}

  function collapseWinningCells(grid,wins){
    const removed=Array.from({length:5},()=>new Set());
    wins.forEach(w=>w.cells.forEach(([c,r])=>removed[c].add(r)));
    for(let c=0;c<5;c++){
      const survivors=[];
      for(let r=2;r>=0;r--)if(!removed[c].has(r))survivors.push(grid[c][r]);
      const next=Array(3).fill(null);let write=2;
      for(const item of survivors)next[write--]=item;
      grid[c]=next;
    }
    return removed;
  }

  async function animateCollapse(grid,removed){
    for(let c=0;c<5;c++)for(const r of removed[c]){const el=cellAt(c,r);if(el){el.classList.add('cascade-remove');el.textContent='';}}
    await sleep(CASCADE_COLLAPSE_MS);
    for(let c=0;c<5;c++)for(let r=0;r<3;r++){const el=cellAt(c,r);if(!el)continue;el.classList.remove('cascade-remove','hit');const item=grid[c][r];el.textContent=item?.s||'';if(item)el.classList.add('cascade-drop');else el.classList.add('cascade-hole');}
    await sleep(150);
  }

  async function refillGrid(grid){
    for(let c=0;c<5;c++)for(let r=0;r<3;r++)if(!grid[c][r])grid[c][r]={s:weightedPick(modeMeta())};
    for(let c=0;c<5;c++)for(let r=0;r<3;r++){const el=cellAt(c,r);if(!el)continue;el.classList.remove('cascade-hole');el.textContent=grid[c][r].s;if(el.classList.contains('cascade-drop'))el.classList.remove('cascade-drop');else el.classList.add('cascade-refill');}
    await sleep(CASCADE_REFILL_MS);
    document.querySelectorAll('.cell').forEach(el=>el.classList.remove('cascade-refill','cascade-drop'));
  }

  function buildReels(){
    const root=$('reels');if(!root)return;root.innerHTML='';
    for(let c=0;c<5;c++){
      const reel=document.createElement('div');reel.className='reel';reel.dataset.col=String(c);
      for(let r=0;r<3;r++){const cell=document.createElement('div');cell.className='cell';cell.dataset.row=String(r);cell.textContent=weightedPick(modeMeta());reel.appendChild(cell);}
      root.appendChild(reel);
    }
  }
  function buildModes(){
    const root=$('game-modes');if(!root)return;root.innerHTML='';
    Object.entries(MODE_META).forEach(([id,m])=>{
      const b=document.createElement('button');b.type='button';b.className='mode-btn';b.dataset.mode=id;b.innerHTML=`<span class="mi">${m.icon}</span><b>${m.name}</b><small>${m.lines} · ${m.summary.split('·')[0].trim()}</small>`;b.onclick=()=>setMode(id);root.appendChild(b);
    });
  }
  function buildRoutes(){
    const root=$('route-grid');if(!root)return;root.innerHTML='';
    routes.forEach(r=>{
      const b=document.createElement('button');b.type='button';b.className='route';b.dataset.route=r.id;
      const icon=document.createElement('span');icon.className='r-icon';icon.textContent=r.icon||'◇';
      const title=document.createElement('b');title.textContent=r.label||r.id.toUpperCase();
      const desc=document.createElement('small');desc.textContent=r.description||r.route_class||'Approved route';
      b.append(icon,title,desc);b.onclick=()=>{route=r.id;renderAll();};root.appendChild(b);
    });
  }
  function setMode(next){
    if(spinning)return;mode=MODE_META[next]?next:'helios';document.body.dataset.gameMode=mode;buildReels();renderAll();
  }
  function renderAll(){
    const m=modeMeta(),r=routeObj();
    document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    document.querySelectorAll('.route').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
    $('station-name').textContent=`${m.name} STATION`;$('mode-summary').textContent=m.summary;$('mode-lines').textContent=m.lines;$('mode-short').textContent=m.name.slice(0,3).toUpperCase();
    $('selected-route').textContent=r.label;$('route-path').textContent=r.path;$('compute-state').textContent=computeOn?'ACTIVE':'OFF';$('compute-state').className=computeOn?'ok':'';$('compute-units').textContent=units.toFixed(2);$('balance').textContent=balance.toFixed(2);$('total-wins').textContent=totalWins.toFixed(2);$('total-spins').textContent=String(totalSpins);$('last-win-value').textContent=lastPaidWin.toFixed(2);$('core').classList.toggle('active',computeOn);$('receipt-status').textContent=computeOn?'SIMULATED':'NO RECEIPT';$('cpu-label').textContent=`${$('cpu').value}%`;renderSpinEnergy();
  }

  function renderGameState({spinWin=0,source='balance',cascadeCount=0,peakMultiplier=1}={}){
    if(spinWin>0)lastPaidWin=spinWin;
    $('balance').textContent=balance.toFixed(2);$('total-wins').textContent=totalWins.toFixed(2);$('total-spins').textContent=String(totalSpins);$('last-win-value').textContent=lastPaidWin.toFixed(2);renderSpinEnergy();
    const suffix=source==='energy'?'ENERGY REWARD':source==='bonus'?'BONUS WIN':'HELIOS UNITS';
    const em=$('last-win-card')?.querySelector('em');if(em)em.textContent=suffix;
    window.dispatchEvent(new CustomEvent('helios:game-state',{detail:{spin_win:spinWin,last_paid_win:lastPaidWin,total_wins:totalWins,total_spins:totalSpins,balance,source,cascades:cascadeCount,peak_multiplier:peakMultiplier,bonus_core_remaining:bonusEntitlement.remaining}}));
  }

  async function spin({fromAuto=false,source='balance',bonusCapability=null}={}){
    if(spinning)return null;
    if(!VALID_SPIN_SOURCES.has(source))return null;
    const isEnergy=source==='energy',isBonus=source==='bonus';
    if(isBonus&&(!bonusEntitlement.active||bonusCapability!==bonusEntitlement.token))return null;
    const bet=Number($('bet').value);
    if(!isEnergy&&!isBonus&&balance<bet){autoLeft=0;renderAuto();return null;}
    if(isEnergy&&spinEnergyBank<1){renderSpinEnergy();return null;}
    if(!isEnergy&&!isBonus)balance=round2(balance-bet);else if(isEnergy)spinEnergyBank=Math.max(0,spinEnergyBank-1);
    totalSpins++;spinning=true;$('spin').disabled=true;$('auto-spin').disabled=true;document.querySelectorAll('.mode-btn').forEach(b=>b.disabled=true);document.querySelectorAll('.route').forEach(b=>b.disabled=true);
    const grid=gameGrid(),reelEls=[...document.querySelectorAll('.reel')];
    reelEls.forEach(reel=>[...reel.children].forEach(cell=>{cell.classList.remove('hit');cell.classList.add('spin');}));
    const finalWins=evalGrid(grid);
    for(let c=0;c<5;c++){
      await sleep(105+c*48);
      for(let r=0;r<3;r++){const cell=reelEls[c]?.children[r];if(cell){cell.textContent=grid[c][r].s;cell.classList.remove('spin');}}
      if(navigator.vibrate)navigator.vibrate(5);
    }
    await sleep(90);

    let cascadeCount=0,peakMultiplier=1,chainTotal=0,currentWins=finalWins;
    while(currentWins.length&&cascadeCount<CASCADE_MAX_STEPS){
      const multiplier=cascadeMultiplier(cascadeCount),paid=winAmount(currentWins,bet,multiplier);peakMultiplier=multiplier;chainTotal=round2(chainTotal+paid);markWinningCells(currentWins);
      window.dispatchEvent(new CustomEvent('helios:cascade',{detail:{cascade_index:cascadeCount+1,multiplier,win:paid,chain_total:chainTotal,source,compute_effect:'NONE',initial_stop_effect:'NONE'}}));
      await sleep(260);
      const removed=collapseWinningCells(grid,currentWins);await animateCollapse(grid,removed);await refillGrid(grid);cascadeCount++;currentWins=evalGrid(grid);
    }
    document.querySelectorAll('.cell').forEach(el=>el.classList.remove('hit'));
    const spinWin=round2(chainTotal);
    let energyRewardUnits=0;
    if(isEnergy){energyRewardUnits=spinWin;if(energyRewardUnits>0)window.dispatchEvent(new CustomEvent('helios:spin-energy-earned',{detail:{mode,route_class:routeObj().route_class,reward_units:energyRewardUnits,cascade_count:cascadeCount,peak_multiplier:peakMultiplier,real_money_value:false,game_balance_effect:'NONE'}}));}
    else balance=round2(balance+spinWin);
    totalWins=round2(totalWins+spinWin);
    renderGameState({spinWin,source,cascadeCount,peakMultiplier});
    const completion={spin_win:spinWin,last_paid_win:lastPaidWin,total_wins:totalWins,total_spins:totalSpins,balance,bet,source,cascades:cascadeCount,peak_multiplier:peakMultiplier,energy_reward_units:energyRewardUnits,bonus_core_remaining:bonusEntitlement.remaining};
    window.dispatchEvent(new CustomEvent('helios:spin-complete',{detail:completion}));
    spinning=false;$('spin').disabled=false;$('auto-spin').disabled=false;document.querySelectorAll('.mode-btn').forEach(b=>b.disabled=false);document.querySelectorAll('.route').forEach(b=>b.disabled=false);updateSpinEnergyEligibility();
    if(autoLeft>0&&source==='balance'){autoLeft--;renderAuto();if(autoLeft>0)setTimeout(()=>spin({fromAuto:true}),220);}
    else if(autoLeft===0)renderAuto();
    return completion;
  }
  function toggleAuto(){if(spinning&&autoLeft===0)return;if(autoLeft>0){autoLeft=0;renderAuto();return;}autoLeft=10;renderAuto();if(!spinning)spin({fromAuto:true});}
  function renderAuto(){$('auto-spin').textContent=autoLeft>0?`AUTO · ${autoLeft}`:'AUTO ×10';$('auto-spin').classList.toggle('active',autoLeft>0);}

  function energyPolicy(){return window.__HELIOS_PUBLIC_CONFIG?.spin_energy||{enabled:true,seconds_per_spin:30,max_spin_bank:3,eligible_routes:['MARKETPLACE','SCIENCE','TREASURY','DATACENTER','OPERATOR','CUSTOM'],eligible_game_modes:['gridjack'],real_money_value:false};}
  function energyEligible(){const p=energyPolicy(),r=routeObj();return Boolean(p.enabled&&computeOn&&p.eligible_game_modes?.includes(mode)&&p.eligible_routes?.includes(r.route_class));}
  function renderSpinEnergy(){
    const panel=$('spin-energy-panel');if(!panel)return;const p=energyPolicy(),eligible=energyEligible(),seconds=Math.max(1,Number(p.seconds_per_spin||30)),pct=Math.min(100,(spinEnergyProgress/seconds)*100);panel.classList.toggle('active',eligible);$('spin-energy-bank').textContent=String(spinEnergyBank);$('spin-energy-progress').style.width=`${pct}%`;$('spin-energy-time').textContent=eligible?`${Math.max(0,seconds-spinEnergyProgress).toFixed(0)}s`:'PAUSED';const b=$('energy-spin');if(b){b.disabled=spinning||spinEnergyBank<1;b.textContent=`ENERGY SPIN · ${spinEnergyBank}`;}
  }
  function buildSpinEnergy(){
    if($('spin-energy-panel'))return;const panel=document.createElement('section');panel.id='spin-energy-panel';panel.className='spin-energy-panel';panel.innerHTML='<div class="spin-energy-copy"><b>◈ SPIN ENERGY</b><span>Eligible opted-in compute may earn demo-only manual spins. No cash value. No automatic wager conversion.</span></div><div class="spin-energy-meter"><div id="spin-energy-progress"></div></div><small id="spin-energy-time">PAUSED</small><button id="energy-spin" class="energy-spin-btn" type="button" disabled>ENERGY SPIN · 0</button><strong id="spin-energy-bank">0</strong>';
    document.querySelector('.game-controls')?.after(panel);$('energy-spin').onclick=()=>{if(!spinning&&spinEnergyBank>0)spin({source:'energy'});};
  }
  function tickSpinEnergy(){const now=Date.now(),elapsed=Math.max(0,Math.min(2,(now-lastEnergyTick)/1000));lastEnergyTick=now;const p=energyPolicy(),seconds=Math.max(1,Number(p.seconds_per_spin||30)),max=Math.max(1,Number(p.max_spin_bank||3));if(energyEligible()&&spinEnergyBank<max){spinEnergyProgress+=elapsed;while(spinEnergyProgress>=seconds&&spinEnergyBank<max){spinEnergyProgress-=seconds;spinEnergyBank++;window.dispatchEvent(new CustomEvent('helios:spin-energy-earned',{detail:{mode,route_class:routeObj().route_class,bank:spinEnergyBank,seconds_per_spin:seconds,real_money_value:false,source:'ELIGIBLE_DEMO_COMPUTE_TIME',game_effect:'MANUAL_DEMO_SPIN_ONLY'}}));}if(spinEnergyBank>=max)spinEnergyProgress=0;}renderSpinEnergy();}
  function updateSpinEnergyEligibility(){lastEnergyTick=Date.now();renderSpinEnergy();}

  async function toggleCompute(on){
    if(on){if(!$('consent').checked)return;computeOn=true;}else{computeOn=false;$('consent').checked=false;}
    $('power-on').disabled=computeOn;$('power-off').disabled=!computeOn;renderAll();updateSpinEnergyEligibility();
    if(computeOn)simulateReceipt();else{$('receipt').textContent='Compute is OFF. Select a destination, grant consent, then route power.';$('receipt-status').textContent='NO RECEIPT';}
  }
  function simulateReceipt(){
    if(!computeOn)return;const r=routeObj(),cpu=Number($('cpu').value),inc=round2(.15+cpu/180);units=round2(units+inc);receiptSeq++;
    const receipt={receipt_id:`SIM-${Date.now().toString(36).toUpperCase()}-${receiptSeq}`,status:'SIMULATED_ONLY',route_id:r.id,route_class:r.route_class,cpu_policy_percent:cpu,compute_units:inc,game_effect:'NONE',verified_by:'PUBLIC_DEMO_NOT_AUTHORITATIVE',ts:new Date().toISOString()};$('receipt').textContent=JSON.stringify(receipt,null,2);renderAll();window.dispatchEvent(new CustomEvent('helios:compute-receipt',{detail:receipt}));setTimeout(simulateReceipt,1850);
  }
  function loadConfig(){
    return fetch('./config/helios.public.json',{cache:'no-store'}).then(r=>r.json()).then(cfg=>{window.__HELIOS_PUBLIC_CONFIG=cfg;if(Array.isArray(cfg.routes)&&cfg.routes.length)routes=cfg.routes.map((r,i)=>({...DEFAULT_ROUTES[i%DEFAULT_ROUTES.length],...r}));if(cfg.default_route&&routes.some(r=>r.id===cfg.default_route))route=cfg.default_route;if(cfg.branding){$('brand-name').textContent=cfg.branding.product_name||'JANUS HELIOS';$('brand-tagline').textContent=cfg.branding.tagline||'ONE CORE · ANY DESTINATION';}const p=cfg.resource_policy||{};$('cpu').max=String(p.cpu_max_percent||30);$('cpu').value=String(p.cpu_default_percent||15);$('config-state').textContent='LOADED';$('config-state').className='ok';$('sys-config').textContent='Loaded';buildRoutes();renderAll();}).catch(()=>{$('config-state').textContent='FALLBACK';$('sys-config').textContent='Fallback';});
  }

  function injectDynamicStyles(){
    const s=document.createElement('style');s.textContent=`
      .cell.spin{filter:blur(2px);opacity:.62;transform:translateY(3px)}.cell.cascade-remove{animation:heliosCascadeVanish ${CASCADE_COLLAPSE_MS}ms ease forwards}.cell.cascade-hole{opacity:.16;transform:translateY(-5px)}.cell.cascade-drop{animation:heliosCascadeDrop .18s ease}.cell.cascade-refill{animation:heliosCascadeRefill ${CASCADE_REFILL_MS}ms cubic-bezier(.16,.8,.2,1)}
      @keyframes heliosCascadeVanish{0%{opacity:1;transform:scale(1)}55%{opacity:.72;transform:scale(1.06);filter:brightness(1.8)}100%{opacity:0;transform:scale(.3) rotate(9deg);filter:blur(4px)}}@keyframes heliosCascadeDrop{from{opacity:.3;transform:translateY(-10px)}to{opacity:1;transform:none}}@keyframes heliosCascadeRefill{from{opacity:0;transform:translateY(-30px) scale(.88)}55%{opacity:1;transform:translateY(4px) scale(1.02)}to{opacity:1;transform:none}}
      .spin-energy-panel{display:none;grid-template-columns:1.15fr 1.5fr auto auto auto;gap:7px;align-items:center;border:1px solid #294133;background:#07110d;border-radius:10px;padding:8px;margin:7px 0}.spin-energy-panel.active{display:grid}.spin-energy-copy b{display:block;color:#95ff9a;font-size:8px}.spin-energy-copy span{display:block;color:#72837a;font-size:6px;line-height:1.3;margin-top:2px}.spin-energy-meter{height:5px;border-radius:99px;background:#142018;overflow:hidden}.spin-energy-meter>div{height:100%;width:0;background:linear-gradient(90deg,#4a9861,#95ff9a);transition:width .2s}.spin-energy-panel small{color:#809087;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.energy-spin-btn{border:1px solid #376445;background:#0b1b11;color:#95ff9a;border-radius:8px;padding:6px 8px;font-size:7px;font-weight:900}.spin-energy-panel>strong{color:#d7ffe0;font:900 14px ui-monospace,SFMono-Regular,Consolas,monospace}@media(max-width:720px){.spin-energy-panel{grid-template-columns:1fr auto auto}.spin-energy-copy{grid-column:1/-1}.spin-energy-meter{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }
  function bind(){
    $('spin').onclick=()=>spin();$('auto-spin').onclick=toggleAuto;$('power-on').onclick=()=>toggleCompute(true);$('power-off').onclick=()=>toggleCompute(false);$('cpu').oninput=()=>{$('cpu-label').textContent=`${$('cpu').value}%`;};$('consent').onchange=()=>{if(!$('consent').checked&&computeOn)toggleCompute(false);};document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON'].includes(document.activeElement?.tagName)){e.preventDefault();spin();}});
  }
  function init(){injectDynamicStyles();buildModes();buildRoutes();buildReels();buildSpinEnergy();bind();renderAll();loadConfig();energyTimer=setInterval(tickSpinEnergy,1000);window.addEventListener('pagehide',()=>clearInterval(energyTimer),{once:true});}

  window.HELIOS_GAME_CORE=Object.freeze({
    version:CORE_VERSION,
    trust_boundary:'PUBLIC_DEMO_BROWSER_NOT_AUTHORITATIVE_PRODUCTION_LEDGER',
    getDemoBalance:()=>balance,
    ledger:Object.freeze({debitDemoBalance}),
    bonus:Object.freeze({openSession:openBonusSession,grantSpins:grantBonusSpins,spin:spinBonus,closeSession:closeBonusSession,snapshot:bonusSnapshot})
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();