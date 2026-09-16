# TAUR JOB FILE V2

The live Job File now provides a single operational surface for each job.

## Controls
- Stage
- Status
- Total
- Manual labor hours
- Materials
- Complaint / notes
- Follow-up date
- Record payment
- Persistent labor timer

## Timer rule
Timer time is stored separately from `laborHours`. Starting/stopping the timer never overwrites manually entered labor hours. This preserves existing labor accounting while giving TAUR a field-time measurement that can be used for later efficiency features.

## Data safety
The module uses the existing localStorage database and existing job/customer/vehicle/payment records. It does not migrate, delete, or reset customer data.
