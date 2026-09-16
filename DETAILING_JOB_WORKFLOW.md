# TAUR DETAILING — JOB WORKFLOW v1.0

## Purpose
Operational contract for turning a detailing lead into a completed, documented, collectible job.

## State Machine

LEAD
→ INTAKE
→ INSPECT
→ CLASSIFY
→ QUOTE
→ APPROVED
→ BOOKED
→ DETAILING
→ QC
→ COMPLETE
→ FOLLOW-UP

A job may be returned to an earlier state when inspection changes scope.

## Intake
Required:
- Customer
- Vehicle
- Customer concern / requested service
- Lead source

## Inspection
Record:
- Condition class C1–C4
- Vehicle size
- Visible problems
- Customer-specific concerns
- Scope notes

C4 requires inspection before a fixed quote.

## Quote
Quote is built from:
- Service family
- Base service
- Vehicle size
- Condition
- Add-ons
- Logistics when justified

Do not invent a fixed price merely because a vehicle is large or small.

## Approval
Record:
- Quoted amount
- Approval status
- Approval method
- Approval timestamp
- Customer notes

## Booking
Record the scheduled appointment/date before treating the job as booked.

## Detail Execution
Track:
- Labor hours
- Travel minutes
- Materials cost
- Problems encountered
- Scope changes

## QC Gate
Required before completion:
- Interior inspected
- Exterior inspected
- Glass inspected
- Wheels / tires inspected
- Stains / spots addressed or documented
- Customer-specific concerns addressed
- Before / after documentation captured
- Final condition notes recorded

C4 jobs additionally require `inspectionComplete = true`.

## Completion
Only after QC verification:
- Set job complete
- Record final price
- Record payment(s)
- Calculate balance
- Store final notes

## Follow-Up
Every completed detail should have an explicit follow-up date or a documented reason why none was scheduled.

## Shared-System Rule
Detailing uses the existing TAUR customer, vehicle, job, quote, payment, and history records. No parallel CRM is permitted.
