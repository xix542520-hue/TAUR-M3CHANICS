# TAUR LOGBOOK ARCHITECTURE v2.0

## Core decision

**HOME = the combined TAUR LOGBOOK / business dashboard.**

Detailing is a business division, not a separate customer universe.

Customers and vehicles remain shared records, while each customer can have service activity routed into one or both operational logs.

The live user-facing structure is:

**HOME → JOBS → MECHANIC → DETAIL → CUSTOMERS → VEHICLES → SYSTEM**

The underlying business data remains shared:

`CUSTOMER → VEHICLE → JOB → SERVICE → PAYMENT → HISTORY`

---

# 1. TOP-LEVEL NAVIGATION

### HOME
Combined business dashboard and total logbook.

Shows:
- Active jobs
- Total jobs
- Customers
- Collected money
- Mechanic job count
- Detail job count
- Total job value
- Outstanding balance
- Active logbook
- Recent job history

### JOBS
All jobs in one searchable operational list.

### MECHANIC
Mechanical jobs only.

### DETAIL
Detailing jobs only.

### CUSTOMERS
One shared customer database.

### VEHICLES
One shared vehicle database.

### SYSTEM
Administration, settings, tools, data controls, and business utilities.

**Important:** Do not create a separate customer database for mechanics and detailing.

---

# 2. CUSTOMER LOG ROUTING

When creating or editing a customer, expose:

**SERVICE LOG**

- MECHANICS
- DETAILING
- BOTH

This is routing/preference metadata, not a duplicate customer record.

A customer marked BOTH still exists exactly once.

Example:

John Smith
- Mechanics: YES
- Detailing: YES

His jobs remain independently classified:

- Brake diagnosis → `MECHANICS`
- Interior detail → `DETAILING`

Both appear in HOME's combined logbook.

---

# 3. CUSTOMER → JOB RULE

Customer routing controls **visibility/access**.

Job type controls **operational classification and statistics**.

### Mechanical job
`type = MECHANICS`

### Detailing job
`type = DETAILING`

Existing jobs are never moved or duplicated when customer routing changes.

---

# 4. CUSTOMER PROFILE

A customer profile remains unified and should expose service history by division:

### MECHANIC HISTORY
Mechanical jobs only.

### DETAIL HISTORY
Detailing jobs only.

### TOTAL HISTORY
All jobs chronologically.

The profile is one customer record with multiple service histories.

---

# 5. MECHANIC VIEW

The dedicated **MECHANIC** view contains mechanical jobs only.

Division-specific metrics may include:

- Active mechanic jobs
- Total mechanic jobs
- Mechanical collected
- Mechanical outstanding
- Mechanical job value
- Mechanical work queue

A detailing job must not inflate mechanic-only KPIs.

---

# 6. DETAIL VIEW

The dedicated **DETAIL** view contains detailing jobs only.

Detail-specific operations include the detailing workflow and final QC verification.

Detail jobs use:

- Service family
- Condition classification C1–C4
- Vehicle size
- Add-ons
- Quote/job total
- Labor information
- Detail QC checklist
- Final QC verification

A detailing job cannot be completed until final QC is verified.

---

# 7. HOME — TOTAL LOGBOOK

HOME is the combined business dashboard and logbook.

It aggregates shared records exactly once.

### Combined KPI layer

- Active jobs
- Total jobs
- Total customers
- Total collected
- Total job value
- Total outstanding
- Mechanics job count
- Detailing job count

### Combined history

All jobs appear in one chronological operational history.

Each job identifies its division with a badge:

- `MECHANIC`
- `DETAILING`

The stored compatibility value may remain `MECHANICS`; the user-facing label is **MECHANIC**.

---

# 8. FINANCIAL RULE

**JOB TYPE IS THE SOURCE OF TRUTH FOR DIVISION STATISTICS.**

Never calculate revenue or job counts from customer routing.

For each job:

- Value = `job.total`
- Collected = payments linked to that job
- Outstanding = `max(0, value − collected)`

Aggregate from the shared job/payment records.

There is no separate mechanic payment ledger and no separate detailing payment ledger.

---

# 9. DETAILING QUALITY GATE

Detailing completion follows:

`INSPECT → CLASSIFY → QUOTE → EXECUTE → VERIFY → COMPLETE`

The QC engine requires all defined checklist items to pass before final verification.

Current checklist categories include:

- Interior inspected
- Exterior inspected
- Glass inspected
- Wheels / tires inspected
- Stains / spots addressed or documented
- Customer-specific concerns addressed
- Before / after documentation captured
- Final condition notes recorded

C4 jobs additionally require inspection handling before verification.

Completion must be gated consistently across every edit/status path.

---

# 10. DATA MODEL

Shared architecture:

`CUSTOMER → VEHICLE → JOB → QUOTE → PAYMENT → HISTORY`

Customer routing metadata is auxiliary:

```text
customer
├── id
├── name
├── phone
├── email
├── logRouting
├── notes
└── created
```

Jobs remain authoritative for division:

`job.type = MECHANICS | DETAILING`

No division-specific customer database is permitted.

---

# 11. MIGRATION RULE

Existing customers may not contain routing metadata.

On load, preserve existing records and use backward-compatible defaults.

Existing jobs remain unchanged.

No historical job, customer, vehicle, or payment should be duplicated during migration.

---

# 12. CLOUD / DEVICE RULE

Local storage acts as the device cache.

The shared cloud workspace synchronizes the shared business collections:

- customers
- vehicles
- jobs
- quotes
- payments
- parts
- pricing
- tools
- research
- settings

The architecture remains intentionally simple: one shared workspace and one shared record model rather than separate division databases.

---

# 13. MONEY LOG RULE

TAUR maintains two distinct reinvestment logs:

### BUSINESS REVENUE → BUSINESS
Money generated by recorded TAUR jobs and reinvested into:

- Supplies
- Equipment
- Gas
- Other

The entry retains a source-job reference for traceability.

### OUTSIDE MONEY → BUSINESS
Money originating outside TAUR business revenue and invested into the business.

Outside money must remain separate from business-generated reinvestment.

---

# 14. UX PRINCIPLE

The user should never have to wonder which customer database to use.

There is **one customer database**.

The UI answers:

> Which service log does this customer use?

The job answers:

> Which division does this work belong to?

HOME answers:

> What has the entire TAUR business done?

---

# 15. CURRENT IMPLEMENTATION STATUS

The live navigation is:

**HOME → JOBS → MECHANIC → DETAIL → CUSTOMERS → VEHICLES → SYSTEM**

HOME is the combined logbook/dashboard.

MECHANIC is the mechanical operating view.

DETAIL is the detailing operating view.

CUSTOMERS and VEHICLES are shared.

Detailing QC is integrated into the Job File and completion paths.

Central module wiring maintains the shared TAUR scripts in `index.html` without competing auto-injector workflows.

**One database. Two operational divisions. One total logbook.**
