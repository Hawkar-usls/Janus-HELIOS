(() => {
  'use strict';

  const VERSION='1.0.0';
  const state={attached:false,host:null,policy:null,status:null,pressure:null,armed:false};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));

  function injectStyles(){
    if(document.getElementById('helios-hardware-guardian-styles')) return;
    const style=document.createElement('style');
    style.id='helios-hardware-guardian-styles';
    style.textContent=`
      @keyframes heliosGuardianOrbit{to{transform:rotate(360deg)}}
      @keyframes heliosGuardianBreathe{0%,100%{opacity:.58;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}
      .helios-hardware-guardian{--guardian-pressure:.2;position:relative;overflow:hidden;margin-top:8px;padding:8px;border:1px solid color-mix(in srgb,var(--resource-primary) 26%,#26343d);border-radius:10px;background:radial-gradient(circle at 16% 10%,color-mix(in srgb,var(--resource-primary) 10%,transparent),transparent 42%),radial-gradient(circle at 88% 110%,color-mix(in srgb,var(--resource-secondary) 9%,transparent),transparent 48%),#050b10b8;box-shadow:inset 0 0 calc(10px + 18px * var(--guardian-pressure)) color-mix(in srgb,var(--resource-primary) calc(5% + 9% * var(--guardian-pressure)),transparent);transition:border-color .6s ease,box-shadow .6s ease}
      .helios-guardian-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.helios-guardian-head span{font-size:7px;letter-spacing:.12em;color:#8d9aa4;font-weight:850}.helios-guardian-head span:before{content:'◈';margin-right:5px;color:var(--resource-primary);text-shadow:0 0 10px var(--resource-primary)}.helios-guardian-head b{font:7px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--resource-tertiary);letter-spacing:.08em}
      .helios-guardian-body{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px;align-items:center;margin-top:7px}.helios-guardian-orbit{width:58px;height:58px;position:relative;display:grid;place-items:center;margin:auto}.helios-guardian-orbit:before,.helios-guardian-orbit:after{content:'';position:absolute;border-radius:50%;inset:2px;border:1px solid color-mix(in srgb,var(--resource-primary) calc(22% + 24% * var(--guardian-pressure)),transparent);box-shadow:0 0 calc(8px + 14px * var(--guardian-pressure)) color-mix(in srgb,var(--resource-primary) calc(10% + 22% * var(--guardian-pressure)),transparent)}.helios-guardian-orbit:after{inset:8px;border-color:color-mix(in srgb,var(--resource-secondary) calc(20% + 20% * var(--guardian-pressure)),transparent);border-style:dashed;animation:heliosGuardianOrbit 10s linear infinite reverse}.helios-guardian-core{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at 50% 36%,color-mix(in srgb,var(--resource-tertiary) 28%,#0a1218),#071016 68%);border:1px solid color-mix(in srgb,var(--resource-tertiary) 42%,#27353e);box-shadow:inset 0 0 12px color-mix(in srgb,var(--resource-primary) 12%,transparent),0 0 calc(6px + 12px * var(--guardian-pressure)) color-mix(in srgb,var(--resource-secondary) calc(8% + 14% * var(--guardian-pressure)),transparent);font-size:14px;z-index:2}.helios-guardian-core small{display:block;font-size:4px;line-height:1;letter-spacing:.08em;color:#9ca9b2;margin-top:-5px}
      .helios-guardian-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.helios-guardian-chip{min-width:0;border:1px solid #26343d;border-radius:8px;background:#061017c0;padding:6px}.helios-guardian-chip span{display:block;font-size:6px;color:#71808a;letter-spacing:.09em}.helios-guardian-chip b{display:block;margin-top:2px;font:7px ui-monospace,SFMono-Regular,Consolas,monospace;color:#cad4da;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.helios-guardian-chip.thermal b{color:var(--resource-primary)}.helios-guardian-chip.power b{color:var(--resource-secondary)}.helios-guardian-chip.privacy b{color:var(--resource-tertiary)}
      .helios-guardian-foot{display:flex;justify-content:space-between;gap:8px;margin-top:6px;padding-top:6px;border-top:1px solid #1d2931;color:#677680;font-size:6px;letter-spacing:.06em}.helios-guardian-foot b,.helios-guardian-foot strong{color:#b9c5cb}.helios-hardware-guardian.is-armed{border-color:color-mix(in srgb,var(--resource-primary) calc(34% + 26% * var(--guardian-pressure)),var(--resource-secondary));box-shadow:inset 0 0 calc(14px + 24px * var(--guardian-pressure)) color-mix(in srgb,var(--resource-primary) calc(7% + 12% * var(--guardian-pressure)),transparent),0 0 calc(7px + 18px * var(--guardian-pressure)) color-mix(in srgb,var(--resource-secondary) calc(5% + 13% * var(--guardian-pressure)),transparent)}.helios-hardware-guardian.is-armed .helios-guardian-core{animation:heliosGuardianBreathe 3.8s ease-in-out infinite}
      @media(max-width:390px){.helios-guardian-body{grid-template-columns:54px minmax(0,1fr)}.helios-guardian-orbit{width:50px;height:50px}.helios-guardian-grid{grid-template-columns:1fr}.helios-guardian-foot{flex-direction:column;gap:3px}}
      @media(prefers-reduced-motion:reduce){.helios-guardian-orbit:after,.helios-hardware-guardian.is-armed .helios-guardian-core{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function pressureBand(ratio){
    if(ratio>=.99) return 'MAX';
    if(ratio>=.66) return 'HIGH';
    if(ratio>=.33) return 'MODERATE';
    if(ratio>0) return 'LOW';
    return 'IDLE';
  }

  function currentPolicy(){
    const external=window.HELIOS_RESOURCE_POLICY?.getState?.();
    return external&&typeof external==='object'?external:{visual_envelope_ratio:0,compute_active:false,resource_class:'IDLE'};
  }

  function sync(raw){
    if(!state.host) return;
    const p=raw&&typeof raw==='object'?raw:currentPolicy();
    const ratio=clamp(p.visual_envelope_ratio,0,1);
    const active=Boolean(p.compute_active);
    state.policy={...p,visual_envelope_ratio:ratio};
    state.armed=active;
    state.host.style.setProperty('--guardian-pressure',String(ratio.toFixed(3)));
    state.host.classList.toggle('is-armed',active);
    state.host.dataset.pressure=pressureBand(ratio);
    if(state.status) state.status.textContent=active?'POLICY ARMED · AGENT GATE':'POLICY PREVIEW · AGENT GATE';
    if(state.pressure) state.pressure.textContent=`${pressureBand(ratio)} · ${Math.round(ratio*100)}%`;
    window.dispatchEvent(new CustomEvent('helios:hardware-guardian-preview',{detail:{
      version:VERSION,
      live_telemetry:false,
      policy_preview_only:true,
      request_pressure_ratio:ratio,
      request_pressure_band:pressureBand(ratio),
      compute_active:active,
      sensor_scope:'HARDWARE_ONLY',
      human_observation:'FORBIDDEN',
      production_gate:'HELIOS_DESKTOP_AGENT_HARDWARE_GUARDIAN',
      game_effect:'NONE',rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE'
    }}));
  }

  function build(){
    const consoleHost=document.getElementById('helios-resource-console');
    if(!consoleHost||document.getElementById('helios-hardware-guardian-preview')) return false;
    injectStyles();
    const host=document.createElement('div');
    host.id='helios-hardware-guardian-preview';
    host.className='helios-hardware-guardian';
    host.innerHTML=`
      <div class="helios-guardian-head"><span>HARDWARE GUARDIAN · HUMAN-BLIND</span><b id="helios-guardian-status">POLICY PREVIEW · AGENT GATE</b></div>
      <div class="helios-guardian-body">
        <div class="helios-guardian-orbit"><div class="helios-guardian-core">🛡<small>DEVICE CARE</small></div></div>
        <div class="helios-guardian-grid">
          <div class="helios-guardian-chip thermal"><span>THERMAL</span><b>USER + VENDOR LIMITS</b></div>
          <div class="helios-guardian-chip power"><span>POWER</span><b>WATT HEADROOM</b></div>
          <div class="helios-guardian-chip"><span>BATTERY</span><b>AC / RESERVE POLICY</b></div>
          <div class="helios-guardian-chip privacy"><span>PRIVACY</span><b>HARDWARE ONLY</b></div>
        </div>
      </div>
      <div class="helios-guardian-foot"><span>REQUEST PRESSURE <b id="helios-guardian-pressure">IDLE · 0%</b></span><span>LIVE SENSORS <strong>DESKTOP AGENT REQUIRED</strong></span></div>
    `;
    consoleHost.appendChild(host);
    state.host=host;
    state.status=host.querySelector('#helios-guardian-status');
    state.pressure=host.querySelector('#helios-guardian-pressure');
    state.attached=true;
    sync();
    window.HELIOS_HARDWARE_GUARDIAN_PREVIEW=Object.freeze({version:VERSION,getState:()=>({
      version:VERSION,
      attached:state.attached,
      live_telemetry:false,
      policy_preview_only:true,
      request_pressure_ratio:Number(state.policy?.visual_envelope_ratio||0),
      compute_active:state.armed,
      sensor_scope:'HARDWARE_ONLY',
      human_observation:'FORBIDDEN'
    })});
    window.dispatchEvent(new CustomEvent('helios:hardware-guardian-ui-ready',{detail:{version:VERSION,hardware_only:true,human_blind:true,live_telemetry:false}}));
    return true;
  }

  function init(){
    let attempts=0;
    const tryAttach=()=>{
      if(build()) return;
      if(++attempts<120) setTimeout(tryAttach,75);
    };
    tryAttach();
    window.addEventListener('helios:resource-policy',event=>sync(event.detail));
    window.addEventListener('helios:resource-console-ready',()=>{build();sync();});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
