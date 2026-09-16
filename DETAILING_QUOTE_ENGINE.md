# TAUR DETAILING — QUOTE ENGINE v1.0

## Purpose
Turn an inspected detailing job into a repeatable quote without locking arbitrary prices before TAUR has enough field data.

## Quote Inputs

1. Service family
   - A — Maintenance
   - B — Restoration
   - C — Specialty / Add-ons

2. Vehicle size
   - Compact
   - Sedan / Coupe
   - SUV / Crossover
   - Truck / Large SUV
   - Van / Oversize

3. Condition
   - C1 — Maintenance
   - C2 — Moderate
   - C3 — Heavy
   - C4 — Extreme / Inspection Required

4. Add-ons
   - Selected individually
   - Each add-on must have a defined production procedure before pricing is attached

5. Labor requirement
   - Target labor hours
   - Actual labor hours recorded after completion

6. Materials
   - Estimated material cost
   - Actual material cost recorded after completion

7. Logistics
   - Travel time recorded
   - Distance/logistics pricing remains optional until field data justifies a rule

## Quote Formula

`BASE SERVICE + VEHICLE SIZE + CONDITION ADJUSTMENT + ADD-ONS + LOGISTICS (IF JUSTIFIED) = QUOTE`

The formula is structural. It does not prescribe dollar values.

## Condition Rule

**CONDITION BEATS VEHICLE TYPE.**

Condition classification determines labor requirement. Vehicle type determines base capacity.

A large clean vehicle is not automatically more labor-intensive than a small heavily contaminated vehicle.

## C4 Rule

C4 is not a normal fixed-price tier.

C4 requires inspection and scope definition before a fixed quote is issued.

## Production Definition Requirement

Before a service receives a permanent price, define:

- Purpose
- Applicable conditions
- Included procedures
- Exclusions
- Required equipment
- Required materials
- Labor target
- Quality-control standard

## Data Feedback Loop

Every completed detail should record:

- Quoted price
- Final price
- Labor hours
- Travel minutes
- Materials cost
- Problems encountered
- Customer reaction
- Rework required
- Follow-up date

Use completed jobs to calibrate future labor targets and pricing.

## Quote Status

- DRAFT
- INSPECTED
- SENT
- APPROVED
- DECLINED
- EXPIRED
- CONVERTED

## Quote Integrity Rules

- No quote before condition classification.
- No fixed C4 quote before inspection/scope definition.
- No hidden add-ons.
- Every quoted procedure must be traceable to the service definition.
- Final price may differ from initial quote only through a documented scope change or customer-approved addition.

## Next Implementation Layer

The app should expose this as a mobile-first quote worksheet inside a detailing job:

`INTAKE → INSPECT → CLASSIFY → BUILD QUOTE → CUSTOMER APPROVAL → BOOK → DETAIL → QC → COLLECT → FOLLOW UP`

The worksheet should calculate and display the quote structure while keeping the actual price values editable until TAUR's field data establishes stable pricing.
