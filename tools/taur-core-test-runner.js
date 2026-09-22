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
console.log('PASS — Data Core self-tests:',result.results.length);
