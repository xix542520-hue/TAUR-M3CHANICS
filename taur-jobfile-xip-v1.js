/* TAUR XIP JOB FILE V1 — DEPRECATED COMPATIBILITY SHIM
   The live app uses taur-jobfile-xip-v2.js.
   V1 intentionally contains no direct entity mutations or payment writes.
   If an external/legacy page still loads this file, delegate to the V2 job-file
   opener when available rather than reviving the legacy mutation path.
*/
(()=>{
 const open=id=>{
   if(typeof window.taurXipOpenJobFile==='function' && window.taurXipOpenJobFile!==open){
     return window.taurXipOpenJobFile(id);
   }
   alert('The legacy XIP Job File is deprecated. Load taur-jobfile-xip-v2.js.');
   return null;
 };
 window.taurXipOpenJobFile=open;
})();
