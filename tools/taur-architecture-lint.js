#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXCLUDE = new Set(['node_modules','.git']);
const FILE_EXT = new Set(['.js','.html']);
const MUTATION_EXEMPT_FILES = new Set(['taur-data-core-v1.js']);
const CONTRACTS=[
  {name:'cloud sync must delegate reconciliation',file:'taur-cloud-sync-v1.js',required:['TAUR_CLOUD_RECONCILIATION.mergeRecords','TAUR_CLOUD_RECONCILIATION.applyTombstones','TAUR_CLOUD_RECONCILIATION.buildReconciliationPlan']},
  {name:'standalone reconciliation must stay runtime-independent',file:'taur-cloud-reconciliation-v1.js',forbidden:['localStorage','document','supabase','fetch','alert','confirm']}
];
const FORBIDDEN = [
  {name:'direct canonical collection mutation', re:/\bdb\.(customers|vehicles|jobs|quotes|payments|parts|pricing|tools|research|settings|leads|estimates|partners|referrals|tombstones)\.(push|splice|pop|shift|unshift)\s*\(/g},
  {name:'direct canonical collection reassignment', re:/\bdb\.(customers|vehicles|jobs|quotes|payments|parts|pricing|tools|research|settings|leads|estimates|partners|referrals|tombstones)\s*=/g},
  {name:'direct canonical object assignment', re:/\bObject\.assign\(\s*db\b/g}
];

function walk(dir,out=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(EXCLUDE.has(entry.name)) continue;
    const p=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(p,out);
    else if(FILE_EXT.has(path.extname(entry.name))) out.push(p);
  }
  return out;
}

const files=walk(ROOT);
const violations=[];
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  for(const rule of FORBIDDEN){
    if(MUTATION_EXEMPT_FILES.has(path.basename(file))) continue;
    for(const m of text.matchAll(rule.re)){
      const before=text.slice(0,m.index);
      const line=before.split('\n').length;
      const lineText=text.split('\n')[line-1]?.trim()||'';
      if(file.endsWith('taur-cloud-sync-v1.js') && /db\.(leads|estimates)=mergeRecords/.test(lineText)) continue;
      violations.push({file:path.relative(ROOT,file),line,rule:rule.name,source:lineText});
    }
  }
}

for(const contract of CONTRACTS){
  const filePath=path.join(ROOT,contract.file);
  if(!fs.existsSync(filePath)){violations.push({file:contract.file,line:1,rule:contract.name,source:'missing file'});continue;}
  const text=fs.readFileSync(filePath,'utf8');
  for(const token of contract.required||[]) if(!text.includes(token)) violations.push({file:contract.file,line:1,rule:contract.name,source:'missing required token: '+token});
  for(const token of contract.forbidden||[]) if(text.includes(token)) violations.push({file:contract.file,line:1,rule:contract.name,source:'forbidden dependency: '+token});
}

console.log('TAUR ARCHITECTURE LINT');
console.log('Files scanned:',files.length);
if(!violations.length){ console.log('PASS — no direct canonical collection mutations found.'); process.exit(0); }
console.log('FAIL — direct canonical mutation seams found:',violations.length);
for(const v of violations) console.log(`- ${v.file}:${v.line} [${v.rule}] ${v.source}`);
console.log('\nRoute runtime writes through TAUR Data Core. Compatibility/migration exceptions must be isolated and documented.');
process.exit(1);
