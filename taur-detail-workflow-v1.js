/* TAUR DETAIL WORKFLOW V1
 * Enforces detailing lifecycle transitions and completion gates.
 */
(()=> {
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const FLOW=['INTAKE','INSPECT','QUOTE','APPROVE','BOOK','DETAIL','QC','COMPLETE','COLLECT','FOLLOW_UP'];
  const TERMINAL=['COMPLETE','CANCELLED'];
  const allowed={
    INTAKE:['INSPECT','CANCELLED'],
    INSPECT:['QUOTE','CANCELLED'],
    QUOTE:['APPROVE','INSPECT','CANCELLED'],
    APPROVE:['BOOK','QUOTE','CANCELLED'],
    BOOK:['DETAIL','CANCELLED'],
    DETAIL:['QC','CANCELLED'],
    QC:['COMPLETE','DETAIL'],
    COMPLETE:['COLLECT','FOLLOW_UP'],
    COLLECT:['FOLLOW_UP'],
    FOLLOW_UP:[]
  };
  const valid=id=>FLOW.includes(id)||id==='CANCELLED';
  const get=id=>root.jobs?.get?.(id)||null;
  const result=(ok,code,message,extra)=>Object.assign({ok,code,message},extra||{});
  function canAdvance(job,to){
    if(!job)return result(false,'JOB_NOT_FOUND','Job was not found.');
    if(job.type!=='DETAILING')return result(false,'NOT_DETAILING_JOB','Detail workflow only applies to detailing jobs.');
    const from=job.stage||'INTAKE';
    if(!valid(to))return result(false,'INVALID_STAGE','Unknown workflow stage.');
    if(!(allowed[from]||[]).includes(to))return result(false,'INVALID_TRANSITION','Stage '+from+' cannot transition directly to '+to+'.',{from,to,allowed:allowed[from]||[]});
    if(to==='QUOTE' && !job.serviceId)return result(false,'SERVICE_REQUIRED','A service definition must be selected before quoting.');
    if(to==='APPROVE'){
      const quotes=root.quotes?.listByJob?.(job.id)||[];
      const q=quotes.slice().reverse()[0];
      if(!q)return result(false,'QUOTE_REQUIRED','A quote must exist before approval.');
      if(q.status==='DRAFT')return result(false,'QUOTE_NOT_FINAL','The latest quote is still a draft.');
      if(q.condition==='C4 — EXTREME / INSPECTION REQUIRED' && !(job.inspectionStatus==='COMPLETE' && job.inspectionScopeApproved===true))return result(false,'INSPECTION_REQUIRED','Extreme-condition work requires a completed, explicitly scoped inspection before approval.');
    }
    if(to==='BOOK' && !job.customerId)return result(false,'CUSTOMER_REQUIRED','A customer is required before booking.');
    if(to==='QC'){
      if(!job.serviceId)return result(false,'SERVICE_REQUIRED','Service definition is required for QC.');
      if(job.qcStatus==='PASS')return result(false,'ALREADY_QC','QC is already passed.');
    }
    if(to==='COMPLETE' && job.qcStatus!=='PASS')return result(false,'QC_REQUIRED','QC must PASS before completion.');
    return result(true,'OK','Transition allowed.',{from,to});
  }
  function transition(id,to,note){
    const job=get(id),check=canAdvance(job,to);
    if(!check.ok)return check;
    const history=Array.isArray(job.stageHistory)?job.stageHistory.slice():[];
    history.push({from:job.stage||'INTAKE',to,at:new Date().toISOString(),note:String(note||'')});
    const patch={stage:to,stageHistory:history};
    if(to==='COMPLETE')patch.completedAt=new Date().toISOString();
    if(to==='CANCELLED')patch.cancelledAt=new Date().toISOString();
    const updated=root.jobs.update(id,patch);
    if(!updated)return result(false,'UPDATE_FAILED','Data Core rejected the stage transition.');
    root.emit?.('DETAIL_WORKFLOW_ADVANCED',{jobId:id,from:check.from,to});
    return result(true,'ADVANCED','Job advanced to '+to+'.',{job:updated});
  }
  function setQC(id,status,note){
    const job=get(id);
    if(!job)return result(false,'JOB_NOT_FOUND','Job was not found.');
    if(job.type!=='DETAILING')return result(false,'NOT_DETAILING_JOB','QC gate only applies to detailing jobs.');
    status=String(status||'').toUpperCase();
    if(!['PASS','FAIL','REWORK'].includes(status))return result(false,'INVALID_QC_STATUS','QC status must be PASS, FAIL, or REWORK.');
    const now=new Date().toISOString();
    const checks=Array.isArray(job.qcChecks)?job.qcChecks.slice():[];
    checks.push({status,note:String(note||''),at:now});
    const updated=root.jobs.update(id,{qcStatus:status,qcNote:String(note||''),qcAt:now,qcChecks:checks});
    if(!updated)return result(false,'UPDATE_FAILED','Data Core rejected the QC update.');
    root.emit?.('DETAIL_QC_RECORDED',{jobId:id,status,note:String(note||'')});
    return result(true,'QC_UPDATED','QC status recorded.',{job:updated});
  }
  function requirements(id){
    const j=get(id);if(!j)return null;
    return {
      jobId:id,stage:j.stage||'INTAKE',serviceDefined:!!j.serviceId,
      quoteExists:(root.quotes?.listByJob?.(id)||[]).length>0,
      qcStatus:j.qcStatus||'PENDING',
      canComplete:(j.stage==='QC'&&j.qcStatus==='PASS'),
      next:allowed[j.stage||'INTAKE']||[]
    };
  }
  root.detailWorkflow={version:'1.0.0',stages:()=>FLOW.slice(),allowed:()=>JSON.parse(JSON.stringify(allowed)),canAdvance,transition,setQC,requirements,terminal:()=>TERMINAL.slice()};
  root.on?.('DATA_CORE_READY',()=>root.emit('DETAIL_WORKFLOW_READY',{version:'1.0.0'}));
})();
