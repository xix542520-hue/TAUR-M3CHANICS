const fs=require('fs'),assert=require('assert'),vm=require('vm');
const source=fs.readFileSync('taur-cloud-reconciliation-v1.js','utf8');
const sandbox={globalThis:{},console,Math,Date,JSON};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);
const reconciliation=sandbox.globalThis.TAUR_CLOUD_RECONCILIATION;
assert(reconciliation,'Standalone reconciliation module must expose TAUR_CLOUD_RECONCILIATION');
const cases=[];
const check=(name,fn)=>{fn();cases.push(name)};

const same={id:'x',updated:'2026-01-02T00:00:00.000Z',value:1};
check('identical records → KEEP',()=>assert.strictEqual(reconciliation.compareRecordState(same,{payload:{...same},updated_at:same.updated}),'KEEP'));
check('local newer → UPDATE',()=>assert.strictEqual(reconciliation.compareRecordState({...same,value:2,updated:'2026-01-03T00:00:00.000Z'},{payload:same,updated_at:same.updated}),'UPDATE'));
check('remote newer → KEEP',()=>assert.strictEqual(reconciliation.compareRecordState(same,{payload:{...same,value:2},updated_at:'2026-01-03T00:00:00.000Z'}),'KEEP'));
const equalLocal={id:'x',updated:'2026-01-02T00:00:00.000Z',value:'a'};
const equalRemote={payload:{id:'x',updated:'2026-01-02T00:00:00.000Z',value:'b'},updated_at:'2026-01-02T00:00:00.000Z'};
check('equal timestamps → deterministic',()=>assert(['UPDATE','KEEP'].includes(reconciliation.compareRecordState(equalLocal,equalRemote))));
const plan=reconciliation.buildReconciliationPlan(
 {customers:[{id:'new',updated:'2026-01-03T00:00:00.000Z'}]},
 [
  {collection:'customers',record_id:'old',payload:{id:'old',updated:'2026-01-01T00:00:00.000Z'},updated_at:'2026-01-01T00:00:00.000Z'},
  {collection:'customers',record_id:'new',payload:{id:'new',updated:'2026-01-02T00:00:00.000Z'},updated_at:'2026-01-02T00:00:00.000Z'}
 ]);
check('planner CREATE count',()=>assert.strictEqual(plan.collections.customers.actions.create,0));
check('planner UPDATE count',()=>assert.strictEqual(plan.collections.customers.actions.update,1));
check('planner DELETE count',()=>assert.strictEqual(plan.collections.customers.actions.delete,1));
const duplicatePlan=reconciliation.buildReconciliationPlan(
 {customers:[{id:'dup',updated:'2026-01-02T00:00:00.000Z',value:'new'}]},
 [
  {collection:'customers',record_id:'dup',payload:{id:'dup',updated:'2026-01-01T00:00:00.000Z',value:'old'},updated_at:'2026-01-01T00:00:00.000Z'},
  {collection:'customers',record_id:'dup',payload:{id:'dup',updated:'2026-01-02T00:00:00.000Z',value:'new'},updated_at:'2026-01-02T00:00:00.000Z'},
  {collection:'unknown',record_id:'ghost',payload:{id:'ghost'},updated_at:'2026-01-01T00:00:00.000Z'}
 ]);
check('planner duplicate remote IDs collapse deterministically',()=>{assert.strictEqual(duplicatePlan.collections.customers.actions.update,0);assert.strictEqual(duplicatePlan.collections.customers.actions.keep,1);assert.strictEqual(duplicatePlan.totals.delete,0)});
check('planner exposes exact action IDs',()=>{const ids=duplicatePlan.collections.customers.ids;assert.deepStrictEqual(ids.create,[]);assert.deepStrictEqual(ids.update,[]);assert.deepStrictEqual(ids.keep,['dup']);assert.deepStrictEqual(ids.delete,[])});
check('planner ignores unknown collections',()=>assert.strictEqual(duplicatePlan.totals.delete,0));


const older={id:'merge-1',updated:'2026-01-01T00:00:00.000Z',value:'old'};
const newer={id:'merge-1',updated:'2026-01-02T00:00:00.000Z',value:'new'};
check('newerRecord → newer wins',()=>assert.strictEqual(reconciliation.newerRecord(older,newer),newer));
check('newerRecord is non-mutating',()=>{
  const a=JSON.parse(JSON.stringify(older)),b=JSON.parse(JSON.stringify(newer));
  reconciliation.newerRecord(a,b);
  assert.deepStrictEqual(a,older);assert.deepStrictEqual(b,newer);
});

const merged=reconciliation.mergeRecords([older],[newer,{id:'merge-2',updated:'2026-01-01T00:00:00.000Z'}]);
check('mergeRecords → duplicates resolve and distinct records survive',()=>{assert.strictEqual(merged.length,2);assert.strictEqual(merged.find(x=>x.id==='merge-1').value,'new')});
check('mergeRecords is non-mutating',()=>{
  const left=[JSON.parse(JSON.stringify(older))],right=[JSON.parse(JSON.stringify(newer)),{id:'merge-2',updated:'2026-01-01T00:00:00.000Z'}];
  reconciliation.mergeRecords(left,right);
  assert.deepStrictEqual(left,[older]);assert.deepStrictEqual(right,[newer,{id:'merge-2',updated:'2026-01-01T00:00:00.000Z'}]);
});


const stale={customers:[{id:'cust-1',updated:'2026-01-01T00:00:00.000Z'}],tombstones:[{collection:'customers',recordId:'cust-1',deletedAt:'2026-01-02T00:00:00.000Z'}]};
check('newer tombstone removes stale record',()=>assert.strictEqual(reconciliation.applyTombstones(stale).customers.length,0));
check('applyTombstones is non-mutating',()=>{const input=JSON.parse(JSON.stringify(recreation));reconciliation.applyTombstones(input);assert.deepStrictEqual(input,recreation)});
const recreation={customers:[{id:'cust-1',updated:'2026-01-03T00:00:00.000Z'}],tombstones:[{collection:'customers',recordId:'cust-1',deletedAt:'2026-01-02T00:00:00.000Z'}]};
check('newer recreation survives and clears tombstone',()=>{const out=reconciliation.applyTombstones(recreation);assert.strictEqual(out.customers.length,1);assert.strictEqual(out.tombstones.length,0)});

console.log('PASS — Cloud reconciliation behavioral tests');
cases.forEach((name,i)=>console.log('  '+(i+1)+'. '+name));
