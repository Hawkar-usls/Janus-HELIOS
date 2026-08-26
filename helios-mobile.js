(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('helios-mobile-capable');

  const style = document.createElement('style');
  style.id = 'helios-mobile-showcase-styles';
  style.textContent = `
    html{overflow-x:hidden;-webkit-text-size-adjust:100%;text-size-adjust:100%;}
    body{overflow-x:hidden;overscroll-behavior-x:none;}
    button,[role="button"],input,select{touch-action:manipulation;}

    @supports(height:100dvh){
      .profile-drawer{height:100dvh!important;}
      .profile-overlay,.solar-corona-overlay{min-height:100dvh;}
    }

    @media (pointer:coarse){
      button,.route,.mode-btn,.profile-tab,.profile-close,.bonus-buy-btn,.energy-spin-btn{min-height:44px;}
      input[type="range"]{min-height:34px;}
      .route,.mode-btn{-webkit-tap-highlight-color:transparent;}
    }

    @media(max-width:900px){
      .shell{width:100%!important;max-width:none!important;padding-left:max(12px,env(safe-area-inset-left))!important;padding-right:max(12px,env(safe-area-inset-right))!important;padding-top:max(12px,env(safe-area-inset-top))!important;padding-bottom:max(28px,env(safe-area-inset-bottom))!important;}
      .hero{grid-template-columns:minmax(0,1fr)!important;gap:12px!important;}
      .game-panel,.router{min-width:0!important;}
      .router{order:2;}
      .below{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
      .system-card{grid-column:1/-1!important;}
      .receipt pre{max-height:180px!important;overflow:auto!important;-webkit-overflow-scrolling:touch;}
      .ecosystem{overflow-x:auto!important;flex-wrap:nowrap!important;scrollbar-width:none;padding-bottom:3px;}
      .ecosystem::-webkit-scrollbar{display:none;}
      .ecosystem a{flex:0 0 auto;white-space:nowrap;}
      .profile-drawer{width:min(720px,100vw)!important;max-width:100vw!important;}
    }

    @media(max-width:640px){
      .shell{padding-left:max(8px,env(safe-area-inset-left))!important;padding-right:max(8px,env(safe-area-inset-right))!important;}
      .topbar{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:center!important;}
      .brand{min-width:0;}
      .brand-mark{width:34px!important;height:34px!important;flex:0 0 auto;}
      .brand h1{font-size:13px!important;letter-spacing:.11em!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .brand small{font-size:7px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .badges{display:none!important;}
      .helios-profile-btn{margin-left:0!important;min-width:44px!important;min-height:44px!important;padding:0 12px!important;display:grid!important;place-items:center!important;}
      .ecosystem{display:flex!important;margin-bottom:8px!important;}
      .ecosystem a{font-size:8px!important;padding:7px 9px!important;}

      .panel{border-radius:14px!important;}
      .game-panel,.router{padding:11px!important;}
      .eyebrow{font-size:7px!important;}
      .title{font-size:21px!important;}
      .subtitle{font-size:9px!important;line-height:1.45!important;}

      .core-wrap{grid-template-columns:80px minmax(0,1fr)!important;gap:9px!important;margin:10px 0!important;}
      .core{width:74px!important;height:74px!important;}
      .core-label{font-size:9px!important;}
      .core-label span{font-size:5px!important;}
      .core-meta{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important;}
      .metric{padding:7px!important;min-width:0;}
      .metric span{font-size:6px!important;}
      .metric b{font-size:10px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

      .mode-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;}
      .mode-btn{min-height:54px!important;padding:8px!important;}
      .mode-btn b{font-size:9px!important;}
      .mode-btn small{font-size:7px!important;}
      .mode-note{font-size:8px!important;line-height:1.35!important;}

      .machine-body{grid-template-columns:40px minmax(0,1fr)!important;gap:5px!important;}
      .energy-step{min-height:42px!important;padding:3px 1px!important;}
      .energy-step b{font-size:11px!important;}
      .energy-step small{font-size:5px!important;}
      .reels{gap:3px!important;padding:4px!important;border-radius:10px!important;}
      .reel{gap:3px!important;}
      .cell{min-height:clamp(48px,15vw,62px)!important;font-size:clamp(19px,7vw,25px)!important;border-radius:7px!important;}

      .win-deck{grid-template-columns:1fr 1.15fr!important;gap:6px!important;}
      .last-win-card{grid-column:1/-1!important;grid-row:1!important;min-height:74px!important;}
      .last-win-card b{font-size:32px!important;}
      .win-card{min-height:60px!important;padding:8px!important;}
      .game-controls{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:7px!important;}
      .spin-btn{grid-column:1/-1!important;grid-row:1!important;min-height:58px!important;font-size:18px!important;}
      .betbox,.auto-btn{min-height:48px!important;}
      .game-note{font-size:7px!important;line-height:1.45!important;}

      .bonus-buy-panel{grid-template-columns:1fr!important;}
      .bonus-buy-btn{width:100%!important;min-height:48px!important;}
      .spin-energy-panel{grid-template-columns:1fr!important;}
      .energy-spin-btn{width:100%!important;min-height:48px!important;}

      .router-head{align-items:center!important;}
      .router h2{font-size:17px!important;}
      .route-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;}
      .route{min-height:94px!important;padding:9px!important;}
      .route b{font-size:8px!important;}
      .route small{font-size:7px!important;line-height:1.3!important;}
      .flow .path{font-size:7px!important;overflow-wrap:anywhere;}
      .consent{padding:9px!important;}
      .consent span{font-size:8px!important;line-height:1.45!important;}
      .router-buttons{grid-template-columns:1fr!important;}
      .router-buttons button{min-height:48px!important;font-size:9px!important;}

      .below{grid-template-columns:1fr!important;}
      .system-card{grid-column:auto!important;}
      footer{font-size:6px!important;padding:0 6px;}

      .profile-overlay{align-items:stretch!important;}
      .profile-drawer{width:100vw!important;max-width:100vw!important;height:100dvh!important;border-left:0!important;padding:max(12px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(18px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))!important;}
      .profile-head{position:sticky!important;top:0!important;z-index:3!important;background:#0b1118f5!important;padding:4px 0 9px!important;}
      .profile-close{min-width:54px!important;min-height:44px!important;}
      .profile-tabs{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;position:sticky!important;top:74px!important;z-index:2!important;background:#071017ef!important;padding:7px 0!important;}
      .profile-tab{min-height:44px!important;padding:7px 6px!important;}
      .profile-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
      .profile-route-row,.profile-history-row,.profile-note-row{grid-template-columns:1fr!important;gap:4px!important;padding:9px 2px!important;}
      .profile-offers{grid-template-columns:1fr!important;}
      .offer-card{padding:11px!important;}
      .offer-meta{font-size:7px!important;}

      .solar-corona-overlay{padding:max(10px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))!important;overflow:auto!important;}
      .solar-corona-card{width:min(96vw,430px)!important;padding:13px!important;border-radius:17px!important;}
      .corona-stage{width:min(270px,78vw)!important;height:min(270px,78vw)!important;}
      .solar-corona-title{font-size:20px!important;}
    }

    @media(max-width:390px){
      .shell{padding-left:max(6px,env(safe-area-inset-left))!important;padding-right:max(6px,env(safe-area-inset-right))!important;}
      .game-panel,.router{padding:9px!important;}
      .core-wrap{grid-template-columns:68px minmax(0,1fr)!important;}
      .core{width:64px!important;height:64px!important;}
      .metric{padding:6px!important;}
      .machine-body{grid-template-columns:35px minmax(0,1fr)!important;}
      .energy-step b{font-size:9px!important;}
      .route-grid{grid-template-columns:1fr 1fr!important;}
      .route{min-height:88px!important;padding:7px!important;}
      .profile-title{font-size:17px!important;}
    }

    @media(max-height:520px) and (orientation:landscape){
      .shell{padding-top:max(6px,env(safe-area-inset-top))!important;}
      .core-wrap{grid-template-columns:70px minmax(0,1fr)!important;}
      .core{width:64px!important;height:64px!important;}
      .cell{min-height:42px!important;font-size:18px!important;}
      .profile-drawer{height:100dvh!important;}
    }
  `;
  document.head.appendChild(style);

  const coarse = matchMedia?.('(pointer:coarse)');
  const applyInputMode = () => document.body?.classList.toggle('touch-ui', Boolean(coarse?.matches));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyInputMode, {once:true});
  else applyInputMode();
  coarse?.addEventListener?.('change', applyInputMode);
})();
