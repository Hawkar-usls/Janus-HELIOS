(() => {
  'use strict';

  const VERSION='1.0.0';
  const SYMBOLS=Object.freeze({
    helios:Object.freeze(['☀','⬡','◈','⚙','✦','∆','◇']),
    divine:Object.freeze(['✦','☼','◇','△','❖','✧','⬡']),
    gridjack:Object.freeze(['◈','⬢','⚡','⬡','◆','⬣','◇']),
    custom:Object.freeze(['⚙','⌘','⧉','⧫','◌','◇','⬡'])
  });

  const state={attached:false,reels:null,observer:null,modeObserver:null,mode:'helios'};

  function injectStyles(){
    if(document.getElementById('helios-reel-identity-styles')) return;
    const style=document.createElement('style');
    style.id='helios-reel-identity-styles';
    style.textContent=`
      .reels.reel-identity-v1{isolation:isolate;background:linear-gradient(180deg,#020508,#060b10 48%,#020508);border-color:#38444e;box-shadow:inset 0 14px 30px #000d,inset 0 -14px 30px #000c,0 0 24px var(--mode-soft)}
      .reels.reel-identity-v1:before,.reels.reel-identity-v1:after{content:"";position:absolute;z-index:5;left:7px;right:7px;height:13px;pointer-events:none;border-radius:999px;opacity:.54}
      .reels.reel-identity-v1:before{top:3px;background:linear-gradient(180deg,#dce7ed18,transparent)}
      .reels.reel-identity-v1:after{bottom:3px;background:linear-gradient(0deg,#dce7ed12,transparent)}
      .reel[data-reel-index]{position:relative;padding:2px;border-radius:9px;background:linear-gradient(90deg,#ffffff04,transparent 24% 76%,#ffffff03);box-shadow:inset 1px 0 #ffffff05,inset -1px 0 #000b}
      .reel[data-reel-index] .cell{position:relative;isolation:isolate;overflow:hidden;border-color:#34414b;background:linear-gradient(180deg,#111922,#070c11);font-size:26px;font-weight:760;text-shadow:0 1px 8px #000;transition:border-color .55s ease,box-shadow .55s ease,color .55s ease,transform .18s ease,background .55s ease}
      .reel[data-reel-index] .cell:before{content:"";position:absolute;z-index:-1;inset:5px;border-radius:7px;pointer-events:none;opacity:.58;transition:opacity .55s ease,transform .55s ease,background .55s ease,box-shadow .55s ease}
      .reel[data-reel-index] .cell:after{content:"";position:absolute;z-index:-1;width:22px;height:22px;right:-8px;bottom:-8px;border:1px solid currentColor;border-radius:50%;opacity:.08;pointer-events:none;transition:opacity .55s ease,transform .55s ease}
      .cell[data-rank="0"]{font-size:32px!important;font-weight:950}.cell[data-rank="0"]:before{opacity:.90;transform:scale(.92)}
      .cell[data-rank="1"]{font-size:29px!important}.cell[data-rank="2"]{font-size:28px!important}.cell[data-rank="5"],.cell[data-rank="6"]{font-size:23px!important;opacity:.92}
      .cell[data-rank="0"]:after{width:32px;height:32px;right:-10px;bottom:-10px;opacity:.17}.cell[data-rank="1"]:after{opacity:.13}.cell[data-rank="2"]:after{opacity:.11}

      body[data-game-mode="helios"] .reels.reel-identity-v1{--reel-ink:#ffd66d;--reel-dim:#b36d22}
      body[data-game-mode="helios"] .reel[data-reel-index] .cell{color:#f7e6ba;background:linear-gradient(180deg,#18150f,#090d10)}
      body[data-game-mode="helios"] .reel[data-reel-index] .cell:before{background:radial-gradient(circle at 50% 50%,rgba(255,205,100,.11),transparent 42%),conic-gradient(from 8deg,transparent 0 12deg,rgba(255,187,64,.055) 12deg 17deg,transparent 17deg 38deg)}
      body[data-game-mode="helios"] .cell[data-rank="0"]{color:#fff0a6;text-shadow:0 0 9px #ffd2698c,0 0 22px #ff9d2848}
      body[data-game-mode="helios"] .cell[data-rank="0"]:before{background:radial-gradient(circle,rgba(255,242,174,.25) 0 8%,rgba(255,183,58,.14) 28%,transparent 62%),conic-gradient(from 0deg,rgba(255,206,99,.13),transparent 13%,rgba(255,206,99,.10) 25%,transparent 38%,rgba(255,206,99,.11) 52%,transparent 66%,rgba(255,206,99,.10) 80%,transparent)}
      body[data-game-mode="helios"] .cell[data-rank="1"],body[data-game-mode="helios"] .cell[data-rank="2"]{color:#f6c876}

      body[data-game-mode="divine"] .reels.reel-identity-v1{--reel-ink:#d8b5ff;--reel-dim:#7761a9}
      body[data-game-mode="divine"] .reel[data-reel-index] .cell{color:#e9dcfa;background:linear-gradient(145deg,#151321,#0a0c13 58%)}
      body[data-game-mode="divine"] .reel[data-reel-index] .cell:before{border-radius:2px;background:linear-gradient(135deg,transparent 18%,rgba(215,167,255,.075) 19% 20%,transparent 21% 48%,rgba(128,215,255,.045) 49% 50%,transparent 51%),linear-gradient(45deg,rgba(215,167,255,.035),transparent 44%)}
      body[data-game-mode="divine"] .cell[data-rank="0"]{color:#f4e4ff;text-shadow:0 0 10px #d9a7ff99,0 0 25px #8f6aff42}
      body[data-game-mode="divine"] .cell[data-rank="0"]:before{transform:rotate(45deg) scale(.62);border:1px solid rgba(221,184,255,.30);box-shadow:0 0 20px rgba(183,116,255,.16),inset 0 0 15px rgba(128,215,255,.08);background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(184,124,255,.045))}
      body[data-game-mode="divine"] .cell[data-rank="1"],body[data-game-mode="divine"] .cell[data-rank="2"]{color:#cfb4f0}

      body[data-game-mode="gridjack"] .reels.reel-identity-v1{--reel-ink:#95ff9a;--reel-dim:#4c9c67}
      body[data-game-mode="gridjack"] .reel[data-reel-index] .cell{color:#cdebd5;background:linear-gradient(180deg,#0c1713,#060d0b)}
      body[data-game-mode="gridjack"] .reel[data-reel-index] .cell:before{border-radius:3px;background:repeating-linear-gradient(0deg,transparent 0 8px,rgba(112,255,146,.04) 8px 9px),repeating-linear-gradient(90deg,transparent 0 11px,rgba(112,255,146,.035) 11px 12px)}
      body[data-game-mode="gridjack"] .reel.reel-spinning .cell:before{animation:heliosGridScan .55s linear infinite}
      body[data-game-mode="gridjack"] .cell[data-rank="0"]{color:#b9ffbc;text-shadow:0 0 9px #95ff9a8f,0 0 22px #44e77b36}
      body[data-game-mode="gridjack"] .cell[data-rank="0"]:before{background:radial-gradient(circle,rgba(149,255,154,.18),transparent 50%),repeating-linear-gradient(90deg,transparent 0 8px,rgba(149,255,154,.08) 8px 9px);box-shadow:inset 0 0 15px rgba(80,255,132,.08)}
      body[data-game-mode="gridjack"] .cell[data-symbol="⚡"]{color:#ffe36e;text-shadow:0 0 8px #ffdf5780}
      @keyframes heliosGridScan{from{background-position:0 0,0 0}to{background-position:0 18px,24px 0}}

      body[data-game-mode="custom"] .reels.reel-identity-v1{--reel-ink:#80d7ff;--reel-dim:#467b95}
      body[data-game-mode="custom"] .reel[data-reel-index] .cell{color:#d4e8f1;background:linear-gradient(180deg,#0d151b,#070c10)}
      body[data-game-mode="custom"] .reel[data-reel-index] .cell:before{background:radial-gradient(circle at 50% 50%,transparent 0 28%,rgba(128,215,255,.055) 29% 30%,transparent 31% 48%,rgba(128,215,255,.035) 49% 50%,transparent 51%),linear-gradient(90deg,transparent 49%,rgba(128,215,255,.035) 50%,transparent 51%)}
      body[data-game-mode="custom"] .cell[data-rank="0"]{color:#c6ecff;text-shadow:0 0 9px #80d7ff85,0 0 22px #55bde943}
      body[data-game-mode="custom"] .cell[data-rank="0"]:before{background:radial-gradient(circle,transparent 0 27%,rgba(128,215,255,.17) 28% 30%,transparent 31% 44%,rgba(128,215,255,.08) 45% 47%,transparent 48%),conic-gradient(from 0deg,rgba(128,215,255,.08),transparent 8% 17%,rgba(128,215,255,.07) 18% 26%,transparent 27% 42%,rgba(128,215,255,.07) 43% 51%,transparent 52%)}
      body[data-game-mode="custom"] .cell[data-rank="1"],body[data-game-mode="custom"] .cell[data-rank="2"]{color:#9edcf5}

      .reels.reel-identity-v1 .cell.hit:before{opacity:1;box-shadow:inset 0 0 16px var(--mode-soft),0 0 13px var(--mode-soft)}
      @media(prefers-reduced-motion:reduce){body[data-game-mode="gridjack"] .reel.reel-spinning .cell:before{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function currentMode(){
    const mode=document.body.dataset.gameMode||'helios';
    return SYMBOLS[mode]?mode:'helios';
  }

  function tagCells(){
    if(!state.reels) return;
    state.mode=currentMode();
    state.reels.classList.add('reel-identity-v1');
    state.reels.dataset.reelIdentityMode=state.mode;
    const symbols=SYMBOLS[state.mode];
    [...state.reels.querySelectorAll('.reel')].forEach((reel,index)=>{
      reel.dataset.reelIndex=String(index+1);
      [...reel.querySelectorAll('.cell')].forEach(cell=>{
        const symbol=cell.textContent.trim();
        const rank=symbols.indexOf(symbol);
        cell.dataset.symbol=symbol;
        cell.dataset.rank=String(rank>=0?rank:6);
        cell.dataset.symbolTier=rank===0?'CORE':rank<=2?'HIGH':rank<=4?'MID':'BASE';
      });
    });
  }

  function bindObservers(){
    state.observer=new MutationObserver(tagCells);
    state.observer.observe(state.reels,{subtree:true,childList:true,characterData:true});
    state.modeObserver=new MutationObserver(tagCells);
    state.modeObserver.observe(document.body,{attributes:true,attributeFilter:['data-game-mode']});
  }

  function attach(){
    if(state.attached) return true;
    state.reels=document.getElementById('reels');
    if(!state.reels) return false;
    state.attached=true;
    injectStyles();
    tagCells();
    bindObservers();
    window.HELIOS_REEL_IDENTITY=Object.freeze({
      version:VERSION,
      getState:()=>({version:VERSION,attached:state.attached,mode:state.mode,presentation_only:true,reads_mode:true,reads_visible_symbol:true,reads_spin_math:false,reads_bet:false,reads_balance:false,reads_compute:false,rng_effect:'NONE',rtp_effect:'NONE',payout_effect:'NONE',compute_routing_effect:'NONE'})
    });
    dispatchEvent(new CustomEvent('helios:reel-identity-ready',{detail:{version:VERSION,presentation_only:true,mode_native_reels:true,symbol_text_preserved:true,rng_effect:'NONE',rtp_effect:'NONE',compute_routing_effect:'NONE'}}));
    return true;
  }

  function init(){
    if(attach()) return;
    let attempts=0;
    const retry=()=>{if(attach()||++attempts>=80)return;setTimeout(retry,75);};
    retry();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
