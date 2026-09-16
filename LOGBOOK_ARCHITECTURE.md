# TAUR LOGBOOK ARCHITECTURE v1.0

## Core decision

**HOME = TAUR M3CHANICS / MECHANICS.**

Detailing is a business division, not a separate customer universe.

Customers and vehicles remain shared records, while each customer can have service activity routed into one or both operational logs.

The system therefore has three views of the same underlying business data:

1. **MECHANICS LOG** — mechanical work
2. **DETAILING LOG** — detailing work
3. **TOTAL LOGBOOK** — combined business history and statistics

---

# 1. CUSTOMER LOG ROUTING

When creating or editing a customer, the app should expose:

**CUSTOMER LOG**

- MECHANICS
- DETAILING
- BOTH

This is a routing/preference field, not a duplicate customer record.

Recommended data field:

`customer.serviceLogs[]`

Allowed values:

`MECHANICS`, `DETAILING`

A customer may belong to both.

### Important rule

Selecting a log must **never create a second customer record**.

Example:

John Smith
- Mechanics log: YES
- Detailing log: YES

There is still exactly one John Smith record.

His jobs are classified independently:

- Brake diagnosis → `MECHANICS`
- Interior detail → `DETAILING`

Both appear in the Total Logbook.

---

# 2. NEW CUSTOMER UX

The customer creation screen should become:

- Name
- Phone
- Email
- **SERVICE LOG** selector
  - MECHANICS
  - DETAILING
  - BOTH
- Notes
- Save Customer

Default behavior may be `MECHANICS` for backward compatibility with existing mechanical customers, but the user must be able to change it.

---

# 3. CUSTOMER PROFILE

A customer profile should show:

**LOG ACCESS**

`MECHANICS` / `DETAILING` / `BOTH`

Then show service history grouped by division:

### MECHANICS HISTORY
Mechanical jobs only.

### DETAILING HISTORY
Detailing jobs only.

### TOTAL HISTORY
All jobs chronologically.

The profile remains one unified customer record.

---

# 4. HOME — MECHANICS

The existing `home` view remains the **MECHANICS** operating dashboard.

Its statistics should be mechanical-only where the metric is division-specific:

- Active mechanic jobs
- Mechanical job value
- Mechanical collected
- Mechanical outstanding
- Mechanical customers / relevant records
- Mechanical active work

A detailing job should not inflate a mechanics-only KPI.

---

# 5. DETAILING LOG

The existing `detail` view becomes the **DETAILING LOG**.

Detailing-only metrics:

- Active detail jobs
- Detail job value
- Detail collected
- Detail outstanding
- Detail jobs
- Detail queue

It uses the same customers and vehicles as Home.

---

# 6. TOTAL LOGBOOK

Add a dedicated **TOTAL LOGBOOK** view.

This is the combined business ledger.

It must combine both divisions without duplicating records.

### Combined KPI layer

- Total customers
- Total vehicles
- Total jobs
- Active jobs
- Total job value
- Total collected
- Total outstanding
- Mechanics job count
- Detailing job count
- Mechanics revenue/value
- Detailing revenue/value

### Combined history

Chronological list of all jobs:

`DATE → DIVISION → CUSTOMER → VEHICLE → SERVICE → STATUS → VALUE → PAID`

Division badge:

- `MECHANICS`
- `DETAILING`

---

# 7. LOGBOOK NAVIGATION

The app should expose the division choice clearly rather than hiding it inside the System menu.

Proposed top-level structure:

- **HOME** — Mechanics
- **DETAIL** — Detailing
- **LOGBOOK** — Combined
- **CUSTOMERS** — Shared
- **VEHICLES** — Shared
- **SYSTEM** — Administration

If screen width requires fewer bottom-nav buttons, Logbook can live in a top-level command card on Home/Detail, but it must remain one-tap accessible.

---

# 8. CUSTOMER → JOB ROUTING

Creating a job should determine its division explicitly.

### Mechanical job

`type = MECHANICS`

### Detailing job

`type = DETAILING`

The customer selected for the job should automatically become associated with that division if not already associated.

Example:

Customer currently has:

`serviceLogs = [MECHANICS]`

User creates a detailing job.

System may update to:

`serviceLogs = [MECHANICS, DETAILING]`

This prevents the routing selector from becoming stale.

---

# 9. DATA MODEL

Current shared architecture remains:

`CUSTOMER → VEHICLE → JOB → QUOTE → PAYMENT → HISTORY`

Add only the routing metadata necessary for division visibility:

```text
customer
├── id
├── name
├── phone
├── email
├── serviceLogs[]
├── notes
└── created
```

Jobs already have:

`job.type = MECHANICS | DETAILING`

That job-level type remains authoritative for financial and operational statistics.

Customer `serviceLogs` is an access/routing aid; it is not the source of truth for revenue.

---

# 10. STATISTICS RULE

**JOB TYPE IS THE SOURCE OF TRUTH FOR DIVISION STATS.**

Do not calculate mechanical/detailing revenue from customer routing.

Calculate from jobs:

`job.type === "MECHANICS"`

or

`job.type === "DETAILING"`

This prevents a customer marked `BOTH` from causing duplicate revenue or job counts.

---

# 11. TOTAL LOGBOOK FINANCIAL RULE

Combined totals are calculated exactly once from the shared job/payment records.

For each job:

- Value = job total
- Collected = payments linked to that job
- Outstanding = max(0, value − collected)

Then aggregate all jobs.

No division gets its own duplicate payment ledger.

---

# 12. MIGRATION RULE

Existing customer records may not have `serviceLogs`.

On load:

- Existing customers with mechanical jobs → add `MECHANICS`
- Existing customers with detailing jobs → add `DETAILING`
- Existing customers with both → add both
- Existing customers with no jobs → preserve backward-compatible default until selected

Existing jobs remain unchanged.

No historical job should be duplicated during migration.

---

# 13. UX PRINCIPLE

The user should never have to wonder:

> "Which customer database am I putting this person into?"

There is **one customer database**.

The UI answers:

> "Which service log does this customer use?"

And the system answers:

> "Which division does this job belong to?"

Then the Total Logbook answers:

> "What has the entire TAUR business done?"

---

# 14. NEXT IMPLEMENTATION

Implement in this order:

1. Add `customer.serviceLogs[]` normalization.
2. Add service-log selector to New Customer.
3. Add service-log selector to Edit Customer.
4. Add division sections to Customer Profile.
5. Keep Home as Mechanics.
6. Keep Detail as Detailing.
7. Add **LOGBOOK** view.
8. Add combined KPI calculations from shared jobs/payments.
9. Add chronological combined job ledger.
10. Add logbook navigation.
11. Run system audit against old V4/V5/local data.

**One database. Two operational logs. One total logbook.**
