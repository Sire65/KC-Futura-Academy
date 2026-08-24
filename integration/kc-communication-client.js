// KC Futura Academy -> KC Communication integration adapter.
// Communication remains a separate central service; this file only calls it.
export function createKcCommunication(supabaseClient) {
  if (!supabaseClient?.functions?.invoke) throw new Error('Supabase client fehlt');
  const SOURCE='kc-academy';
  return {
    async send(eventKey, recipients, variables={}, options={}) {
      const {data,error}=await supabaseClient.functions.invoke('kc-communication-router',{body:{sourceProgram:SOURCE,eventKey,recipients:Array.isArray(recipients)?recipients:[],variables,priority:options.priority||'normal',testOnly:options.testOnly===true,correlationId:options.correlationId||`futura-${Date.now()}`}});
      if(error) throw error; return data;
    }
  };
}
