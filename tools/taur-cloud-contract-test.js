const fs=require('fs'),assert=require('assert'),vm=require('vm');

const source=fs.readFileSync('taur-cloud-sync-v1.js','utf8');
const reconciliationSource=fs.readFileSync('taur-cloud-reconciliation-v1.js','utf8');

const required=[
  'TAUR_CLOUD_RECONCILIATION.newerRecord',
  'TAUR_CLOUD_RECONCILIATION.mergeRecords',
  'TAUR_CLOUD_RECONCILIATION.applyTombstones',
  'TAUR_CLOUD_RECONCILIATION.buildReconciliationPlan',
  'TAUR_CLOUD_RECONCILIATION.compareRecordState',
  'function scheduleCoreSync()',
  'if(!remoteReady||loadingRemote||!client||!businessId)return;',
  "window.TAUR.on('DATA_SAVED',scheduleCoreSync)",
  "window.TAUR.on('TRANSACTION_COMMITTED',scheduleCoreSync)",
  'coreSyncTimer=setTimeout(()=>{coreSyncTimer=null;syncNow()},350)',
  'record_id:String(record.id)',
  "client.from('app_records').delete()",
  'function migrateLegacyGrowthToCore(db)',
  "localStorage.removeItem('TAUR_GROWTH_V1')"
];

for(const token of required) assert(source.includes(token),'Missing cloud sync contract: '+token);
assert((source.match(/async function loadRemote\\s*\\(/g)||[]).length===1,'Cloud Sync must define exactly one loadRemote');
assert((source.match(/function mergeRemoteRowsIntoLocal\\s*\\(/g)||[]).length===1,'Cloud Sync must define exactly one remote merge helper');
assert(!source.includes("localStorage.setItem('TAUR_GROWTH_V1',JSON.stringify"),'Cloud Sync must not maintain TAUR_GROWTH_V1 as a live mirror');
assert(!source.includes('const compareRecordState='),'Cloud Sync must not reimplement compareRecordState');
assert(!source.includes('const buildReconciliationPlan='),'Cloud Sync must not reimplement buildReconciliationPlan');

const sandbox={globalThis:{},console,Math,Date,JSON};
vm.createContext(sandbox);
vm.runInContext(reconciliationSource,sandbox);
const reconciliation=sandbox.globalThis.TAUR_CLOUD_RECONCILIATION;
assert(reconciliation,'Standalone reconciliation module must expose TAUR_CLOUD_RECONCILIATION');

const stale={
  customers:[{id:'cust-1',updated:'2026-01-01T00:00:00.000Z'}],
  tombstones:[{collection:'customers',recordId:'cust-1',deletedAt:'2026-01-02T00:00:00.000Z'}]
};
assert.strictEqual(reconciliation.applyTombstones(stale).customers.length,0);

const recreation={
  customers:[{id:'cust-1',updated:'2026-01-03T00:00:00.000Z'}],
  tombstones:[{collection:'customers',recordId:'cust-1',deletedAt:'2026-01-02T00:00:00.000Z'}]
};
const recreationResult=reconciliation.applyTombstones(recreation);
assert.strictEqual(recreationResult.customers.length,1);
assert.strictEqual(recreationResult.tombstones.length,0);

const equalTombstoneDb={
  customers:[{id:'cust-2',updated:'2026-01-02T00:00:00.000Z',value:'a'}],
  tombstones:[{collection:'customers',recordId:'cust-2',deletedAt:'2026-01-02T00:00:00.000Z'}]
};
assert.deepStrictEqual(
  reconciliation.applyTombstones(equalTombstoneDb),
  reconciliation.applyTombstones(JSON.parse(JSON.stringify(equalTombstoneDb)))
);

const older={id:'merge-1',updated:'2026-01-01T00:00:00.000Z',value:'old'};
const newer={id:'merge-1',updated:'2026-01-02T00:00:00.000Z',value:'new'};
assert.strictEqual(reconciliation.newerRecord(older,newer),newer);
assert.strictEqual(reconciliation.newerRecord(newer,older),newer);

const merged=reconciliation.mergeRecords(
  [{...older}],
  [{...newer},{id:'merge-2',updated:'2026-01-01T00:00:00.000Z'}]
);
assert.strictEqual(merged.length,2);
assert.strictEqual(merged.find(x=>x.id==='merge-1').value,'new');

console.log('PASS — Cloud Sync contract: reconciliation delegation, event triggers, migration boundary, and per-record writes');
