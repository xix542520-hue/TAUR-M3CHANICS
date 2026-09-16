TAUR JOB FILE V2 INTEGRATION

- Persistent timer is stored on each job as timer.running, timer.startedAt, timer.elapsedSeconds.
- Manual laborHours remains independent.
- Existing jobFile calls are redirected to the XIP Job File when the module loads.
- Existing customer, vehicle, job, quote, payment, and localStorage structures remain unchanged.
