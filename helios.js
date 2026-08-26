(() => {
  const FALLBACK_ROUTES = [
    {key:'market',icon:'⬡',name:'COMPUTE MARKET',short:'MARKET',route_class:'MARKETPLACE',task_type:'ECONOMIC_COMPUTE_JOB',demo_proof_kind:'MOCK_ECONOMIC_COMPUTE_RECEIPT',description:'Golem or another approved requestor/provider market.',path:'CONSENT → HELIOS → MARKETPLACE → REQUESTOR → VERIFIED PAYMENT → PLAYER VALUE + TREASURY',sink:'PLAYER_COMPUTE_EARNINGS_LEDGER + COMPUTE_TREASURY',demo_asset:'market-credit',demo_player_ratio:.7,demo_shared_ratio:.3,enabled:true},
    {key:'science',icon:'✦',name:'SCIENCE',short:'SCIENCE',route_class:'SCIENCE',task_type:'SCIENCE_WORK_UNIT',demo_proof_kind:'MOCK_SCIENCE_RECEIPT',description:'Research or public-good workload with upstream acceptance.',path:'CONSENT → HELIOS → RESEARCH REQUESTOR → SCIENCE WORK → VERIFIED RECEIPT → IMPACT LEDGER',sink:'IMPACT_LEDGER',demo_asset:'impact-credit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'jackpot',icon:'◈',name:'JACKPOT POOL',short:'TREASURY',route_class:'TREASURY',task_type:'POW_SHARE',demo_proof_kind:'MOCK_POOL_SHARE',description:'Shared mining/pool revenue routed into a transparent reserve.',path:'CONSENT → HELIOS → APPROVED POOL → ACCEPTED SHARE → VERIFIED REVENUE → COMPUTE TREASURY',sink:'COMPUTE_TREASURY',demo_asset:'treasury-credit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'datacenter',icon:'▦',name:'DATA CENTER',short:'DC',route_class:'DATACENTER',task_type:'GENERAL_COMPUTE_JOB',demo_proof_kind:'MOCK_GENERAL_COMPUTE_RECEIPT',description:'Buyer-selected cloud, batch, render, analytics or HPC workload.',path:'CONSENT → HELIOS → DATA CENTER GATEWAY → GENERAL WORKLOAD → VERIFIED RECEIPT → CONTRACT SINK',sink:'CONTRACT_DEFINED_AUDITED_SINK',demo_asset:'compute-unit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'operator',icon:'⚙',name:'OPERATOR',short:'OPERATOR',route_class:'OPERATOR',task_type:'GENERAL_COMPUTE_JOB',demo_proof_kind:'MOCK_GENERAL_COMPUTE_RECEIPT',description:'Approved buyer-owned workload behind a private gateway.',path:'CONSENT → HELIOS → OPERATOR GATEWAY → APPROVED WORKLOAD → VERIFIED RECEIPT → AUDITED SINK',sink:'CONTRACT_DEFINED_AUDITED_SINK',demo_asset:'operator-unit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'custom',icon:'⌘',name:'CUSTOM',short:'CUSTOM',route_class:'CUSTOM',task_type:'GENERAL_COMPUTE_JOB',demo_proof_kind:'MOCK_GENERAL_COMPUTE_RECEIPT',description:'A future admissible provider not known when HELIOS was built.',path:'CONSENT → HELIOS → SIGNED BUYER MANIFEST → CUSTOM ADAPTER → VERIFIER → AUDITED SINK',sink:'CONTRACT_DEFINED_AUDITED_SINK',demo_asset:'custom-unit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true}
  ];

  const GAME_MODES = {
    helios: {
      key:'helios', icon:'☀', name:'HELIOS', short:'HEL', subtitle:'Universal Core', summary:'Universal Core · balanced demo profile',
      payoutScale:1, supportsDemoSpinEnergy:false,
      paylines:[[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2]],
      symbols:[['☀',1.60],['⬡',1.30],['◈',1.10],['⚙',.90],['✦',.72],['∆',.52],['◇',.36]]
    },
    divine: {
      key:'divine', icon:'✦', name:'DIVINE', short:'DIV', subtitle:'Radiant Lattice', summary:'Radiant Lattice · five-line demo profile',
      payoutScale:.58, supportsDemoSpinEnergy:false,
      paylines:[[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2]],
      symbols:[['✦',1.60],['☼',1.30],['◇',1.10],['△',.90],['❖',.72],['✧',.52],['⬡',.36]]
    },
    gridjack: {
      key:'gridjack', icon:'◈', name:'GRIDJACK', short:'GRD', subtitle:'Treasury Pulse', summary:'Treasury Pulse · nine-line demo profile · supports demo Spin Energy',
      payoutScale:.34, supportsDemoSpinEnergy:true,
      paylines:[
        [0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
        [0,0,1,2,2],[2,2,1,0,0],[1,0,1,2,1],[1,2,1,0,1]
      ],
      symbols:[['◈',1.60],['⬢',1.30],['⚡',1.10],['⬡',.90],['◆',.72],['⬣',.52],['◇',.36]]
    },
    custom: {
      key:'custom', icon:'⚙', name:'CUSTOM', short:'CUS', subtitle:'Builder Profile', summary:'Builder Profile · three configurable demo paths',
      payoutScale:.82, supportsDemoSpinEnergy:false,
      paylines:[[1,1,1,1,1],[0,0,1,2,2],[2,2,1,0,0]],
      symbols:[['⚙',1.60],['⌘',1.30],['⧉',1.10],['⧫',.90],['◌',.72],['◇',.52],['⬡',.36]]
    }
  };

  const DEFAULT_SPIN_ENERGY_POLICY = {
    enabled:true,
    seconds_per_spin:30,
    max_bank:3,
    eligible_game_modes:['gridjack'],
    eligible_routes:['jackpot'],
    reward_ledger:'DEMO_ENERGY_REWARD_ONLY',
    real_money_value:false,
    automatic_wager_conversion:false,
    auto_play_from_bank:false
  };

  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  let routes = FALLBACK_ROUTES;
  let routeMap = new Map();
  let routeKey = 'market';
  let enabledModeKeys = Object.keys(GAME_MODES);
  let gameModeKey = 'helios';
  let computeActive = false;
  let computeTimer = null;
  let computeUnits = 0;
  let receiptNo = 0;
  let balance = 1000;
  let spinning = false;
  let totalWins = 0;
  let totalSpins = 0;
  let autoRemaining = 0;
  let autoTimer = null;
  let spinEnergyPolicy = {...DEFAULT_SPIN_ENERGY_POLICY};
  let spinEnergySeconds = 0;
  let spinBank = 0;
  let energyRewardUnits = 0;
  let energyTimer = null;

  function secureIndex(max){
    const a = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(a);
    else a[0] = Math.floor(Math.random() * 0xffffffff);
    return a[0] % max;
  }

  function currentMode(){ return GAME_MODES[gameModeKey] || GAME_MODES.helios; }
  function currentSymbols(){ return currentMode().symbols.map(([s,v]) => ({s,v})); }
  function currentRoute(){ return routeMap.get(routeKey) || null; }

  function setBranding(config){
    const b = config?.branding || {};
    if (b.product_name) $('brand-name').textContent = b.product_name;
    if (b.tagline) $('brand-tagline').textContent = b.tagline;
    if (b.station_name) $('station-name').textContent = b.station_name;
    document.title = `${b.product_name || 'JANUS HELIOS'} — ${b.tagline || 'One Core. Any Destination.'}`;
  }

  function applyPolicy(config){
    const p = config?.resource_policy || {};
    const max = Math.min(30, Math.max(5, Number(p.cpu_max_percent || 30)));
    const def = Math.min(max, Math.max(5, Number(p.cpu_default_percent || 15)));
    $('cpu').max = String(max);
    $('cpu').value = String(def);
    $('cpu-label').textContent = `${def}%`;
  }

  function applyGameConfig(config){
    const declared = Array.isArray(config?.game_modes) ? config.game_modes : [];
    const allowed = declared.filter(x => x?.enabled !== false && GAME_MODES[x?.key]).map(x => x.key);
    if (allowed.length) enabledModeKeys = [...new Set(allowed)];
    const requested = config?.branding?.default_game_mode;
    if (requested && enabledModeKeys.includes(requested)) gameModeKey = requested;

    const p = config?.demo_spin_energy || {};
    spinEnergyPolicy = {
      ...DEFAULT_SPIN_ENERGY_POLICY,
      ...p,
      seconds_per_spin:Math.max(10, Number(p.seconds_per_spin || DEFAULT_SPIN_ENERGY_POLICY.seconds_per_spin)),
      max_bank:Math.max(1, Math.min(10, Number(p.max_bank || DEFAULT_SPIN_ENERGY_POLICY.max_bank))),
      eligible_game_modes:Array.isArray(p.eligible_game_modes) ? p.eligible_game_modes.filter(k=>GAME_MODES[k]) : DEFAULT_SPIN_ENERGY_POLICY.eligible_game_modes,
      eligible_routes:Array.isArray(p.eligible_routes) ? p.eligible_routes : DEFAULT_SPIN_ENERGY_POLICY.eligible_routes,
      real_money_value:false,
      automatic_wager_conversion:false,
      auto_play_from_bank:false
    };
  }

  async function loadConfig(){
    try {
      const response = await fetch('./config/helios.public.json', {cache:'no-store'});
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const config = await response.json();
      const configuredRoutes = Array.isArray(config.routes) ? config.routes.filter(r => r?.enabled === true && r.key) : [];
      if (configuredRoutes.length) routes = configuredRoutes;
      routeKey = config?.branding?.default_route || routes[0]?.key || 'market';
      setBranding(config);
      applyPolicy(config);
      applyGameConfig(config);
      $('config-state').textContent = 'CONFIG LOADED';
      $('config-state').className = 'ok';
      $('sys-config').textContent = 'Loaded';
    } catch (err) {
      routes = FALLBACK_ROUTES;
      routeKey = 'market';
      enabledModeKeys = Object.keys(GAME_MODES);
      gameModeKey = 'helios';
      spinEnergyPolicy = {...DEFAULT_SPIN_ENERGY_POLICY};
      $('config-state').textContent = 'FALLBACK CONFIG';
      $('sys-config').textContent = 'Fallback';
    }
  }

  function randomSymbol(){
    const symbols = currentSymbols();
    return symbols[secureIndex(symbols.length)];
  }

  function buildReels(){
    const reels = $('reels');
    reels.innerHTML = '';
    window.__heliosCells = [];
    window.__heliosReels = [];
    for(let c=0;c<5;c++){
      const reel=document.createElement('div');
      reel.className='reel';
      window.__heliosReels[c]=reel;
      window.__heliosCells[c]=[];
      for(let r=0;r<3;r++){
        const cell=document.createElement('div');
        cell.className='cell';
        cell.textContent=randomSymbol().s;
        reel.appendChild(cell);
        window.__heliosCells[c][r]=cell;
      }
      reels.appendChild(reel);
    }
  }

  function buildGameModes(){
    const host=$('game-modes');
    host.innerHTML='';
    for(const key of enabledModeKeys){
      const mode=GAME_MODES[key];
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='mode-btn';
      btn.dataset.mode=key;
      const top=document.createElement('div');
      const icon=document.createElement('span'); icon.className='mi'; icon.textContent=mode.icon;
      const label=document.createElement('b'); label.textContent=mode.name;
      top.append(icon,label);
      const sub=document.createElement('small'); sub.textContent=mode.subtitle;
      btn.append(top,sub);
      btn.onclick=()=>selectGameMode(key);
      host.appendChild(btn);
    }
    selectGameMode(gameModeKey, {initial:true});
  }

  function selectGameMode(key,{initial=false}={}){
    if(spinning) return;
    if(!enabledModeKeys.includes(key) || !GAME_MODES[key]) return;
    gameModeKey=key;
    document.body.dataset.gameMode=key;
    const mode=currentMode();
    [...$('game-modes').children].forEach(x=>x.classList.toggle('active',x.dataset.mode===key));
    $('mode-summary').textContent=mode.summary;
    $('mode-short').textContent=mode.short;
    $('mode-lines').textContent=`${mode.paylines.length}L`;
    if(!initial) buildReels();
    renderSpinEnergy();
  }

  function buildRoutes(){
    const grid = $('route-grid');
    grid.innerHTML = '';
    routeMap = new Map(routes.map(r => [r.key,r]));
    if (!routeMap.has(routeKey)) routeKey = routes[0]?.key;
    routes.forEach(r => {
      const b=document.createElement('button');
      b.type='button';
      b.className='route';
      b.dataset.route=r.key;
      const icon=document.createElement('span'); icon.className='r-icon'; icon.textContent=r.icon || '⬡';
      const title=document.createElement('b'); title.textContent=r.name;
      const sub=document.createElement('small'); sub.textContent=r.description || '';
      b.append(icon,title,sub);
      b.onclick=()=>selectRoute(r.key);
      grid.appendChild(b);
    });
    selectRoute(routeKey, {initial:true});
  }

  function routePreview(r){
    return {
      product:'JANUS_HELIOS',
      mode:'ROUTE_PREVIEW',
      route_selected:r.key,
      provider_route:r.route_class,
      task_type:r.task_type,
      expected_proof:r.demo_proof_kind,
      sink:r.sink,
      next_step:'GRANT_EXPLICIT_CONSENT_THEN_ROUTE_POWER',
      game_event_weighting:'FORBIDDEN',
      game_effect:'NONE'
    };
  }

  function updatePowerCTA(){
    const r=currentRoute();
    if(!r) return;
    if(computeActive){
      $('power-on').disabled=true;
      $('power-on').textContent=`STREAMING · ${r.short || r.name}`;
      return;
    }
    const allowed=$('consent').checked;
    $('power-on').disabled=!allowed;
    $('power-on').textContent=allowed ? `⚡ ROUTE POWER · ${r.short || r.name}` : `SELECTED · ${r.short || r.name} · GRANT CONSENT`;
  }

  function selectRoute(key,{initial=false}={}){
    if(computeActive){ alert('Stop compute before changing the route.'); return; }
    const r = routeMap.get(key);
    if (!r) return;
    routeKey=key;
    [...$('route-grid').children].forEach(x=>x.classList.toggle('active',x.dataset.route===key));
    $('selected-route').textContent=r.short || r.name;
    $('route-path').textContent=String(r.path || '');
    $('compute-state').textContent='READY · CONSENT OFF';
    $('compute-state').className='solar';
    $('receipt-status').textContent='ROUTE ARMED';
    $('receipt').textContent=JSON.stringify(routePreview(r),null,2);
    const sysRouter=$('sys-router');
    if(sysRouter) sysRouter.textContent=`Armed · ${r.short || r.name}`;
    $('core').classList.remove('armed');
    void $('core').offsetWidth;
    $('core').classList.add('armed');
    setTimeout(()=>$('core').classList.remove('armed'),700);
    updatePowerCTA();
    renderSpinEnergy();
    if(!initial){
      const active=[...$('route-grid').children].find(x=>x.dataset.route===key);
      active?.classList.add('route-pulse');
      setTimeout(()=>active?.classList.remove('route-pulse'),520);
    }
  }

  function demoSpinEnergyMeta(){
    return {
      enabled:Boolean(spinEnergyPolicy.enabled),
      eligible_mode:spinEnergyPolicy.eligible_game_modes.includes(gameModeKey),
      eligible_route:spinEnergyPolicy.eligible_routes.includes(routeKey),
      bank:spinBank,
      progress_seconds:spinEnergySeconds,
      seconds_per_spin:spinEnergyPolicy.seconds_per_spin,
      reward_ledger:'DEMO_ENERGY_REWARD_ONLY',
      real_money_value:false,
      automatic_wager_conversion:false,
      auto_play_from_bank:false
    };
  }

  function renderReceipt(){
    const r=currentRoute();
    if(!r) return;
    receiptNo++;
    computeUnits += .25;
    $('compute-units').textContent=computeUnits.toFixed(2);
    const out={
      product:'JANUS_HELIOS',
      router_version:'1.1.0',
      mode:'SIMULATION',
      receipt_id:`helios_demo_${String(receiptNo).padStart(5,'0')}`,
      provider_route:r.route_class,
      task_type:r.task_type,
      proof_kind:r.demo_proof_kind,
      resource_policy:{cpu_percent:Number($('cpu').value),gpu:false},
      compute_units:.25,
      asset:r.demo_asset,
      sink:r.sink,
      demo_allocation:{player_ratio:Number(r.demo_player_ratio || 0),shared_ratio:Number(r.demo_shared_ratio ?? 1)},
      demo_spin_energy:demoSpinEnergyMeta(),
      scheduling_basis:'CONSENT_DEVICE_POLICY_PROVIDER_CAPACITY_AND_WORKLOAD_ADMISSION',
      game_event_weighting:'FORBIDDEN',
      game_effect:'NONE',
      timestamp:new Date().toISOString()
    };
    $('receipt').textContent=JSON.stringify(out,null,2);
    $('receipt-status').textContent='SIMULATED / STREAMING';
  }

  function startCompute(){
    if(!$('consent').checked){ alert('Explicit compute consent is required.'); return; }
    if(computeActive) return;
    computeActive=true;
    $('compute-state').textContent='ACTIVE';
    $('compute-state').className='ok';
    $('core').classList.add('active');
    $('power-off').disabled=false;
    $('cpu').disabled=true;
    $('consent').disabled=true;
    [...$('route-grid').children].forEach(x=>x.disabled=true);
    $('health-value').textContent='93%';
    const sysRouter=$('sys-router');
    if(sysRouter) sysRouter.textContent='Streaming';
    updatePowerCTA();
    renderReceipt();
    computeTimer=setInterval(renderReceipt,6000);
    startEnergyClock();
  }

  function stopCompute(){
    computeActive=false;
    if(computeTimer) clearInterval(computeTimer);
    computeTimer=null;
    stopEnergyClock();
    $('core').classList.remove('active');
    $('power-off').disabled=true;
    $('cpu').disabled=false;
    $('consent').disabled=false;
    $('consent').checked=false;
    [...$('route-grid').children].forEach(x=>x.disabled=false);
    $('health-value').textContent='87%';
    const r=currentRoute();
    $('compute-state').textContent='READY · CONSENT OFF';
    $('compute-state').className='solar';
    if(r){
      $('receipt-status').textContent='ROUTE ARMED';
      $('receipt').textContent=JSON.stringify(routePreview(r),null,2);
      const sysRouter=$('sys-router');
      if(sysRouter) sysRouter.textContent=`Armed · ${r.short || r.name}`;
    }
    updatePowerCTA();
    renderSpinEnergy();
  }

  function buildOutcome(){
    const grid=[];
    for(let col=0;col<5;col++){
      grid[col]=[];
      for(let row=0;row<3;row++) grid[col][row]=randomSymbol();
    }
    return grid;
  }

  function evaluate(grid,bet){
    const mode=currentMode();
    let win=0;
    const hits=[];
    const hitKeys=new Set();
    for(const line of mode.paylines){
      const first=grid[0][line[0]].s;
      let count=1;
      for(let col=1;col<5;col++){
        if(grid[col][line[col]].s===first) count++;
        else break;
      }
      if(count>=3){
        const base=currentSymbols().find(x=>x.s===first)?.v || .35;
        const countFactor=count===5?4:count===4?2:1;
        win += bet * base * countFactor * mode.payoutScale;
        for(let col=0;col<count;col++){
          const row=line[col];
          const hitKey=`${col}:${row}`;
          if(!hitKeys.has(hitKey)){ hitKeys.add(hitKey); hits.push([col,row]); }
        }
      }
    }
    return {win:Math.round(win*100)/100,hits};
  }

  function pulseMachine(kind='land'){
    const panel=$('game-panel');
    panel.classList.remove('impact','win-impact');
    void panel.offsetWidth;
    panel.classList.add(kind==='win'?'win-impact':'impact');
    if(kind==='land') setTimeout(()=>panel.classList.remove('impact'),260);
    else setTimeout(()=>panel.classList.remove('win-impact'),900);
  }

  function burstAtReel(reelIndex){
    const reels=$('reels');
    const reel=window.__heliosReels?.[reelIndex];
    if(!reels || !reel) return;
    const host=reels.getBoundingClientRect();
    const box=reel.getBoundingClientRect();
    const x=box.left-host.left+box.width/2;
    const y=box.top-host.top+box.height/2;
    for(let i=0;i<7;i++){
      const p=document.createElement('i');
      p.className='solar-particle';
      p.style.left=`${x}px`;
      p.style.top=`${y}px`;
      const angle=(Math.PI*2*i/7)+(secureIndex(30)/100);
      const dist=18+secureIndex(26);
      p.style.setProperty('--dx',`${Math.cos(angle)*dist}px`);
      p.style.setProperty('--dy',`${Math.sin(angle)*dist}px`);
      reels.appendChild(p);
      setTimeout(()=>p.remove(),650);
    }
  }

  async function animateReel(col, finalColumn, stopDelay){
    const reel=window.__heliosReels[col];
    const cells=window.__heliosCells[col];
    reel.classList.add('reel-spinning');
    cells.forEach(c=>{c.classList.remove('hit');c.classList.add('spin')});
    const cycle=setInterval(()=>{
      for(let row=0;row<3;row++) cells[row].textContent=randomSymbol().s;
    },55);
    await sleep(stopDelay);
    clearInterval(cycle);
    reel.classList.remove('reel-spinning');
    reel.classList.add('reel-stop');
    for(let row=0;row<3;row++){
      cells[row].textContent=finalColumn[row].s;
      cells[row].classList.remove('spin');
    }
    burstAtReel(col);
    pulseMachine('land');
    if(navigator.vibrate) navigator.vibrate(6);
    setTimeout(()=>reel.classList.remove('reel-stop'),280);
  }

  function renderGameState(lastWin=0,source='balance'){
    $('balance').textContent=balance.toFixed(2);
    $('last-win-value').textContent=lastWin.toFixed(2);
    $('total-wins').textContent=totalWins.toFixed(2);
    $('total-spins').textContent=String(totalSpins);
    const label=$('last-win-card')?.querySelector('em');
    if(label) label.textContent=source==='energy' ? 'DEMO ENERGY REWARD' : 'HELIOS UNITS';
  }

  function stopAuto(){
    autoRemaining=0;
    if(autoTimer) clearTimeout(autoTimer);
    autoTimer=null;
    $('auto-spin').classList.remove('active');
    $('auto-spin').textContent='AUTO ×10';
  }

  function scheduleNextAuto(){
    if(autoRemaining<=0){ stopAuto(); return; }
    $('auto-spin').textContent=`STOP AUTO · ${autoRemaining}`;
    autoTimer=setTimeout(()=>spin({fromAuto:true,source:'balance'}),650);
  }

  async function spin({fromAuto=false,source='balance'}={}){
    if(spinning) return;
    const isEnergy=source==='energy';
    const bet=Number($('bet').value);
    if(!isEnergy && balance<bet){
      $('last-win-value').textContent='0.00';
      stopAuto();
      return;
    }
    if(isEnergy && !currentMode().supportsDemoSpinEnergy) return;

    const outcome=buildOutcome();
    spinning=true;
    if(!isEnergy) balance-=bet;
    renderGameState(0,isEnergy?'energy':'balance');
    $('spin').disabled=true;
    $('bet').disabled=true;
    const energyButton=$('energy-spin');
    if(energyButton) energyButton.disabled=true;
    [...$('game-modes').children].forEach(x=>x.disabled=true);
    $('reels').classList.add('spinning');

    const baseStop=780;
    const step=185;
    await Promise.all(outcome.map((column,col)=>animateReel(col,column,baseStop+(col*step))));

    $('reels').classList.remove('spinning');
    const result=evaluate(outcome,bet);
    if(isEnergy) energyRewardUnits+=result.win;
    else balance+=result.win;
    totalSpins++;
    totalWins+=result.win;
    result.hits.forEach(([c,r])=>window.__heliosCells[c][r].classList.add('hit'));
    renderGameState(result.win,isEnergy?'energy':'balance');

    const winCard=$('last-win-card');
    winCard.classList.remove('win');
    if(result.win>0){
      void winCard.offsetWidth;
      winCard.classList.add('win');
      pulseMachine('win');
      if(navigator.vibrate) navigator.vibrate([18,28,24]);
    }

    spinning=false;
    $('spin').disabled=false;
    $('bet').disabled=false;
    [...$('game-modes').children].forEach(x=>x.disabled=false);
    renderSpinEnergy();

    if(autoRemaining>0){
      autoRemaining--;
      if(autoRemaining>0) scheduleNextAuto();
      else stopAuto();
    } else if(fromAuto){
      stopAuto();
    }
  }

  function toggleAuto(){
    if(autoRemaining>0){ stopAuto(); return; }
    if(spinning) return;
    autoRemaining=10;
    $('auto-spin').classList.add('active');
    $('auto-spin').textContent='STOP AUTO · 10';
    spin({fromAuto:true,source:'balance'});
  }

  function modeSupportsEnergy(){
    return Boolean(currentMode().supportsDemoSpinEnergy && spinEnergyPolicy.eligible_game_modes.includes(gameModeKey));
  }

  function routeSupportsEnergy(){
    return spinEnergyPolicy.eligible_routes.includes(routeKey);
  }

  function canAccrueSpinEnergy(){
    return Boolean(spinEnergyPolicy.enabled && computeActive && modeSupportsEnergy() && routeSupportsEnergy());
  }

  function ensureEnergyUI(){
    if($('spin-energy-panel')) return;
    const style=document.createElement('style');
    style.textContent=`
      .core.armed{animation:armedPulse .7s ease}.route.route-pulse{animation:routePulse .52s ease}
      .spin-energy-panel{display:grid;grid-template-columns:1fr 86px;gap:8px;align-items:center;border:1px solid #3b4a54;background:linear-gradient(90deg,#081019ee,#0b130dcc);border-radius:11px;padding:9px 10px;margin:7px 0 9px;box-shadow:inset 0 0 18px #95ff9a08}
      .spin-energy-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.spin-energy-head b{font-size:9px;color:#95ff9a;letter-spacing:.08em}.spin-energy-head span{font:10px ui-monospace,SFMono-Regular,Consolas,monospace;color:#e8edf1}
      .spin-energy-status{font-size:7px;color:#83919b;margin-top:3px}.spin-energy-track{height:5px;border-radius:999px;background:#03070a;overflow:hidden;margin-top:6px;border:1px solid #24313a}.spin-energy-bar{height:100%;width:0;background:linear-gradient(90deg,#55d96f,#b7ff78);box-shadow:0 0 10px #95ff9a55;transition:width .25s}
      .energy-spin-btn{height:100%;min-height:46px;border:1px solid #396341;border-radius:9px;background:#102019;color:#95ff9a;font-size:8px;font-weight:900;line-height:1.25}.energy-spin-btn:not(:disabled){box-shadow:0 0 16px #95ff9a1f}.energy-spin-btn small{display:block;color:#819289;font-size:6px;margin-top:3px}.energy-ledger{font-size:7px;color:#708078;margin-top:4px}
      @keyframes armedPulse{0%{box-shadow:0 0 25px #ffb84c33}45%{box-shadow:0 0 52px #ffcc6577,0 0 90px #ff9f1c22}100%{box-shadow:0 0 25px #ffb84c33}}
      @keyframes routePulse{0%{transform:none}45%{transform:translateY(-2px);box-shadow:0 0 24px #ffbb4244}100%{transform:none}}
    `;
    document.head.appendChild(style);

    const panel=document.createElement('section');
    panel.id='spin-energy-panel';
    panel.className='spin-energy-panel';
    panel.innerHTML=`
      <div>
        <div class="spin-energy-head"><b>◈ DEMO SPIN ENERGY</b><span><strong id="spin-bank">0</strong> BANK · <strong id="spin-energy-countdown">--:--</strong></span></div>
        <div id="spin-energy-status" class="spin-energy-status">GRIDJACK + JACKPOT route can accumulate demo-only spins while compute is active.</div>
        <div class="spin-energy-track"><div id="spin-energy-bar" class="spin-energy-bar"></div></div>
        <div class="energy-ledger">Energy rewards → DEMO_ENERGY_REWARD_ONLY · no cash value · no automatic wagering conversion · no bank autoplay.</div>
      </div>
      <button id="energy-spin" class="energy-spin-btn" type="button" disabled>ENERGY SPIN<small id="energy-reward">REWARD 0.00</small></button>`;
    const note=document.querySelector('.mode-note');
    note?.after(panel);
    $('energy-spin').onclick=useEnergySpin;
  }

  function formatCountdown(seconds){
    const s=Math.max(0,Math.ceil(seconds));
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  function renderSpinEnergy(){
    if(!$('spin-energy-panel')) return;
    const threshold=spinEnergyPolicy.seconds_per_spin;
    const remaining=spinBank>=spinEnergyPolicy.max_bank ? 0 : threshold-spinEnergySeconds;
    $('spin-bank').textContent=String(spinBank);
    $('spin-energy-countdown').textContent=spinBank>=spinEnergyPolicy.max_bank ? 'FULL' : formatCountdown(remaining);
    $('spin-energy-bar').style.width=`${Math.min(100,(spinEnergySeconds/threshold)*100)}%`;
    $('energy-reward').textContent=`REWARD ${energyRewardUnits.toFixed(2)}`;

    let status='Paused.';
    if(!spinEnergyPolicy.enabled) status='Disabled by public config.';
    else if(!modeSupportsEnergy()) status='Select GRIDJACK (or another configured supporting mode) to accrue/use Spin Energy.';
    else if(!routeSupportsEnergy()) status='Select JACKPOT POOL (or another configured eligible route), then grant consent.';
    else if(!computeActive) status='Route is eligible. Grant consent and ROUTE POWER to start the timer.';
    else if(spinBank>=spinEnergyPolicy.max_bank) status=`Bank full (${spinEnergyPolicy.max_bank}). Compute may continue, but no more demo spins accrue until one is used.`;
    else status=`Accumulating verified demo compute time · next demo spin in ${formatCountdown(remaining)}.`;
    $('spin-energy-status').textContent=status;

    const canUse=spinBank>0 && modeSupportsEnergy() && !spinning;
    $('energy-spin').disabled=!canUse;
    $('energy-spin').firstChild.textContent=canUse ? `ENERGY SPIN ×${spinBank}` : 'ENERGY SPIN';
  }

  function tickSpinEnergy(){
    if(!canAccrueSpinEnergy()){ renderSpinEnergy(); return; }
    if(spinBank>=spinEnergyPolicy.max_bank){ renderSpinEnergy(); return; }
    spinEnergySeconds++;
    if(spinEnergySeconds>=spinEnergyPolicy.seconds_per_spin){
      spinEnergySeconds=0;
      spinBank=Math.min(spinEnergyPolicy.max_bank,spinBank+1);
      if(navigator.vibrate) navigator.vibrate([8,20,8]);
    }
    renderSpinEnergy();
  }

  function startEnergyClock(){
    stopEnergyClock();
    energyTimer=setInterval(tickSpinEnergy,1000);
    renderSpinEnergy();
  }

  function stopEnergyClock(){
    if(energyTimer) clearInterval(energyTimer);
    energyTimer=null;
  }

  function useEnergySpin(){
    if(spinning || spinBank<=0 || !modeSupportsEnergy()) return;
    stopAuto();
    spinBank--;
    renderSpinEnergy();
    spin({source:'energy'});
  }

  function bindKeyboard(){
    window.addEventListener('keydown',e=>{
      if(e.code!=='Space' || e.repeat) return;
      const tag=document.activeElement?.tagName;
      if(['INPUT','SELECT','BUTTON','TEXTAREA'].includes(tag)) return;
      e.preventDefault();
      spin({source:'balance'});
    });
  }

  async function init(){
    await loadConfig();
    ensureEnergyUI();
    buildReels();
    buildGameModes();
    buildRoutes();
    renderGameState(0);
    renderSpinEnergy();
    $('cpu').oninput=()=> $('cpu-label').textContent=$('cpu').value+'%';
    $('consent').onchange=updatePowerCTA;
    $('power-on').onclick=startCompute;
    $('power-off').onclick=stopCompute;
    $('spin').onclick=()=>spin({source:'balance'});
    $('auto-spin').onclick=toggleAuto;
    bindKeyboard();
  }

  init();
})();