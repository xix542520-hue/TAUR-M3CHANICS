(()=>{
  const root=window.TAUR;if(!root?.jobs?.get||!root?.jobs?.update)return;
  const CONDITIONS=['C1 — MAINTENANCE','C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'];
  const STATUS=['PENDING','IN_PROGRESS','COMPLETE'];
  const FINDING_TYPES=['DIRT','STAINS','PET_HAIR','ODOR','SCRATCHES','DAMAGE','MOLD_OR_BIOHAZARD','CONTAMINATION','WEAR','OTHER'];
  const now=()=>new Date().toISOString();
  const get=id=>root.jobs.get(id);
  const update=(id,patch)=>root.jobs.update(id,patch);
  const normalizeFinding=f=>({id:f?.id||('F-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),type:f?.type||'OTHER',area:String(f?.area||'').trim(),severity:f?.severity||'MEDIUM',note:String(f?.note||'').trim(),chargeable:f?.chargeable!==false});
  const classify=(findings=[])=>{
    const fs=findings.map(normalizeFinding);
    if(fs.some(f=>['MOLD_OR_BIOHAZARD','CONTAMINATION'].includes(f.type))||fs.some(f=>f.severity==='EXTREME'))return CONDITIONS[3];
    const heavy=fs.filter(f=>['DAMAGE','PET_HAIR','ODOR','STAINS','WEAR'].includes(f.type)||f.severity==='HIGH').length;
    if(heavy>=3)return CONDITIONS[2];
    if(fs.length>=1)return CONDITIONS[1];
    return CONDITIONS[0];
  };
  const begin=id=>{const j=get(id);if(!j||j.type!=='DETAILING')return null;return update(id,{inspectionStatus:'IN_PROGRESS',inspectionStartedAt:j.inspectionStartedAt||now()});};
  const save=id=>{const j=get(id);if(!j||j.type!=='DETAILING')return null;const findings=(j.inspectionFindings||[]).map(normalizeFinding);return update(id,{inspectionFindings:findings,inspectionCondition:j.inspectionCondition||classify(findings),inspectionStatus:'IN_PROGRESS'});};
  const complete=(id,data={})=>{const j=get(id);if(!j||j.type!=='DETAILING')return null;const findings=(data.findings||j.inspectionFindings||[]).map(normalizeFinding);const condition=data.condition||classify(findings);const exclusions=Array.isArray(data.exclusions)?data.exclusions.map(x=>String(x).trim()).filter(Boolean):(j.inspectionExclusions||[]);const notes=String(data.notes??j.inspectionNotes??'').trim();return update(id,{inspectionStatus:'COMPLETE',inspectionCompletedAt:now(),inspectionCondition:condition,condition,inspectionFindings:findings,inspectionExclusions:exclusions,inspectionNotes:notes,inspectionScopeApproved:condition!==CONDITIONS[3]?true:!!data.scopeApproved});};
  const snapshot=id=>{const j=get(id);if(!j)return null;return {status:j.inspectionStatus||'PENDING',condition:j.inspectionCondition||j.condition||'',findings:j.inspectionFindings||[],exclusions:j.inspectionExclusions||[],notes:j.inspectionNotes||'',scopeApproved:!!j.inspectionScopeApproved,startedAt:j.inspectionStartedAt||'',completedAt:j.inspectionCompletedAt||''};};
  root.detailInspection={conditions:()=>CONDITIONS.slice(),statuses:()=>STATUS.slice(),findingTypes:()=>FINDING_TYPES.slice(),get:snapshot,begin,save,complete,classify};
  window.taurOpenDetailInspection=window.taurOpenDetailInspection||function(id){return window.taurDetailInspectionUI?.open?.(id)};
})();