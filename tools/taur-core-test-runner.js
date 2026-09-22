const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('taur-data-core-v1.js','utf8');
let saves=0;
const sandbox={
  window:{},
  console,
  Math,
  Date,
  JSON,
  setTimeout,
  clearTimeout,
  db:{customers:[],vehicles:[],jobs:[],quotes:[],payments:[],parts:[],pricing:[],tools:[],research:[],settings:{business:'TAUR M3CHANICS'},leads:[],estimates:[],partners:[],referrals:[],tombstones:[]},
  uid:(()=>{let n=0;return()=>`test-${++n}`})(),
  save:()=>{saves++}
};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'taur-data-core-v1.js'});
const result=sandbox.window.TAUR.tests.run();
if(!result.ok) throw new Error('Data Core self-test failed: '+(result.error||JSON.stringify(result.results)));
assert(result.results.every(x=>x.pass),'Data Core reported a failed assertion');
const customer=sandbox.window.TAUR.customers.create({name:'__INTEGRATION_CUSTOMER__'});
const lead=sandbox.window.TAUR.leads.create({name:'__INTEGRATION_LEAD__',service:'Detail',amount:150});
const conversion=sandbox.window.TAUR.transaction(()=>{
  const job=sandbox.window.TAUR.jobs.create({customerId:customer.id,title:'Detail',type:'DETAILING',total:150});
  if(!job) return false;
  return !!sandbox.window.TAUR.leads.update(lead.id,{status:'WON',customerId:customer.id,jobId:job.id});
});
assert(conversion,'Growth-to-job transaction should commit');
assert(sandbox.window.TAUR.leads.get(lead.id).status==='WON','Lead should be marked WON');
assert(sandbox.window.TAUR.jobs.list().some(j=>j.customerId===customer.id&&j.total===150),'Converted job should exist');
const badLead=sandbox.window.TAUR.leads.create({name:'__INTEGRATION_BAD__'});
const beforeJobs=sandbox.window.TAUR.jobs.list().length;
const rejected=sandbox.window.TAUR.transaction(()=>{
  const job=sandbox.window.TAUR.jobs.create({customerId:customer.id,title:'Rejected',type:'DETAILING',total:200});
  if(!job) return false;
  return !!sandbox.window.TAUR.leads.update('__missing_lead__',{status:'WON',jobId:job.id});
});
assert(rejected===null,'Rejected conversion should roll back');
assert(sandbox.window.TAUR.jobs.list().length===beforeJobs,'Rejected conversion must not leave an orphan job');
assert(sandbox.window.TAUR.leads.get(badLead.id).status===undefined,'Rejected conversion must not mutate source lead');
console.log('PASS — Data Core self-tests:',result.results.length);
