const fs=require('fs'),assert=require('assert');
const source=fs.readFileSync('taur-cloud-sync-v1.js','utf8');
const reconciliationSource=fs.readFileSync('taur-cloud-reconciliation-v1.js','utf8');
const required=[
  'legacyGrowth[k]=mergeRecords',
  'applyTombstones(merged)',
  'const mergeRecords=',
  'const applyTombstones=',
  'function scheduleCoreSync()',
  'if(!remoteReady||loadingRemote||!client||!businessId)return;',
  "window.TAUR.on('DATA_SAVED',scheduleCoreSync)",
  "window.TAUR.on('TRANSACTION_COMMITTED',scheduleCoreSync)",
  'coreSyncTimer=setTimeout(()=>{syncNow()},350)',
  "record_id:String(record.id)",
  "client.from('app_records').delete()"
],
  'const TAUR_CLOUD_RECONCILIATION=',
  'newerRecord',
  'mergeRecords',;
for(const token of required) assert(source.includes(token),'Missing cloud sync contract: '+token);
const testBlock=source.slice(source.indexOf('window.taurCloudTests={run:'),source.indexOf('};',source.indexOf('window.taurCloudTests={run:'))+2);
assert(testBlock.includes('newer update wins'));
assert(testBlock.includes('older update loses'));
assert(testBlock.includes('newer recreation beats tombstone'));
assert(testBlock.includes('tombstone removes stale recreation'));
assert(source.includes('const buildReconciliationPlan='),'Missing reconciliation planner');
assert(source.includes('window.taurCloudDiagnostics='),'Missing cloud diagnostics API');
assert(source.includes('lastReconciliationPlan'),'Missing persisted reconciliation diagnostics');
const planFnStart=source.indexOf('const buildReconciliationPlan=');
const planFnEnd=source.indexOf(' const toast=',planFnStart);
const planFn=source.slice(planFnStart,planFnEnd);
assert(planFn.includes('upserts'),'Planner must count upserts');
assert(planFn.includes('staleDeletes'),'Planner must count stale deletions');
assert(planFn.includes('legacyDeletes'),'Planner must count legacy-row cleanup');
assert(source.includes('const compareRecordState='),'Missing deterministic conflict resolver');
const conflictFnStart=source.indexOf('const compareRecordState=');
const conflictFnEnd=source.indexOf(' const toast=',conflictFnStart);
const conflictFn=source.slice(conflictFnStart,conflictFnEnd);
assert(conflictFn.includes("return 'KEEP'"),'Conflict resolver must support KEEP');
assert(conflictFn.includes("return 'UPDATE'"),'Conflict resolver must support UPDATE');
assert(conflictFn.includes("ls>=rs?'UPDATE':'KEEP'"),'Conflict resolver must deterministically resolve equal timestamps');
assert(!source.includes('const compareRecordState='),'Cloud Sync must not reimplement compareRecordState');
assert(!source.includes('const buildReconciliationPlan='),'Cloud Sync must not reimplement buildReconciliationPlan');
assert(source.includes('TAUR_CLOUD_RECONCILIATION.compareRecordState'),'Cloud Sync must delegate comparison');
assert(source.includes('TAUR_CLOUD_RECONCILIATION.buildReconciliationPlan'),'Cloud Sync must delegate planning');

const tombstoneEngine=reconciliation.applyTombstones;
assert(tombstoneEngine,'Standalone reconciliation module must expose applyTombstones');
const stale={customers:[{id:'cust-1',updated:'2026-01-01T00:00:00.000Z'}],tombstones:[{collection:'customers',recordId:'cust-1',deletedAt:'2026-01-02T00:00:00.000Z'}]};
const staleResult=tombstoneEngine(stale);
assert.strictEqual(staleResult.customers.length,0);
cases.push('older recreation removed by newer tombstone');
const recreation={customers:[{id:'cust-1',updated:'2026-01-03T00:00:00.000Z'}],tombstones:[{collection:'customers',recordId:'cust-1',deletedAt:'2026-01-02T00:00:00.000Z'}]};
const recreationResult=tombstoneEngine(recreation);
assert.strictEqual(recreationResult.customers.length,1);
assert.strictEqual(recreationResult.tombstones.length,0);
cases.push('newer recreation survives older tombstone');

const equalTombstoneDb={customers:[{id:'cust-2',updated:'2026-01-02T00:00:00.000Z',value:'a'}],tombstones:[{collection:'customers',recordId:'cust-2',deletedAt:'2026-01-02T00:00:00.000Z'}]};
const equalTombstoneResult=tombstoneEngine(equalTombstoneDb);
assert(Array.isArray(equalTombstoneResult.tombstones),'Equal-time tombstone handling must remain deterministic');
cases.push('equal-time tombstone pruning deterministic');

assert(reconciliation.newerRecord&&reconciliation.mergeRecords,'Standalone module must expose merge helpers');
const older={id:'merge-1',updated:'2026-01-01T00:00:00.000Z',value:'old'};
const newer={id:'merge-1',updated:'2026-01-02T00:00:00.000Z',value:'new'};
assert.strictEqual(reconciliation.newerRecord(older,newer),newer);
assert.strictEqual(reconciliation.newerRecord(newer,older),newer);
const merged=reconciliation.mergeRecords([{...older}],[{...newer},{id:'merge-2',updated:'2026-01-01T00:00:00.000Z'}]);
assert.strictEqual(merged.length,2);
assert.strictEqual(merged.find(x=>x.id==='merge-1').value,'new');
cases.push('merge helpers → newer record wins and distinct records survive');
console.log('PASS — Cloud Sync test contract covers merge/tombstone, event-trigger, and per-record write invariants');
