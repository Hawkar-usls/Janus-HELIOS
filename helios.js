(() => {
  const tg = window.Telegram?.WebApp;
  try { tg?.ready(); tg?.expand(); } catch (_) {}

  const FALLBACK_ROUTES = [
    {key:'market',icon:'⬡',name:'COMPUTE MARKET',short:'MARKET',route_class:'MARKETPLACE',task_type:'ECONOMIC_COMPUTE_JOB',demo_proof_kind:'MOCK_ECONOMIC_COMPUTE_RECEIPT',description:'Golem or another approved requestor/provider market.',path:'CONSENT → HELIOS → MARKETPLACE → REQUESTOR → VERIFIED PAYMENT → PLAYER VALUE + TREASURY',sink:'PLAYER_COMPUTE_EARNINGS_LEDGER + COMPUTE_TREASURY',demo_asset:'market-credit',demo_player_ratio:.7,demo_shared_ratio:.3,enabled:true},
    {key:'science',icon:'🧬',name:'SCIENCE',short:'SCIENCE',route_class:'SCIENCE',task_type:'SCIENCE_WORK_UNIT',demo_proof_kind:'MOCK_SCIENCE_RECEIPT',description:'Research or public-good workload with upstream acceptance.',path:'CONSENT → HELIOS → RESEARCH REQUESTOR → SCIENCE WORK → VERIFIED RECEIPT → IMPACT LEDGER',sink:'IMPACT_LEDGER',demo_asset:'impact-credit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'jackpot',icon:'◈',name:'JACKPOT POOL',short:'TREASURY',route_class:'TREASURY',task_type:'POW_SHARE',demo_proof_kind:'MOCK_POOL_SHARE',description:'Shared mining/pool revenue routed into a transparent reserve.',path:'CONSENT → HELIOS → APPROVED POOL → ACCEPTED SHARE → VERIFIED REVENUE → COMPUTE TREASURY',sink:'COMPUTE_TREASURY',demo_asset:'treasury-credit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'datacenter',icon:'▦',name:'DATA CENTER',short:'DC',route_class:'DATACENTER',task_type:'GENERAL_COMPUTE_JOB',demo_proof_kind:'MOCK_GENERAL_COMPUTE_RECEIPT',description:'Buyer-selected cloud, batch, render, analytics or HPC workload.',path:'CONSENT → HELIOS → DATA CENTER GATEWAY → GENERAL WORKLOAD → VERIFIED RECEIPT → CONTRACT SINK',sink:'CONTRACT_DEFINED_AUDITED_SINK',demo_asset:'compute-unit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'operator',icon:'⚙',name:'OPERATOR',short:'OPERATOR',route_class:'OPERATOR',task_type:'GENERAL_COMPUTE_JOB',demo_proof_kind:'MOCK_GENERAL_COMPUTE_RECEIPT',description:'Approved buyer-owned workload behind a private gateway.',path:'CONSENT → HELIOS → OPERATOR GATEWAY → APPROVED WORKLOAD → VERIFIED RECEIPT → AUDITED SINK',sink:'CONTRACT_DEFINED_AUDITED_SINK',demo_asset:'operator-unit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true},
    {key:'custom',icon:'✦',name:'CUSTOM',short:'CUSTOM',route_class:'CUSTOM',task_type:'GENERAL_COMPUTE_JOB',demo_proof_kind:'MOCK_GENERAL_COMPUTE_RECEIPT',description:'A future admissible provider not known when HELIOS was built.',path:'CONSENT → HELIOS → SIGNED BUYER MANIFEST → CUSTOM ADAPTER → VERIFIER → AUDITED SINK',sink:'CONTRACT_DEFINED_AUDITED_SINK',demo_asset:'custom-unit',demo_player_ratio:0,demo_shared_ratio:1,enabled:true}
  ];

  const SYMBOLS = [
    {s:'☀',v:8},{s:'⬡',v:6},{s:'◈',v:5},{s:'⚙',v:4},{s:'✦',v:3},{s:'∆',v:2},{s:'◇',v:1}
  ];

  const $ = id => document.getElementById(id);
  let routes = FALLBACK_ROUTES;
  let routeMap = new Map();
  let routeKey = 'market';
  let computeTimer = null;
  let computeUnits = 0;
  let receiptNo = 0;
  let balance = 1000;
  let spinning = false;

  function secureIndex(max){
    const a = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(a);
    else a[0] = Math.floor(Math.random()*0xffffffff);
    return a[0] % max;
  }

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
      $('config-state').textContent = 'CONFIG LOADED';
      $('config-state').className = 'ok';
    } catch (err) {
      routes = FALLBACK_ROUTES;
      routeKey = 'market';
      $('config-state').textContent = 'FALLBACK CONFIG';
    }
  }

  function buildReels(){
    const reels = $('reels');
    reels.innerHTML = '';
    window.__heliosCells = [];
    for(let c=0;c<5;c++){
      const reel=document.createElement('div'); reel.className='reel';
      window.__heliosCells[c]=[];
      for(let r=0;r<3;r++){
        const cell=document.createElement('div'); cell.className='cell'; cell.textContent=SYMBOLS[secureIndex(SYMBOLS.length)].s;
        reel.appendChild(cell); window.__heliosCells[c][r]=cell;
      }
      reels.appendChild(reel);
    }
  }

  function buildRoutes(){
    const grid = $('route-grid');
    grid.innerHTML = '';
    routeMap = new Map(routes.map(r => [r.key,r]));
    if (!routeMap.has(routeKey)) routeKey = routes[0]?.key;
    routes.forEach(r => {
      const b=document.createElement('button'); b.type='button'; b.className='route'; b.dataset.route=r.key;
      b.innerHTML=`<span class="r-icon">${r.icon || '⬡'}</span><b>${r.name}</b><small>${r.description || ''}</small>`;
      b.onclick=()=>selectRoute(r.key);
      grid.appendChild(b);
    });
    selectRoute(routeKey);
  }

  function selectRoute(key){
    if(computeTimer){ alert('Stop compute before changing the route.'); return; }
    const r = routeMap.get(key);
    if (!r) return;
    routeKey=key;
    [...$('route-grid').children].forEach(x=>x.classList.toggle('active',x.dataset.route===key));
    $('selected-route').textContent=r.short || r.name;
    $('route-path').innerHTML=String(r.path || '').replace('CONSENT','<strong>CONSENT</strong>');
  }

  function renderReceipt(){
    const r=routeMap.get(routeKey); if(!r) return;
    receiptNo++; computeUnits += .25;
    $('compute-units').textContent=computeUnits.toFixed(2);
    const out={
      product:'JANUS_HELIOS',
      router_version:'1.0.0',
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
      scheduling_basis:'CONSENT_DEVICE_POLICY_PROVIDER_CAPACITY_AND_WORKLOAD_ADMISSION',
      game_event_weighting:'FORBIDDEN',
      game_effect:'NONE',
      timestamp:new Date().toISOString()
    };
    $('receipt').textContent=JSON.stringify(out,null,2);
    $('receipt-status').textContent='SIMULATED / VISIBLE';
  }

  function startCompute(){
    if(!$('consent').checked){ alert('Explicit compute consent is required.'); return; }
    if(computeTimer) return;
    $('compute-state').textContent='ACTIVE'; $('compute-state').className='ok'; $('core').classList.add('active');
    $('power-on').disabled=true; $('power-off').disabled=false; $('cpu').disabled=true; $('consent').disabled=true;
    [...$('route-grid').children].forEach(x=>x.disabled=true);
    renderReceipt(); computeTimer=setInterval(renderReceipt,6000);
  }

  function stopCompute(){
    if(computeTimer) clearInterval(computeTimer); computeTimer=null;
    $('compute-state').textContent='OFF / REVOKED'; $('compute-state').className=''; $('core').classList.remove('active');
    $('power-on').disabled=false; $('power-off').disabled=true; $('cpu').disabled=false; $('consent').disabled=false; $('consent').checked=false;
    [...$('route-grid').children].forEach(x=>x.disabled=false);
  }

  function randomSymbol(){ return SYMBOLS[secureIndex(SYMBOLS.length)]; }

  function evaluate(grid,bet){
    let win=0; const hits=[];
    for(let row=0;row<3;row++){
      const first=grid[0][row].s; let count=1;
      for(let col=1;col<5;col++){
        if(grid[col][row].s===first) count++; else break;
      }
      if(count>=3){
        const base=SYMBOLS.find(x=>x.s===first)?.v||1;
        win += bet*base*(count-2);
        for(let col=0;col<count;col++) hits.push([col,row]);
      }
    }
    return {win,hits};
  }

  function spin(){
    if(spinning) return;
    const bet=Number($('bet').value);
    if(balance<bet){ $('last-win').textContent='NO DEMO CREDIT'; return; }
    const cells=window.__heliosCells;
    spinning=true; balance-=bet; $('balance').textContent=balance.toFixed(0); $('spin').disabled=true; $('last-win').textContent='SPINNING';
    cells.flat().forEach(c=>{c.classList.remove('hit');c.classList.add('spin')});
    setTimeout(()=>{
      const grid=[];
      for(let col=0;col<5;col++){
        grid[col]=[];
        for(let row=0;row<3;row++){
          const sym=randomSymbol(); grid[col][row]=sym; cells[col][row].textContent=sym.s; cells[col][row].classList.remove('spin');
        }
      }
      const result=evaluate(grid,bet); balance+=result.win; $('balance').textContent=balance.toFixed(0);
      result.hits.forEach(([c,r])=>cells[c][r].classList.add('hit'));
      $('last-win').textContent=result.win>0?`+${result.win} DEMO`:'0';
      spinning=false; $('spin').disabled=false;
    },520);
  }

  async function init(){
    await loadConfig();
    buildReels();
    buildRoutes();
    $('cpu').oninput=()=> $('cpu-label').textContent=$('cpu').value+'%';
    $('power-on').onclick=startCompute;
    $('power-off').onclick=stopCompute;
    $('spin').onclick=spin;
  }

  init();
})();