/* TAUR SERVICE CATALOG V1
 * Definition-first service architecture.
 * Pricing remains in TAUR.pricebook; this module owns production definitions.
 */
(()=> {
  'use strict';
  const root=window.TAUR=window.TAUR||{};
  const VERSION='1.0.0';
  const services=[
    {
      id:'A1',version:VERSION,division:'DETAILING',family:'A — MAINTENANCE',name:'Maintenance Interior',
      purpose:'Routine interior cleaning for a generally serviceable vehicle.',
      conditions:['C1 — MAINTENANCE','C2 — MODERATE'],
      procedures:['Interior inspection','Remove loose debris','Clean accessible interior surfaces','Clean common touch points','Vacuum accessible carpet, seats, mats and floors','Interior glass cleaning','Final interior inspection'],
      exclusions:['Severe stain restoration','Heavy pet-hair removal','Biohazard cleanup','Mold remediation','Deep extraction unless separately approved','Material repair'],
      equipment:['Vacuum','Interior brushes','Approved cleaning tools'],
      materials:['Interior cleaner','Glass cleaner','Shop towels','Approved protectant'],
      laborTarget:null,
      qc:['Included areas inspected','Excluded defects documented']
    },
    {
      id:'A2',version:VERSION,division:'DETAILING',family:'A — MAINTENANCE',name:'Maintenance Exterior',
      purpose:'Routine exterior cleaning for a generally serviceable vehicle.',
      conditions:['C1 — MAINTENANCE','C2 — MODERATE'],
      procedures:['Exterior condition inspection','Approved wash process','Wheel and tire cleaning within scope','Exterior glass cleaning','Drying and final inspection'],
      exclusions:['Paint correction','Heavy oxidation removal','Deep bonded-contaminant restoration unless quoted','Paint/body repair'],
      equipment:['Pressure/wash equipment','Wheel and tire tools','Drying tools'],
      materials:['Approved wash chemistry','Wheel/tire cleaner','Glass cleaner','Drying towels'],
      laborTarget:null,
      qc:['Included exterior surfaces inspected','Remaining defects documented']
    },
    {
      id:'A3',version:VERSION,division:'DETAILING',family:'A — MAINTENANCE',name:'Maintenance Full',
      purpose:'Combined routine interior and exterior maintenance.',
      conditions:['C1 — MAINTENANCE','C2 — MODERATE'],
      procedures:['A1 Maintenance Interior scope','A2 Maintenance Exterior scope','Combined final inspection'],
      exclusions:['A1 exclusions','A2 exclusions','Any unapproved restoration work'],
      equipment:['Equipment required by A1/A2'],
      materials:['Materials required by A1/A2'],
      laborTarget:null,
      qc:['Interior QC passed','Exterior QC passed']
    },
    {
      id:'B1',version:VERSION,division:'DETAILING',family:'B — RESTORATION',name:'Interior Restoration',
      purpose:'Address interior contamination or deterioration requiring materially more labor than routine maintenance.',
      conditions:['C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Pre-service inspection','Define approved restoration scope','Perform approved deeper-cleaning procedures','Final inspection'],
      exclusions:['Unapproved restoration work','Material repair/replacement','Biohazard or hazardous remediation unless separately scoped'],
      equipment:['Selected after inspection'],
      materials:['Selected after inspection'],
      laborTarget:null,
      qc:['Approved areas inspected against pre-service condition','Remaining defects documented']
    },
    {
      id:'B2',version:VERSION,division:'DETAILING',family:'B — RESTORATION',name:'Exterior Restoration',
      purpose:'Address exterior contamination or condition requiring labor beyond routine maintenance.',
      conditions:['C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Pre-service inspection','Define approved restoration scope','Perform approved restoration procedures','Final inspection'],
      exclusions:['Body repair','Paint repair','Unapproved correction work'],
      equipment:['Selected after inspection'],
      materials:['Selected after inspection'],
      laborTarget:null,
      qc:['Approved exterior areas inspected','Remaining defects documented']
    },
    {
      id:'B3',version:VERSION,division:'DETAILING',family:'B — RESTORATION',name:'Full Restoration',
      purpose:'Combined interior and exterior restoration for a vehicle requiring substantial additional labor.',
      conditions:['C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Approved B1 scope','Approved B2 scope','Combined QC inspection'],
      exclusions:['Any work outside approved B1/B2 scope'],
      equipment:['Selected after inspection'],
      materials:['Selected after inspection'],
      laborTarget:null,
      qc:['Interior restoration QC passed','Exterior restoration QC passed']
    },
    {
      id:'C1',version:VERSION,division:'DETAILING',family:'C — SPECIALTY / ADD-ONS',name:'Pet Hair Treatment',
      purpose:'Remove or materially reduce pet hair beyond routine vacuuming.',
      conditions:['C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Inspect hair quantity/location/material','Perform approved hair-removal process','Collect removed hair','Final inspection'],
      exclusions:['Upholstery/carpet repair or replacement','Out-of-scope contamination'],
      equipment:['Validated hair-removal tools','Vacuum'],
      materials:['Approved hair-removal consumables'],
      laborTarget:null,
      qc:['Targeted areas inspected','Remaining hair/inaccessible areas documented']
    },
    {
      id:'C2',version:VERSION,division:'DETAILING',family:'C — SPECIALTY / ADD-ONS',name:'Odor Treatment',
      purpose:'Treat an identified odor source or reduce persistent odor within an approved scope.',
      conditions:['C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Identify odor source','Perform approved cleaning/treatment','Post-treatment verification'],
      exclusions:['Permanent-elimination guarantees when source cannot be removed','Hazardous remediation unless separately scoped'],
      equipment:['Treatment-specific equipment'],
      materials:['Treatment-specific consumables'],
      laborTarget:null,
      qc:['Treatment completed to scope','Residual odor documented']
    },
    {
      id:'C3',version:VERSION,division:'DETAILING',family:'C — SPECIALTY / ADD-ONS',name:'Seat / Carpet Extraction',
      purpose:'Deep-clean fabric surfaces where routine cleaning is insufficient.',
      conditions:['C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Inspect fabric','Approved extraction process','Drying/ventilation procedure','Final inspection'],
      exclusions:['Permanent dye damage','Burns/tears','Material failure','Unsafe treatment'],
      equipment:['Validated extractor','Supporting tools'],
      materials:['Approved extraction chemistry','Consumables'],
      laborTarget:null,
      qc:['Coverage inspected','Remaining staining and moisture concerns documented']
    },
    {
      id:'C4',version:VERSION,division:'DETAILING',family:'C — SPECIALTY / ADD-ONS',name:'Headlight Restoration',
      purpose:'Improve clarity of degraded exterior headlight lenses through an approved restoration process.',
      conditions:['C1 — MAINTENANCE','C2 — MODERATE','C3 — HEAVY'],
      procedures:['Lens inspection','Approved restoration process','Finishing process','Final visual inspection'],
      exclusions:['Lamp/housing replacement','Internal failure','Cracked lens repair'],
      equipment:['Restoration tools'],
      materials:['Process-specific abrasives/compounds/coating'],
      laborTarget:null,
      qc:['Both lenses inspected for clarity and consistency']
    },
    {
      id:'C5',version:VERSION,division:'DETAILING',family:'C — SPECIALTY / ADD-ONS',name:'Engine Bay Detail',
      purpose:'Clean accessible engine-bay surfaces within a controlled low-risk scope.',
      conditions:['C1 — MAINTENANCE','C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Inspect bay','Controlled cleaning of approved accessible areas','Drying','Final inspection'],
      exclusions:['Mechanical diagnosis/repair','Electrical repair','Component removal','Hazardous contamination'],
      equipment:['Low-risk cleaning equipment'],
      materials:['Approved engine-bay cleaning/protection materials'],
      laborTarget:null,
      qc:['Approved accessible areas inspected','Unsafe/excluded areas documented']
    },
    {
      id:'C6',version:VERSION,division:'DETAILING',family:'C — SPECIALTY / ADD-ONS',name:'Other Specialty / Add-on',
      purpose:'Capture a specialty service not yet represented by a dedicated catalog item.',
      conditions:['C2 — MODERATE','C3 — HEAVY','C4 — EXTREME / INSPECTION REQUIRED'],
      procedures:['Inspect','Write explicit scope','Record equipment/material requirements','Perform approved scope','QC'],
      exclusions:['Anything not explicitly approved'],
      equipment:['Must be recorded before execution'],
      materials:['Must be recorded before execution'],
      laborTarget:null,
      qc:['Custom QC requirement recorded before completion']
    }
  ];
  const conditions=[
    {id:'C1 — MAINTENANCE',label:'C1 — Maintenance',fixedQuote:true,description:'Routine maintenance-level work.'},
    {id:'C2 — MODERATE',label:'C2 — Moderate',fixedQuote:true,description:'Inspect for additional labor before final quote.'},
    {id:'C3 — HEAVY',label:'C3 — Heavy',fixedQuote:true,description:'Restoration scope should be expected and documented.'},
    {id:'C4 — EXTREME / INSPECTION REQUIRED',label:'C4 — Extreme / Inspection Required',fixedQuote:false,description:'Inspection and scope definition required before fixed pricing.'}
  ];
  const sizes=['COMPACT','SEDAN / COUPE','SUV / CROSSOVER','TRUCK / LARGE SUV','VAN / OVERSIZE'];
  const byId=id=>services.find(s=>s.id===id)||null;
  root.serviceCatalog={version:VERSION,list:()=>services.map(s=>({...s,conditions:[...s.conditions],procedures:[...s.procedures],exclusions:[...s.exclusions],equipment:[...s.equipment],materials:[...s.materials],qc:[...s.qc]})),get:byId,conditions:()=>conditions.map(x=>({...x})),sizes:()=>sizes.slice()};
  root.serviceCatalog.snapshot=id=>{const s=byId(id);return s?JSON.parse(JSON.stringify(s)):null};
  root.serviceCatalog.validate=(serviceId,condition)=>{const s=byId(serviceId);if(!s)return {ok:false,reason:'SERVICE_NOT_FOUND'};if(!s.conditions.includes(condition))return {ok:false,reason:'CONDITION_NOT_SUPPORTED',service:s};return {ok:true,service:s,condition:condition==='C4 — EXTREME / INSPECTION REQUIRED'?'INSPECTION_REQUIRED':'SUPPORTED'}};
  root.on?.('DATA_CORE_READY',()=>root.emit('SERVICE_CATALOG_READY',{version:VERSION,count:services.length}));
})();
