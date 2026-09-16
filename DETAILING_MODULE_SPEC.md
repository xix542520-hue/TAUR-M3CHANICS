# TAUR DETAILING — MODULE SPEC v1.0

## Purpose
Define the first modular boundary for TAUR DETAILING without separating customer, vehicle, job, payment, or service-history records from TAUR M3CHANICS.

## Shared Core
CUSTOMER → VEHICLE → JOB → QUOTE → PAYMENT → HISTORY

Every detailing job remains a normal TAUR job with `type = DETAILING`.

## Detail Module
The detail module owns the detailing-specific operational fields:
- serviceFamily
- condition
- vehicleSize
- addOns
- leadSource
- laborHours
- travelMinutes
- materialsCost
- followUpDate
- inspection notes
- QC status

## Detail Job Flow
ATTRACT → INTAKE → INSPECT → CLASSIFY → QUOTE → BOOK → DETAIL → VERIFY → COLLECT → RECORD → FOLLOW UP → REPEAT

## Quote Construction
No arbitrary fixed prices are embedded by this module.

Quote inputs:
1. Service family
2. Vehicle size
3. Condition class
4. Selected add-ons
5. Logistics when justified by field data
6. Actual labor/material requirements

Formula:
BASE SERVICE + SIZE + CONDITION + ADD-ONS + JUSTIFIED LOGISTICS = QUOTE

## Condition Rules
- C1 — Maintenance: routine labor.
- C2 — Moderate: additional labor required.
- C3 — Heavy: significant contamination/stains/buildup.
- C4 — Extreme: inspection required before fixed quote.

CONDITION CLASSIFICATION DETERMINES LABOR REQUIREMENT.
VEHICLE TYPE DETERMINES BASE CAPACITY.

## QC
A detail cannot be marked verified until the operator records the inspection result.

QC should eventually track:
- Interior inspected
- Exterior inspected
- Glass inspected
- Wheels/tires inspected
- Stains/spots addressed or documented
- Customer-specific concerns addressed
- Final condition notes
- Before/after media references

## Data Collection
The module should capture actual job economics without forcing a price policy:
- quoted price
- final price
- labor hours
- travel minutes
- material cost
- problems encountered
- customer reaction
- follow-up date

This creates the field dataset required to build evidence-based pricing later.

## Modularization Rule
Do not create a second customer database for detailing.
Do not duplicate vehicles.
Do not create an independent payment ledger.
Do not break mechanic service history.

The module is an operational layer over the shared TAUR core.
