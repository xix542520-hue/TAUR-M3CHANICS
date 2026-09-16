# TAUR DETAILING — QUOTE SCHEMA v1.0

## Quote Object
A detailing quote should preserve exactly how the amount was constructed.

```text
quote
├── id
├── jobId
├── customerId
├── vehicleId
├── status
├── createdAt
├── approvedAt
├── baseService
├── serviceFamily
├── vehicleSize
├── condition
├── addOns[]
├── logistics
├── subtotal
├── adjustments[]
├── total
├── notes
└── version
```

## Line-Item Principle
Every monetary component should be traceable to a reason:

BASE SERVICE
+ SIZE ADJUSTMENT
+ CONDITION ADJUSTMENT
+ ADD-ONS
+ JUSTIFIED LOGISTICS
+/- DOCUMENTED ADJUSTMENTS
= TOTAL

## No Hidden Pricing
The quote must never silently change because of an undocumented condition or add-on.

If inspection changes the scope, update the quote and record the reason.

## C4 Rule
A C4 condition may create an inspection-only quote state. A fixed total should not be treated as final until scope has been established.

## Versioning
When a quote changes after customer approval, create a new quote version or preserve the prior quote as a superseded record. Do not overwrite the historical approval amount.

## Approval
Store:
- approval status
- approval method
- approval timestamp
- approved total

## Analytics Inputs
Quote records should make it possible to compare:
- quoted vs final revenue
- quoted labor expectation vs actual labor
- add-on frequency
- condition distribution
- vehicle-size distribution
- logistics/travel burden

This data is intended to inform later pricing decisions rather than assume them now.
