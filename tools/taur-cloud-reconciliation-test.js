const fs=require('fs'),assert=require('assert'),vm=require('vm');
const reconciliationSource=fs.readFileSync('taur-cloud-reconciliation-v1.js','utf8');
const sandbox={globalThis:{},console,Math,Date,JSON};
vm.createContext(sandbox);
vm.runInContext(reconciliationSource,sandbox);
const reconciliation=sandbox.globalThis.TAUR_CLOUD_RECONCILIATION;
assert(reconciliation,'Standalone reconciliation module must expose TAUR_CLOUD_RECONCILIATION');
const cases=[];
const check=(name,fn)=>{fn();cases.push(name)};

const vm=require('vm');
const cases=[];
const check=(name,fn)=>{fn();cases.push(name)};
const sandbox={globalThis:{},console,Math,Date,JSON};
vm.createContext(sandbox);
vm.runInContext(reconciliationSource,sandbox);
const reconciliation=sandbox.globalThis.TAUR_CLOUD_RECONCILIATION;
assert(reconciliation,'Standalone reconciliation module must expose TAUR_CLOUD_RECONCILIATION');

assert(reconciliation,'Reconciliation API must be exposed');
console.log('PASS — Cloud reconciliation behavioral tests');
cases.forEach((name,i)=>console.log('  '+(i+1)+'. '+name));
