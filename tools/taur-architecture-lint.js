#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXCLUDE = new Set(['node_modules','.git']);
const FILE_EXT = new Set(['.js','.html']);
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
    for(const m of text.matchAll(rule.re)){
      const before=text.slice(0,m.index);
      const line=before.split('\n').length;
      const lineText=text.split('\n')[line-1]?.trim()||'';
      violations.push({file:path.relative(ROOT,file),line,rule:rule.name,source:lineText});
    }
  }
}

console.log('TAUR ARCHITECTURE LINT');
console.log('Files scanned:',files.length);
if(!violations.length){ console.log('PASS — no direct canonical collection mutations found.'); process.exit(0); }
console.log('FAIL — direct canonical mutation seams found:',violations.length);
for(const v of violations) console.log(`- ${v.file}:${v.line} [${v.rule}] ${v.source}`);
console.log('\nRoute runtime writes through TAUR Data Core. Compatibility/migration exceptions must be isolated and documented.');
process.exit(1);
