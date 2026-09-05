(function(){
  'use strict';
  const KEY_SLOT='karriereleiter_crypto_key_v1';
  const VERSION=1, encoder=new TextEncoder(), decoder=new TextDecoder();
  let keyPromise=null, externalAdapter=null, keyMode='device-local';
  const b64=u8=>btoa(String.fromCharCode(...u8));
  const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  async function importRaw(raw){return crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt'])}
  async function localKey(){
    if(keyPromise)return keyPromise;
    keyPromise=(async()=>{
      if(!crypto?.subtle)throw new Error('Web Crypto nicht verfügbar');
      let raw=null;
      try{const s=localStorage.getItem(KEY_SLOT);if(s)raw=unb64(s)}catch(e){}
      if(!raw||raw.length!==32){raw=crypto.getRandomValues(new Uint8Array(32));try{localStorage.setItem(KEY_SLOT,b64(raw))}catch(e){}}
      return importRaw(raw);
    })();
    return keyPromise;
  }
  async function deriveShared(secret){
    const material=await crypto.subtle.importKey('raw',encoder.encode(String(secret)),{name:'PBKDF2'},false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt:encoder.encode('KC-FUTURA-Karriereleiter-v15'),iterations:210000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encrypt(value,purpose='data'){
    if(externalAdapter?.encryptJson)return externalAdapter.encryptJson(value,{purpose,module:'karriereleiter'});
    const key=await localKey(),iv=crypto.getRandomValues(new Uint8Array(12)),aad=encoder.encode(`karriereleiter:${purpose}:v${VERSION}`),plain=encoder.encode(JSON.stringify(value));
    const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad,tagLength:128},key,plain));
    return {__kc_enc:VERSION,alg:'A256GCM',mode:keyMode,iv:b64(iv),data:b64(cipher),purpose};
  }
  async function decrypt(envelope,purpose=null){
    if(envelope==null)return envelope;
    if(externalAdapter?.decryptJson&&!envelope?.__kc_enc)return externalAdapter.decryptJson(envelope,{purpose,module:'karriereleiter'});
    if(!envelope.__kc_enc)return envelope; // Legacy migration path.
    const key=await localKey(),p=purpose||envelope.purpose||'data',iv=unb64(envelope.iv),cipher=unb64(envelope.data),aad=encoder.encode(`karriereleiter:${p}:v${envelope.__kc_enc}`);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad,tagLength:128},key,cipher);
    return JSON.parse(decoder.decode(plain));
  }
  async function setKeyMaterial(secret){
    if(!secret)throw new Error('Schlüsselmaterial fehlt');
    keyPromise=deriveShared(secret);keyMode='futura-shared';await keyPromise;return true;
  }
  function setAdapter(adapter){externalAdapter=adapter||null;keyMode=adapter?'futura-adapter':'device-local';return true}
  async function selfTest(){const sample={ok:true,n:15,text:'Küchendirektor'};const enc=await encrypt(sample,'selftest'),dec=await decrypt(enc,'selftest');return{ok:JSON.stringify(sample)===JSON.stringify(dec),algorithm:'AES-GCM-256',mode:keyMode,envelope:!!enc.__kc_enc}}
  window.KarriereCrypto={encrypt,decrypt,setKeyMaterial,setAdapter,selfTest,getMode:()=>keyMode,isEnvelope:v=>!!v?.__kc_enc};
  window.KarriereleiterCryptoBridge={setAdapter,setKeyMaterial};
  if(window.KCFuturaCrypto?.encryptJson&&window.KCFuturaCrypto?.decryptJson)setAdapter(window.KCFuturaCrypto);
  else if(window.KCFuturaEncryptionKey)keyPromise=deriveShared(window.KCFuturaEncryptionKey),keyMode='futura-shared';
})();
