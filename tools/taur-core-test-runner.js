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
const payJob=sandbox.window.TAUR.jobs.create({customerId:customer.id,title:'Payment Test',type:'MECHANICS',total:100});
assert(payJob,'Payment test job should exist');
const pay=sandbox.window.TAUR.payments.create({jobId:payJob.id,baseAmount:80,tip:20});
assert(pay,'Payment should be accepted');
assert(sandbox.window.TAUR.payments.baseForJob(payJob.id)===80,'Balance excludes tip');
assert(sandbox.window.TAUR.payments.tipsForJob(payJob.id)===20,'Tip is tracked separately');
assert(sandbox.window.TAUR.jobs.balance(payJob.id)===20,'Job balance reflects unpaid base amount');
const tipOnly=sandbox.window.TAUR.payments.create({jobId:payJob.id,baseAmount:20,tip:0});
assert(tipOnly,'Second base payment should be accepted');
assert(sandbox.window.TAUR.jobs.balance(payJob.id)===0,'Job becomes paid at base total');
const extra=sandbox.window.TAUR.payments.create({jobId:payJob.id,baseAmount:25,tip:5});
assert(extra,'Overpayment record should still be accepted as historical payment');
assert(sandbox.window.TAUR.jobs.balance(payJob.id)===0,'Overpayment cannot produce negative balance');
assert(sandbox.window.TAUR.payments.collectedForJob(payJob.id)===130,'Collected total includes tips');
assert(sandbox.window.TAUR.jobs.remove(payJob.id)===null,'Job deletion is blocked by payment history');
const quoteCustomer=sandbox.window.TAUR.customers.create({name:'__QUOTE_INTEGRATION__'});
const quote=sandbox.window.TAUR.quotes.create({customerId:quoteCustomer.id,status:'APPROVED',total:175});
assert(quote,'Quote should be created');
const quoteJob=sandbox.window.TAUR.jobs.create({customerId:quoteCustomer.id,title:'Quoted Service',type:'DETAILING',total:quote.total,quoteId:quote.id});
assert(quoteJob,'Quote-backed job should be created');
const linkedQuote=sandbox.window.TAUR.quotes.update(quote.id,{jobId:quoteJob.id,status:'ACCEPTED'});
assert(linkedQuote,'Quote should link to its job');
assert(sandbox.window.TAUR.quotes.get(quote.id).jobId===quoteJob.id,'Quote must reference the created job');
assert(Number(sandbox.window.TAUR.jobs.get(quoteJob.id).total)===Number(sandbox.window.TAUR.quotes.get(quote.id).total),'Job total must match accepted quote total');
const quotePayment=sandbox.window.TAUR.payments.create({jobId:quoteJob.id,baseAmount:175,tip:25});
assert(quotePayment,'Quote-backed job payment should be accepted');
assert(sandbox.window.TAUR.jobs.balance(quoteJob.id)===0,'Accepted quote should be fully collectible against job base total');
assert(sandbox.window.TAUR.payments.tipsForJob(quoteJob.id)===25,'Quote-backed payment tip remains separate from quote/job balance');
const relA=sandbox.window.TAUR.customers.create({name:'__REL_A__'});
const relB=sandbox.window.TAUR.customers.create({name:'__REL_B__'});
const relVehicle=sandbox.window.TAUR.vehicles.create({customerId:relA.id,year:2006,make:'Honda',model:'Accord'});
assert(relVehicle,'Vehicle should attach to its customer');
const relJob=sandbox.window.TAUR.jobs.create({customerId:relA.id,vehicleId:relVehicle.id,title:'Relationship Test',type:'MECHANICS',total:40});
assert(relJob,'Job should accept matching customer and vehicle');
const mismatchVehicle=sandbox.window.TAUR.vehicles.create({customerId:relB.id,year:2010,make:'Ford',model:'Fusion'});
assert(mismatchVehicle,'Second customer vehicle should exist');
assert(sandbox.window.TAUR.jobs.create({customerId:relA.id,vehicleId:mismatchVehicle.id,title:'Bad Vehicle Link',type:'MECHANICS',total:40})===null,'Job must reject vehicle belonging to another customer');
assert(sandbox.window.TAUR.vehicles.update(relVehicle.id,{customerId:relB.id})===null,'Vehicle reassignment must reject linked cross-customer relationship');
assert(sandbox.window.TAUR.customers.remove(relA.id)===null,'Customer deletion must be blocked by linked vehicle/job history');
assert(sandbox.window.TAUR.vehicles.remove(relVehicle.id)===null,'Vehicle deletion must be blocked by linked job history');
console.log('PASS — Data Core self-tests:',result.results.length);
