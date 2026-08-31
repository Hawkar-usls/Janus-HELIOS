(() => {
  'use strict';

  const VERSION='1.0.0';
  const state={attached:false,host:null,raw:null,status:null,summary:null,details:null,observer:null,statusObserver:null,lastFingerprint:''};

  const text=(tag,value,className='')=>{
    const el=document.createElement(tag);
    if(className) el.className=className;
    el.textContent=String(value??'');
    return el;
  };

  function injectStyles(){
    if(document.getElementById('helios-receipt-viewer-styles')) return;
    const style=document.createElement('style');
    style.id='helios-receipt-viewer-styles';
    style.textContent=`
      .receipt.helios-receipt-v2{padding:0;overflow:hidden;background:linear-gradient(180deg,#071018,#04080c);border-color:#2a3944;box-shadow:inset 0 1px #ffffff05,0 10px 30px #0003}
      .helios-receipt-v2 .receipt-head{padding:9px 10px 8px;border-bottom:1px solid #1d2a33;background:#071018b8;align-items:center}
      .helios-receipt-v2 .receipt-head span:last-child{border:1px solid #2b4540;border-radius:999px;padding:4px 7px;color:var(--good);background:#0a1713;font-weight:850;letter-spacing:.07em}
      .helios-receipt-summary{padding:10px;display:grid;gap:8px}
      .helios-receipt-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      .helios-receipt-kicker{font:800 7px ui-monospace,SFMono-Regular,Consolas,monospace;color:#73818b;letter-spacing:.13em;text-transform:uppercase}
      .helios-receipt-title{margin-top:3px;font:900 13px/1.15 ui-monospace,SFMono-Regular,Consolas,monospace;color:#edf4f7;overflow-wrap:anywhere}
      .helios-receipt-proof{flex:0 0 auto;border:1px solid #34434d;border-radius:999px;padding:5px 7px;font:850 7px ui-monospace,SFMono-Regular,Consolas,monospace;color:#94a4af;background:#081017;white-space:nowrap}
      .helios-receipt-proof.live{border-color:#29543c;color:var(--good);background:#0a1712}.helios-receipt-proof.demo{border-color:#624a22;color:#ffd36a;background:#171105}.helios-receipt-proof.preview{border-color:#34516a;color:#80d7ff;background:#08131b}
      .helios-receipt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
      .helios-receipt-card{min-width:0;border:1px solid #22313b;border-radius:9px;background:#050b10;padding:7px 8px}
      .helios-receipt-card span{display:block;color:#667681;font:750 6px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase}
      .helios-receipt-card b{display:block;margin-top:3px;color:#d9e3e8;font:850 8px/1.25 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .helios-receipt-card.resource b{color:#9fe5ff}.helios-receipt-card.route b{color:var(--mode)}.helios-receipt-card.units b{color:var(--good)}
      .helios-receipt-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end;border-top:1px solid #17242c;padding-top:7px}
      .helios-receipt-id{min-width:0;color:#71808a;font:7px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace}.helios-receipt-id b{color:#aab8c1;font-weight:750}.helios-receipt-time{color:#65737d;font:7px ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap}
      .helios-receipt-actions{display:flex;gap:6px;align-items:center}
      .helios-receipt-copy{border:1px solid #2b3a44;background:#081017;color:#9eabb4;border-radius:7px;padding:5px 7px;font:800 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.06em}.helios-receipt-copy:hover{border-color:var(--mode);color:#fff}.helios-receipt-copy.copied{color:var(--good);border-color:#28523a}
      .helios-receipt-raw{border-top:1px solid #1d2a33;background:#03070a}.helios-receipt-raw>summary{list-style:none;cursor:pointer;padding:7px 10px;color:#697882;font:800 7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}.helios-receipt-raw>summary::-webkit-details-marker{display:none}.helios-receipt-raw>summary:after{content:'+';font-size:11px;color:#7f909b}.helios-receipt-raw[open]>summary:after{content:'−'}
      .helios-receipt-v2 .helios-receipt-raw pre{margin:0;border-top:1px solid #152028;padding:9px 10px 11px;background:#020609;color:#8fa0aa;max-height:190px;font-size:7px;line-height:1.45;scrollbar-width:thin}
      .helios-receipt-empty{padding:2px 0;color:#71808a;font:8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}
      @media(max-width:620px){.helios-receipt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.helios-receipt-card:last-child{grid-column:1/-1}.helios-receipt-hero{align-items:center}}
    `;
    document.head.appendChild(style);
  }

  function normalizeGpu(v){
    if(v===false||v==null) return 'OFF';
    const n=Number(v);
    return Number.isFinite(n)?`${n}%`:String(v);
  }

  function resourceLabel(obj){
    const p=obj?.resource_policy||{};
    if(p.cpu_percent==null&&p.gpu_percent==null&&p.gpu==null) return '—';
    const cpu=p.cpu_percent==null?'—':`${Number(p.cpu_percent)||0}%`;
    const gpu=p.gpu_percent!=null?normalizeGpu(p.gpu_percent):normalizeGpu(p.gpu);
    return `CPU ${cpu} · GPU ${gpu}`;
  }

  function proofKind(obj){
    return String(obj?.proof_kind||obj?.expected_proof||obj?.verification?.status||'UNVERIFIED');
  }

  function proofPresentation(obj){
    const mode=String(obj?.mode||'').toUpperCase();
    const proof=proofKind(obj).toUpperCase();
    if(mode==='ROUTE_PREVIEW') return {label:'ROUTE PREVIEW',className:'preview'};
    if(proof.includes('MOCK')||mode==='SIMULATION') return {label:'DEMO PROOF',className:'demo'};
    if(obj?.verified===true||String(obj?.verification?.status||'').toUpperCase()==='VERIFIED') return {label:'VERIFIED',className:'live'};
    return {label:'UNVERIFIED',className:''};
  }

  function shortTime(value){
    if(!value) return '';
    const d=new Date(value);
    if(Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }

  function addCard(grid,label,value,className=''){
    const card=document.createElement('div');
    card.className=`helios-receipt-card ${className}`.trim();
    card.append(text('span',label),text('b',value));
    card.title=String(value??'');
    grid.appendChild(card);
  }

  function renderObject(obj){
    const root=document.createDocumentFragment();
    const hero=document.createElement('div'); hero.className='helios-receipt-hero';
    const identity=document.createElement('div');
    identity.append(text('div',obj.mode==='ROUTE_PREVIEW'?'ROUTE READY':'COMPUTE RECEIPT','helios-receipt-kicker'));
    identity.append(text('div',String(obj.provider_route||obj.route_selected||'HELIOS').replaceAll('_',' '),'helios-receipt-title'));
    const proof=proofPresentation(obj); const proofEl=text('div',proof.label,`helios-receipt-proof ${proof.className}`.trim());
    hero.append(identity,proofEl);

    const grid=document.createElement('div'); grid.className='helios-receipt-grid';
    addCard(grid,'Route',obj.provider_route||obj.route_selected||'—','route');
    addCard(grid,'Task',obj.task_type||'—');
    addCard(grid,'Resources',resourceLabel(obj),'resource');
    addCard(grid,'Work',obj.compute_units!=null?`${obj.compute_units} ${obj.asset||'UNIT'}`:'—','units');
    addCard(grid,'Proof',proofKind(obj));
    addCard(grid,'Sink',obj.sink||'—');

    const meta=document.createElement('div'); meta.className='helios-receipt-meta';
    const id=document.createElement('div'); id.className='helios-receipt-id';
    id.append(text('span','ID '),text('b',obj.receipt_id||obj.plan_id||'preview'));
    const right=document.createElement('div');
    const time=text('div',shortTime(obj.timestamp),'helios-receipt-time');
    const actions=document.createElement('div'); actions.className='helios-receipt-actions';
    const copy=text('button','COPY JSON','helios-receipt-copy'); copy.type='button';
    copy.addEventListener('click',async()=>{
      const raw=state.raw?.textContent||'';
      try{await navigator.clipboard.writeText(raw);copy.textContent='COPIED';copy.classList.add('copied');setTimeout(()=>{copy.textContent='COPY JSON';copy.classList.remove('copied');},1000);}catch(_){copy.textContent='COPY FAILED';setTimeout(()=>copy.textContent='COPY JSON',1000);}
    });
    actions.append(copy); right.append(time,actions); meta.append(id,right);
    root.append(hero,grid,meta);
    state.summary.replaceChildren(root);
  }

  function render(){
    if(!state.raw||!state.summary) return;
    const raw=state.raw.textContent?.trim()||'';
    const status=state.status?.textContent?.trim()||'';
    const fingerprint=`${status}\n${raw}`;
    if(fingerprint===state.lastFingerprint) return;
    state.lastFingerprint=fingerprint;
    const preserveRawOpen=Boolean(state.details?.open);
    try{
      const obj=JSON.parse(raw);
      if(!obj||typeof obj!=='object') throw new Error('NOT_OBJECT');
      renderObject(obj);
      state.host.dataset.receiptView='HUMAN_SUMMARY';
      window.dispatchEvent(new CustomEvent('helios:receipt-view',{detail:{version:VERSION,receipt_id:obj.receipt_id||null,mode:obj.mode||null,provider_route:obj.provider_route||obj.route_selected||null,presentation_only:true,raw_json_preserved:true}}));
    }catch(_){
      state.summary.replaceChildren(text('div',raw||'Waiting for compute receipt…','helios-receipt-empty'));
      state.host.dataset.receiptView='TEXT';
    }finally{
      if(state.details) state.details.open=preserveRawOpen;
    }
  }

  function loadBuyerEnhancements(){
    if(!document.getElementById('helios-buyer-cockpit-script')){
      const script=document.createElement('script');script.id='helios-buyer-cockpit-script';script.src='./helios-buyer-cockpit.js?v=1.0.0';script.async=false;document.head.appendChild(script);
    }
    if(!document.getElementById('helios-trust-fabric-ui-script')){
      const script=document.createElement('script');script.id='helios-trust-fabric-ui-script';script.src='./helios-trust-fabric-ui.js?v=1.0.0';script.async=false;document.head.appendChild(script);
    }
    if(!document.getElementById('helios-edge-hash-lab-ui-script')){
      const script=document.createElement('script');script.id='helios-edge-hash-lab-ui-script';script.src='./helios-edge-hash-lab-ui.js?v=1.0.0';script.async=false;document.head.appendChild(script);
    }
    if(!document.getElementById('helios-edge-constellation-ui-script')){
      const script=document.createElement('script');script.id='helios-edge-constellation-ui-script';script.src='./helios-edge-constellation-ui.js?v=1.1.0';script.async=false;document.head.appendChild(script);
    }
    if(!document.getElementById('helios-evidence-independence-ui-script')){
      const script=document.createElement('script');script.id='helios-evidence-independence-ui-script';script.src='./helios-evidence-independence-ui.js?v=1.0.0';script.async=false;document.head.appendChild(script);
    }
    if(!document.getElementById('helios-smart-compute-node-ui-script')){
      const script=document.createElement('script');script.id='helios-smart-compute-node-ui-script';script.src='./helios-smart-compute-node-ui.js?v=1.0.0';script.async=false;document.head.appendChild(script);
    }
    if(!document.getElementById('helios-resource-sonification-script')){
      const script=document.createElement('script');script.id='helios-resource-sonification-script';script.src='./helios-resource-sonification.js?v=1.0.0';script.async=false;document.head.appendChild(script);
    }
  }

  function attach(){
    if(state.attached) return true;
    state.raw=document.getElementById('receipt');
    state.status=document.getElementById('receipt-status');
    state.host=state.raw?.closest('.receipt')||null;
    if(!state.raw||!state.host) return false;
    injectStyles();
    state.host.classList.add('helios-receipt-v2');
    state.summary=document.createElement('div'); state.summary.className='helios-receipt-summary'; state.summary.setAttribute('aria-live','polite');
    state.details=document.createElement('details'); state.details.className='helios-receipt-raw';
    const label=text('summary','RAW JSON · MACHINE VIEW');
    state.raw.before(state.summary);
    state.details.append(label,state.raw);
    state.host.appendChild(state.details);
    state.observer=new MutationObserver(render); state.observer.observe(state.raw,{childList:true,characterData:true,subtree:true});
    if(state.status){state.statusObserver=new MutationObserver(render);state.statusObserver.observe(state.status,{childList:true,characterData:true,subtree:true});}
    state.attached=true; render();
    window.HELIOS_RECEIPT_VIEWER=Object.freeze({version:VERSION,getState:()=>({version:VERSION,attached:state.attached,view:state.host?.dataset.receiptView||'UNKNOWN',raw_open:Boolean(state.details?.open),presentation_only:true,raw_json_preserved:true,receipt_authority:'NONE'})});
    window.dispatchEvent(new CustomEvent('helios:receipt-viewer-ready',{detail:{version:VERSION,human_summary:true,raw_json_collapsible:true,copy_json:true,presentation_only:true,raw_json_preserved:true,receipt_authority:'NONE'}}));
    loadBuyerEnhancements();
    return true;
  }

  function init(){
    if(attach()) return;
    let attempts=0; const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);}; retry();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();