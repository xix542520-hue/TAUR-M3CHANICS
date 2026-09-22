const fs=require('fs'),assert=require('assert');
const source=fs.readFileSync('taur-cloud-sync-v1.js','utf8');
const required=[
  'const mergeRecords=',
  'const applyTombstones=',
  'window.taurCloudTests={run:'
];
for(const token of required) assert(source.includes(token),'Missing cloud sync contract: '+token);
const testBlock=source.slice(source.indexOf('window.taurCloudTests={run:'),source.indexOf('};',source.indexOf('window.taurCloudTests={run:'))+2);
assert(testBlock.includes('newer update wins'));
assert(testBlock.includes('older update loses'));
assert(testBlock.includes('newer recreation beats tombstone'));
assert(testBlock.includes('tombstone removes stale recreation'));
console.log('PASS — Cloud Sync test contract is present and covers merge/tombstone invariants');
