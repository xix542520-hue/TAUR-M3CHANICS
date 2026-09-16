# TAUR DETAILING — BUSINESS ARCHITECTURE v1.0

## Purpose
TAUR Detail is a mobile vehicle-detailing operating layer that shares the existing customer/vehicle/job system with TAUR M3CHANICS.

## Shared data model
CUSTOMER → VEHICLE → JOB → QUOTE → PAYMENT → HISTORY

A job has a `type`:
- `MECHANICS`
- `DETAILING`

The customer and vehicle records remain shared. A customer can have both mechanical and detailing history without duplicate records.

## Detail service families
### A — MAINTENANCE
Routine work intended to preserve an already-maintained vehicle.

### B — RESTORATION
Labor-intensive cleaning/correction for vehicles with meaningful buildup, staining, contamination, or neglected condition.

### C — SPECIALTY / ADD-ONS
Discrete additional operations selected after inspection.

## Condition classification
- `C1` — Maintenance: routine cleaning.
- `C2` — Moderate: noticeable buildup requiring extra labor.
- `C3` — Heavy: significant contamination/stains/buildup.
- `C4` — Extreme: inspection required before fixed quote.

Rule: CONDITION BEATS VEHICLE TYPE.

Condition classification determines labor requirement; vehicle type determines base capacity.

## Quote architecture
Final Quote = Base Service + Vehicle Size + Condition + Add-ons + Logistics (when justified by field data).

Do not lock arbitrary prices before production requirements are measured.

## Production definition
Every service must define:
1. Purpose
2. Applicable conditions
3. Included procedures
4. Exclusions
5. Required equipment
6. Required materials
7. Labor target
8. QC standard

## Detail workflow
ATTRACT → INTAKE → INSPECT → CLASSIFY → QUOTE → BOOK → DETAIL → VERIFY → COLLECT → RECORD → FOLLOW UP → REPEAT

## Quality rule
Inspect → classify → quote → execute → verify.

Do not promise what has not been inspected.
Do not quote work that has not been classified.
Do not call work complete without verification.

## Job economics
Track:
- customer
- vehicle
- service
- quoted price
- final price
- deposit
- amount collected
- labor hours
- travel time
- materials consumed
- problems encountered
- customer reaction

Metrics:
- revenue per labor hour
- gross profit per labor hour when variable costs are available
- contribution per job = revenue − variable job costs

## Lead source values
- `D2D`
- `CARD`
- `REFERRAL`
- `ONLINE`
- `EXISTING TAUR CUSTOMER`
- `OTHER`

## Retention
Job complete → before/after documentation → payment → follow-up → recommended maintenance interval → future booking.

Follow-up should have an explicit trigger/date, not an unspecified "later".

## Integration rule
Do not create a separate customer database for detailing. Extend the existing shared customer/vehicle/job architecture so TAUR can see the complete customer timeline.