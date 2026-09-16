# TAUR CORE ARCHITECTURE v1.0

## Principle
TAUR does not reinvent mature field-service/shop software patterns. Borrow the proven structure; customize only the TAUR-specific workflow.

## Reference patterns reviewed
- Jobber: Request → Quote → Job → Invoice → Payment; quote conversion; partial payments; mobile quote/invoice flow.
- Housecall Pro: job-centered field workflow; editable payments; payment history and operational actions from the job.
- AutoLeap: Quick Add → Customer + Vehicle → Services → Inspection → Estimate/Approval → Work Order.
- Shopmonkey: work-order-centered technician workflow with customer/vehicle, inspections, notes and services.
- DetailPro-style detailing software: shared customer/vehicle history, service records, reminders and detailing-specific workflows.

## TAUR adaptation
The shared business model is:

CUSTOMER → VEHICLE → JOB → QUOTE → PAYMENT → HISTORY

A job is the central operational record.

Job type is authoritative for division statistics:
- MECHANICS
- DETAILING

Customer routing is metadata only; it never duplicates customers or changes financial totals.

## Job File = command center
Every job should eventually be operable from one mobile Job File:
- customer
- vehicle
- service
- stage
- status
- quote
- payment history
- tips
- labor hours
- materials
- notes
- follow-up
- photos/media
- inspection/QC
- timer
- edit
- delete

## Money model
Quote value and collected cash are separate concepts.

For each payment:
- `amount` = total money received in the transaction
- `baseAmount` = amount applied to quoted work
- `tip` = gratuity tracked separately
- `method`
- timestamp

Quote balance = quote total − base amounts collected.

Collected = base amounts + tips.

A tip must never require increasing the quoted job price.

## Production model
Service templates / price-book items should supply:
- division
- service name
- default price
- description
- labor target
- material expectation
- optional add-ons

The user can override the template before saving the job.

## Proven workflow
MECHANIC:
INTAKE → DIAGNOSE → ESTIMATE → APPROVE → REPAIR → VERIFY → COMPLETE → COLLECT → FOLLOW UP

DETAIL:
INTAKE → INSPECT → CLASSIFY → QUOTE → BOOK → DETAIL → QC → COMPLETE → COLLECT → FOLLOW UP

## UX rule
Optimize for field speed:
- quick-create
- templates instead of repeated typing
- edit from the record being viewed
- destructive actions require confirmation
- preserve existing history
- never make the operator navigate through multiple screens for common field actions

## Data safety
- Never reset localStorage during feature work.
- Never duplicate customer or vehicle records to implement a new division.
- Never delete linked history automatically.
- Destructive deletes require confirmation and dependency checks.
- New modules should extend the current schema instead of replacing it.

## Build rule
Borrow mature patterns. Do not clone entire products.

TAUR's differentiation belongs in:
- mobile mechanic workflow
- mobile detailing workflow
- TAUR pricing/condition logic
- TAUR QC
- field efficiency/XIP
- combined customer/vehicle history
- future shared cloud data
