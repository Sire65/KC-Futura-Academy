(function(){
  'use strict';
  function parentContext(){
    try{return window.KCFuturaModuleContext||window.parent?.KCFuturaModuleContext||null}catch(e){return window.KCFuturaModuleContext||null}
  }
  const ctx=parentContext();
  window.KCFuturaModuleContext=ctx||window.KCFuturaModuleContext||null;
  if(!ctx)return;
  if(ctx.cryptoAdapter?.encryptJson&&ctx.cryptoAdapter?.decryptJson)window.KCFuturaCrypto=ctx.cryptoAdapter;
  if(ctx.encryptionKey&&!window.KCFuturaCrypto)window.KCFuturaEncryptionKey=ctx.encryptionKey;
  if(ctx.supabaseClient)window.KCFuturaSupabase={client:ctx.supabaseClient};
  if(ctx.speechAdapter?.speak)window.KCFuturaSpeech=ctx.speechAdapter;
  if(typeof ctx.exitModule==='function')window.KCFutura={...(window.KCFutura||{}),exitModule:(moduleId)=>ctx.exitModule(moduleId)};
  window.__KC_FUTURA_KARRIERE_PROFILE={
    id:ctx.user?.id||ctx.profile?.id||null,
    name:ctx.user?.name||ctx.profile?.name||'Teilnehmer/in',
    professions:ctx.profile?.professions||ctx.user?.professions||['Küche']
  };
})();
