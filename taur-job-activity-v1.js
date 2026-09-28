/* TAUR JOB ACTIVITY V1
 * Durable per-job activity ledger backed by the existing jobs collection.
 * Runtime Data Core events remain useful, but this ledger survives reloads.
 */
(()=>{
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const now=()=>new Date().toISOString();
  const get=id=>root.jobs?.get?.(id)||null;
  const normalize=x=>({
    id:x?.id||('ACT-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)),
    at:x?.at||now(),
    type:String(x?.type||'ACTIVITY'),
    text:String(x?.text||''),
    note:String(x?.note||''),
    meta:x?.meta&&typeof x.meta==='object'?x.meta:{}
  });

  function record(jobId,type,text,note='',meta={}){
    const job=get(jobId);
    if(!job||!root.jobs?.update)return null;
    const entry=normalize({type,text,note,meta});
    const log=Array.isArray(job.activityLog)?job.activityLog.slice():[];
    log.push(entry);
    const updated=root.jobs.update(jobId,{activityLog:log,__taurActivityWrite:true});
    return updated?entry:null;
  }

  function list(jobId){
    const job=get(jobId);
    if(!job)return [];
    return (Array.isArray(job.activityLog)?job.activityLog:[]).map(normalize).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  }

  function describeEvent(type,d){
    if(type==='DETAIL_WORKFLOW_ADVANCED') return {jobId:d?.jobId,type:'WORKFLOW',text:(d?.from||'')+' → '+(d?.to||'')};
    if(type==='PAYMENTS_CREATED') return {jobId:d?.jobId,type:'PAYMENT',text:'Payment recorded',meta:{paymentId:d?.id||''}};
    if(type==='QUOTES_CREATED') return {jobId:d?.jobId,type:'QUOTE',text:'Quote created',meta:{quoteId:d?.id||''}};
    if(type==='QUOTES_UPDATED') return {jobId:d?.jobId,type:'QUOTE',text:'Quote updated',meta:{quoteId:d?.id||''}};
    if(type==='JOBS_UPDATED' && !d?.__taurActivityWrite) return {jobId:d?.id,type:'JOB UPDATE',text:'Job record updated'};
    if(type==='JOBS_CREATED') return {jobId:d?.id,type:'JOB CREATED',text:'Job created'};
    return null;
  }

  root.jobActivity={version:'1.0.0',record,list};

  root.on?.('*',payload=>{
    const e=payload||{}, d=e.detail||{};
    const item=describeEvent(e.type,d);
    if(!item?.jobId)return;
    record(item.jobId,item.type,item.text,'',item.meta);
  });

  const migrate=()=>{
    (root.jobs?.list?.()||[]).forEach(job=>{
      if(Array.isArray(job.activityLog))return;
      root.jobs.update(job.id,{activityLog:[]});
    });
    root.emit?.('JOB_ACTIVITY_READY',{version:'1.0.0'});
  };
  migrate();
})();
