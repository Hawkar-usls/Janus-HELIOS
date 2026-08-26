(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'janus.helios.demo.profile.v1';
  const DEFAULT_POLICY = {
    enabled:true,
    offers_refresh_seconds:15,
    max_history_items:120,
    max_notifications:80,
    show_lucky_showcase_control:true
  };

  const ROUTE_VALUE = {
    MARKETPLACE:{rate:.80,unit:'MARKET CREDIT',kind:'VALUE'},
    TREASURY:{rate:.45,unit:'TREASURY CREDIT',kind:'POOL'},
    SCIENCE:{rate:1.00,unit:'IMPACT UNIT',kind:'IMPACT'},
    PUBLIC_GOOD:{rate:1.00,unit:'IMPACT UNIT',kind:'IMPACT'},
    DATACENTER:{rate:.65,unit:'COMPUTE CREDIT',kind:'VALUE'},
    OPERATOR:{rate:.70,unit:'OPERATOR CREDIT',kind:'VALUE'},
    CUSTOM:{rate:.55,unit:'CUSTOM CREDIT',kind:'VALUE'}
  };

  const OFFER_TEMPLATES = [
    {route:'MARKETPLACE',title:'Marketplace Batch',task:'ECONOMIC_COMPUTE_JOB',region:'EU-CENTRAL',base:.84,demand:76},
    {route:'SCIENCE',title:'Research Queue',task:'SCIENCE_WORK_UNIT',region:'GLOBAL',base:1.00,demand:68},
    {route:'TREASURY',title:'Pool Share Queue',task:'POW_SHARE',region:'EU-EAST',base:.48,demand:91},
    {route:'DATACENTER',title:'Render / Analytics Cluster',task:'GENERAL_COMPUTE_JOB',region:'EU-NORTH',base:.72,demand:63},
    {route:'OPERATOR',title:'Operator Batch',task:'GENERAL_COMPUTE_JOB',region:'PRIVATE GATEWAY',base:.77,demand:57},
    {route:'CUSTOM',title:'Custom Workload Gate',task:'GENERAL_COMPUTE_JOB',region:'BUYER DEFINED',base:.61,demand:49}
  ];

  let policy={...DEFAULT_POLICY};
  let profile=loadProfile();
  let lastReceiptId='';
  let currentSession=null;
  let offers=[];
  let offerTimer=null;
  let activeTab='overview';

  function nowISO(){ return new Date().toISOString(); }
  function round2(n){ return Math.round((Number(n)||0)*100)/100; }
  function secureFloat(){
    const a=new Uint32Array(1);
    if(globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(a);
    else a[0]=(Date.now()*2654435761)>>>0;
    return a[0]/0xffffffff;
  }
  function escapeHtml(v){ return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function emptyProfile(){
    return {
      schema:'janus.helios.demo-profile.v1',created_at:nowISO(),updated_at:nowISO(),
      total_compute_units:0,total_personal_value:0,total_external_value:0,total_receipts:0,
      lucky_count:0,lucky_recognition_units:0,spin_energy_earned:0,
      routes:{},history:[],sessions:[],notifications:[],unread:0
    };
  }

  function loadProfile(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(raw&&raw.schema==='janus.helios.demo-profile.v1') return {...emptyProfile(),...raw};
    }catch(_){ }
    return emptyProfile();
  }
  function saveProfile(){
    profile.updated_at=nowISO();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(profile));}catch(_){ }
    renderBadge();
  }

  async function loadPolicy(){
    try{
      const r=await fetch('./config/helios.public.json',{cache:'no-store'});
      if(!r.ok)return;
      const cfg=await r.json();
      const p=cfg?.profile_dashboard||{};
      policy={
        ...DEFAULT_POLICY,...p,
        offers_refresh_seconds:Math.max(5,Math.min(120,Number(p.offers_refresh_seconds||DEFAULT_POLICY.offers_refresh_seconds))),
        max_history_items:Math.max(20,Math.min(500,Number(p.max_history_items||DEFAULT_POLICY.max_history_items))),
        max_notifications:Math.max(20,Math.min(300,Number(p.max_notifications||DEFAULT_POLICY.max_notifications)))
      };
    }catch(_){ }
  }

  function injectStyles(){
    if($('helios-profile-styles'))return;
    const style=document.createElement('style');style.id='helios-profile-styles';style.textContent=`
      .helios-profile-btn{position:relative;margin-left:auto;border:1px solid #57441f;background:#0b1015;color:#e9d69a;border-radius:999px;padding:7px 11px;font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.07em;white-space:nowrap}.helios-profile-btn:hover{border-color:#b68731;box-shadow:0 0 18px #ffbd3d1f}.profile-unread{position:absolute;right:-4px;top:-5px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;display:grid;place-items:center;background:#ffc24b;color:#201400;font:950 9px ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:0 0 13px #ffc24b88}.profile-unread.zero{display:none}
      .profile-overlay{position:fixed;z-index:790;inset:0;background:#010306d9;backdrop-filter:blur(13px);display:flex;justify-content:flex-end;opacity:0;pointer-events:none;transition:.2s}.profile-overlay.show{opacity:1;pointer-events:auto}.profile-drawer{width:min(880px,96vw);height:100%;overflow:auto;background:linear-gradient(180deg,#0d141ced,#05090df8);border-left:1px solid #32404a;box-shadow:-28px 0 90px #000;padding:16px}.profile-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-bottom:1px solid #26323a;padding-bottom:11px}.profile-kicker{color:#ffc24b;font:900 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em}.profile-title{margin:4px 0 3px;font-size:23px}.profile-sub{color:#83909a;font-size:8px;line-height:1.4}.profile-close{border:1px solid #34414a;background:#090e13;color:#cbd4da;border-radius:9px;padding:8px 11px}.profile-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:11px 0}.profile-tab{border:1px solid #2d3943;background:#070c11;color:#89959e;border-radius:9px;padding:7px 10px;font:850 8px ui-monospace,SFMono-Regular,Consolas,monospace}.profile-tab.active{border-color:#806024;color:#ffd66e;background:#171105}.profile-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.profile-stat{border:1px solid #28343d;background:#070c11;border-radius:11px;padding:10px}.profile-stat span{display:block;color:#75828c;font-size:7px;letter-spacing:.08em}.profile-stat b{display:block;color:#f0f4f6;font:900 17px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:4px}.profile-stat small{display:block;color:#8a7b59;font-size:6px;margin-top:3px}.profile-section{border:1px solid #28343d;background:#060b10;border-radius:12px;padding:10px;margin-top:9px}.profile-section h4{margin:0 0 8px;color:#dbe2e6;font-size:10px}.profile-route-row,.profile-history-row,.profile-note-row{display:grid;grid-template-columns:1.1fr 1fr .8fr .8fr;gap:8px;padding:7px 2px;border-top:1px solid #172129;align-items:center;font:7px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace}.profile-route-row:first-of-type,.profile-history-row:first-of-type,.profile-note-row:first-of-type{border-top:0}.profile-route-row b,.profile-history-row b,.profile-note-row b{color:#d7e0e5}.profile-muted{color:#75838d}.profile-positive{color:#7dffb0}.profile-gold{color:#ffd36a}.profile-offers{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.offer-card{border:1px solid #2e3a43;background:linear-gradient(180deg,#0a1016,#060a0e);border-radius:12px;padding:10px}.offer-top{display:flex;justify-content:space-between;gap:8px}.offer-route{color:#ffc24b;font:850 7px ui-monospace,SFMono-Regular,Consolas,monospace}.offer-live{color:#7dffb0;font:800 6px ui-monospace,SFMono-Regular,Consolas,monospace}.offer-title{font-weight:850;font-size:10px;margin:5px 0}.offer-meta{display:grid;grid-template-columns:1fr 1fr;gap:5px;color:#7f8b94;font:7px ui-monospace,SFMono-Regular,Consolas,monospace}.offer-meta b{color:#cbd4d9}.profile-callout{border:1px solid #59451e;background:#120d04;border-radius:11px;padding:9px;color:#bfae82;font-size:8px;line-height:1.45;margin-top:9px}.profile-showcase{border:1px solid #76591f;background:#1b1305;color:#ffd76b;border-radius:9px;padding:8px 10px;font:900 8px ui-monospace,SFMono-Regular,Consolas,monospace}.profile-empty{color:#6d7a83;text-align:center;padding:18px;font-size:8px}.profile-view[hidden]{display:none!important}
      @media(max-width:720px){.profile-grid{grid-template-columns:repeat(2,1fr)}.profile-offers{grid-template-columns:1fr}.profile-route-row,.profile-history-row,.profile-note-row{grid-template-columns:1fr 1fr}.helios-profile-btn{font-size:0;padding:8px}.helios-profile-btn:before{content:'◉';font-size:12px}.profile-drawer{width:100vw}.profile-title{font-size:20px}}
    `;document.head.appendChild(style);
  }

  function buildUI(){
    if(!$('helios-profile-btn')){
      const btn=document.createElement('button');btn.id='helios-profile-btn';btn.className='helios-profile-btn';btn.type='button';
      btn.innerHTML='◉ MY HELIOS <span id="profile-unread" class="profile-unread zero">0</span>';
      const top=document.querySelector('.topbar');const badges=document.querySelector('.badges');
      if(top) top.insertBefore(btn,badges||null);
      btn.onclick=openProfile;
    }
    if(!$('helios-profile-overlay')){
      const overlay=document.createElement('div');overlay.id='helios-profile-overlay';overlay.className='profile-overlay';
      overlay.innerHTML=`<section class="profile-drawer" role="dialog" aria-modal="true" aria-label="HELIOS compute profile">
        <header class="profile-head"><div><div class="profile-kicker">◉ HELIOS OPERATOR PROFILE</div><h3 class="profile-title">Compute history & opportunity board</h3><div class="profile-sub">Local demo profile · verified-provider architecture preview · no production earnings claimed.</div></div><button id="profile-close" class="profile-close" type="button">CLOSE</button></header>
        <nav class="profile-tabs"><button class="profile-tab active" data-profile-tab="overview">OVERVIEW</button><button class="profile-tab" data-profile-tab="history">WORK HISTORY</button><button class="profile-tab" data-profile-tab="offers">LIVE OFFERS</button><button class="profile-tab" data-profile-tab="notifications">NOTIFICATIONS</button></nav>
        <div id="profile-view-overview" class="profile-view"></div><div id="profile-view-history" class="profile-view" hidden></div><div id="profile-view-offers" class="profile-view" hidden></div><div id="profile-view-notifications" class="profile-view" hidden></div>
      </section>`;
      document.body.appendChild(overlay);
      $('profile-close').onclick=closeProfile;
      overlay.addEventListener('click',e=>{if(e.target===overlay)closeProfile();});
      overlay.querySelectorAll('[data-profile-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.profileTab));
    }
    renderAll();
  }

  function openProfile(){
    profile.unread=0;saveProfile();
    $('helios-profile-overlay')?.classList.add('show');renderAll();
  }
  function closeProfile(){ $('helios-profile-overlay')?.classList.remove('show'); }
  function setTab(tab){
    activeTab=tab;
    document.querySelectorAll('[data-profile-tab]').forEach(b=>b.classList.toggle('active',b.dataset.profileTab===tab));
    document.querySelectorAll('.profile-view').forEach(v=>v.hidden=v.id!==`profile-view-${tab}`);
    renderAll();
  }

  function renderBadge(){
    const el=$('profile-unread');if(!el)return;
    el.textContent=String(profile.unread||0);el.classList.toggle('zero',!(profile.unread>0));
  }

  function routeStats(){ return Object.entries(profile.routes||{}).sort((a,b)=>(b[1].units||0)-(a[1].units||0)); }
  function renderOverview(){
    const host=$('profile-view-overview');if(!host)return;
    const current=currentSession?`${currentSession.route} · ${Math.max(0,Math.floor((Date.now()-currentSession.started_ms)/1000))}s`:'OFF';
    const routeRows=routeStats().map(([route,s])=>`<div class="profile-route-row"><b>${escapeHtml(route)}</b><span>${Number(s.units||0).toFixed(2)} units</span><span class="profile-positive">${Number(s.personal_value||0).toFixed(2)} personal</span><span>${Number(s.external_value||0).toFixed(2)} external</span></div>`).join('');
    host.innerHTML=`<div class="profile-grid"><div class="profile-stat"><span>COMPUTE UNITS</span><b>${Number(profile.total_compute_units||0).toFixed(2)}</b><small>simulated receipts</small></div><div class="profile-stat"><span>PERSONAL VALUE</span><b>${Number(profile.total_personal_value||0).toFixed(2)}</b><small>demo estimate only</small></div><div class="profile-stat"><span>EXTERNAL VALUE / IMPACT</span><b>${Number(profile.total_external_value||0).toFixed(2)}</b><small>demo accounting</small></div><div class="profile-stat"><span>LUCKY CONTRIBUTIONS</span><b>${Number(profile.lucky_count||0)}</b><small>${Number(profile.lucky_recognition_units||0).toFixed(2)} recognition units</small></div></div><div class="profile-section"><h4>CURRENT COMPUTE SESSION</h4><div class="profile-route-row"><b>${escapeHtml(current)}</b><span>receipts ${profile.total_receipts||0}</span><span>Spin Energy +${profile.spin_energy_earned||0}</span><span>${routeStats().length} routes used</span></div></div><div class="profile-section"><h4>WHERE MY DEVICE WORKED</h4>${routeRows||'<div class="profile-empty">No compute receipts yet.</div>'}</div><div class="profile-callout">Production profile values must come from authoritative provider receipts, settlement records and research acceptance. This page currently stores only local demo history.</div>`;
  }

  function renderHistory(){
    const host=$('profile-view-history');if(!host)return;
    const rows=(profile.history||[]).slice().reverse().map(h=>`<div class="profile-history-row"><div><b>${escapeHtml(h.route)}</b><div class="profile-muted">${escapeHtml(h.task)}</div></div><div>${new Date(h.timestamp).toLocaleString()}<div class="profile-muted">${escapeHtml(h.receipt_id)}</div></div><div>${Number(h.units).toFixed(2)} units<div class="profile-muted">${escapeHtml(h.asset)}</div></div><div><span class="profile-positive">+${Number(h.personal_value).toFixed(2)}</span> personal<div class="profile-muted">+${Number(h.external_value).toFixed(2)} external</div></div></div>`).join('');
    host.innerHTML=`<div class="profile-section"><h4>COMPUTE RECEIPT HISTORY</h4>${rows||'<div class="profile-empty">Start an approved demo route to build history.</div>'}</div>`;
  }

  function updateOffers(){
    offers=OFFER_TEMPLATES.map((o,i)=>{
      const jitter=(secureFloat()-.5)*.12;
      const demand=Math.max(20,Math.min(99,Math.round(o.demand+(secureFloat()-.5)*18)));
      return {...o,id:`offer-${i}`,rate:round2(o.base*(1+jitter)),demand,updated_at:nowISO()};
    }).sort((a,b)=>b.rate-a.rate);
    if(activeTab==='offers')renderOffers();
  }

  function renderOffers(){
    const host=$('profile-view-offers');if(!host)return;
    if(!offers.length)updateOffers();
    host.innerHTML=`<div class="profile-callout"><b>SIMULATED REAL-TIME OFFER BOARD.</b> It behaves like a marketplace/pool dashboard for the sales demo, but these are not real NiceHash, Golem or cloud prices. Production offers require live provider APIs, signed manifests and settlement verification.</div><div class="profile-offers">${offers.map(o=>`<article class="offer-card"><div class="offer-top"><span class="offer-route">${escapeHtml(o.route)}</span><span class="offer-live">● LIVE DEMO</span></div><div class="offer-title">${escapeHtml(o.title)}</div><div class="offer-meta"><span>RATE <b>${o.rate.toFixed(2)}</b></span><span>DEMAND <b>${o.demand}%</b></span><span>REGION <b>${escapeHtml(o.region)}</b></span><span>TASK <b>${escapeHtml(o.task)}</b></span></div></article>`).join('')}</div>`;
  }

  function renderNotifications(){
    const host=$('profile-view-notifications');if(!host)return;
    const rows=(profile.notifications||[]).slice().reverse().map(n=>`<div class="profile-note-row"><div><b class="${n.kind==='LUCKY'?'profile-gold':''}">${escapeHtml(n.title)}</b><div class="profile-muted">${escapeHtml(n.detail)}</div></div><span>${new Date(n.timestamp).toLocaleString()}</span><span>${escapeHtml(n.route||'—')}</span><span>${n.value!=null?`+${Number(n.value).toFixed(2)}`:'—'}</span></div>`).join('');
    const showcase=policy.show_lucky_showcase_control?`<button id="profile-lucky-showcase" class="profile-showcase" type="button">◆ SHOWCASE RARE LUCKY EVENT</button>`:'';
    host.innerHTML=`<div class="profile-section"><h4>PROFILE NOTIFICATIONS</h4>${rows||'<div class="profile-empty">No compute notifications yet.</div>'}</div><div class="profile-callout">Lucky Hash / Impact Hit is intended to be extremely rare in production and must be derived from an authoritative significance rule, not browser randomness. ${showcase}</div>`;
    const btn=$('profile-lucky-showcase');if(btn)btn.onclick=()=>window.dispatchEvent(new CustomEvent('helios:showcase-lucky-contribution'));
  }

  function renderAll(){ renderBadge();renderOverview();renderHistory();renderOffers();renderNotifications(); }

  function parseReceipt(){
    try{return JSON.parse($('receipt')?.textContent||'');}catch(_){return null;}
  }
  function addNotification(n){
    profile.notifications=profile.notifications||[];
    profile.notifications.push({timestamp:nowISO(),...n});
    if(profile.notifications.length>policy.max_notifications)profile.notifications=profile.notifications.slice(-policy.max_notifications);
    if(!$('helios-profile-overlay')?.classList.contains('show'))profile.unread=(profile.unread||0)+1;
  }

  function ingestReceipt(){
    const r=parseReceipt();
    if(!r||r.mode!=='SIMULATION'||!r.receipt_id||r.receipt_id===lastReceiptId)return;
    lastReceiptId=r.receipt_id;
    const route=String(r.provider_route||'UNKNOWN').toUpperCase();
    const spec=ROUTE_VALUE[route]||{rate:.5,unit:'DEMO CREDIT',kind:'VALUE'};
    const units=Math.max(0,Number(r.compute_units||0));
    const gross=round2(units*spec.rate);
    const personalRatio=Math.max(0,Math.min(1,Number(r.demo_allocation?.player_ratio||0)));
    const personal=round2(gross*personalRatio);
    const external=round2(gross-personal);
    const item={receipt_id:r.receipt_id,timestamp:r.timestamp||nowISO(),route,task:r.task_type||'UNKNOWN',units,asset:r.asset||spec.unit,sink:r.sink||'',personal_value:personal,external_value:external};
    profile.history=profile.history||[];profile.history.push(item);
    if(profile.history.length>policy.max_history_items)profile.history=profile.history.slice(-policy.max_history_items);
    profile.total_receipts=(profile.total_receipts||0)+1;profile.total_compute_units=round2((profile.total_compute_units||0)+units);profile.total_personal_value=round2((profile.total_personal_value||0)+personal);profile.total_external_value=round2((profile.total_external_value||0)+external);
    const rs=profile.routes[route]||{units:0,personal_value:0,external_value:0,receipts:0};
    rs.units=round2(rs.units+units);rs.personal_value=round2(rs.personal_value+personal);rs.external_value=round2(rs.external_value+external);rs.receipts++;profile.routes[route]=rs;
    saveProfile();renderAll();
  }

  function observeReceipts(){
    const el=$('receipt');if(!el)return false;
    new MutationObserver(()=>setTimeout(ingestReceipt,25)).observe(el,{childList:true,characterData:true,subtree:true});
    setTimeout(ingestReceipt,80);return true;
  }

  function observeCompute(){
    const el=$('compute-state');if(!el)return;
    const sync=()=>{
      const active=el.textContent.includes('ACTIVE');
      if(active&&!currentSession){currentSession={started_at:nowISO(),started_ms:Date.now(),route:$('selected-route')?.textContent?.trim()||'UNKNOWN'};renderOverview();}
      if(!active&&currentSession){profile.sessions=profile.sessions||[];profile.sessions.push({started_at:currentSession.started_at,ended_at:nowISO(),route:currentSession.route,duration_seconds:Math.max(0,Math.round((Date.now()-currentSession.started_ms)/1000))});profile.sessions=profile.sessions.slice(-60);currentSession=null;saveProfile();renderOverview();}
    };
    new MutationObserver(sync).observe(el,{childList:true,characterData:true,subtree:true});sync();
  }

  function bindEvents(){
    window.addEventListener('helios:lucky-contribution',e=>{
      const d=e.detail||{};profile.lucky_count=(profile.lucky_count||0)+1;profile.lucky_recognition_units=round2((profile.lucky_recognition_units||0)+Number(d.reward_units||0));
      addNotification({kind:'LUCKY',title:d.event_name||'LUCKY CONTRIBUTION',detail:`${d.simulated?'SIMULATED · ':''}${d.receipt_id||''}`,route:d.route_class||'',value:Number(d.reward_units||0)});saveProfile();renderAll();
    });
    window.addEventListener('helios:spin-energy-earned',e=>{profile.spin_energy_earned=(profile.spin_energy_earned||0)+1;addNotification({kind:'ENERGY',title:'SPIN ENERGY EARNED',detail:`bank ${e.detail?.bank??'?'}`,route:e.detail?.route||'',value:null});saveProfile();renderAll();});
  }

  async function init(){
    await loadPolicy();if(!policy.enabled)return;injectStyles();buildUI();bindEvents();observeCompute();
    let tries=0;const attach=()=>{if(observeReceipts())return;if(++tries<100)setTimeout(attach,80);};attach();
    updateOffers();offerTimer=setInterval(updateOffers,policy.offers_refresh_seconds*1000);
    window.addEventListener('pagehide',()=>{if(offerTimer)clearInterval(offerTimer);},{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
