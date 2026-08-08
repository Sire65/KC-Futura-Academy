'use strict';
window.KC_FUTURA_VERSION={"schema":"KC_FUTURA_RELEASE_V1","academyVersion":"Beta 2.5.1","academyVersionNumber":"2.5.1","versionCoreVersion":"0.4.0","databaseCoreVersion":"0.7.0","installationManagerVersion":"0.1.0","regressionManagerVersion":"0.1.0","trainingVersion":"3.14.0-FUTURA Candidate","bilderrechnerVersion":"V0.31.3.6 Repair 11","bilderrechnerVersionNumber":"0.31.3.6.11","bilderrechnerUiSchema":"0.31.3.6-r11-ui.1","build":"2026-08-03T20:15:00+02:00","cacheVersion":"kc-futura-academy-2.5.1","databaseCore":"0.7.0","databaseConnectorCoreVersion":"0.2.0","configurationCoreVersion":"0.2.0"};
window.KC_DEPLOYMENT_CONFIG={
  version:'2.5.1',
  supabase:{
    projectUrl:'https://iddudrxuihdodnvejxcp.supabase.co',
    publishableKey:'sb_publishable_DWLycZijZEBvakXVncI5IQ_38LZCQxW',
    enabled:true,
    autoSync:true,
    offlineAllowed:true,
    syncIntervalSeconds:60
  },
  support:{
    email:'',
    subject:'KC FUTURA Supportbericht'
  }
};
/* Karriereleiter wird nur innerhalb der FUTURA-Academy nachgeladen; Training/POS bleiben unverändert. */
if(/\/academy\/(?:index\.html)?$/i.test(location.pathname)){
  const s=document.createElement('script');
  s.src='karriereleiter/academy-launcher.js?v=1.2.0';
  s.defer=true;
  document.head.appendChild(s);
}
