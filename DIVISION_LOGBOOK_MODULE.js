/* TAUR M3CHANICS — DIVISION ROUTING / TOTAL LOGBOOK MODULE v1.0 */

/*
  DATA RULES
  - One master customer record.
  - A customer may route to MECHANICS, DETAILING, or BOTH.
  - Existing jobs retain their original division.
  - Job.type is the source of truth for division reporting.
  - The TOTAL LOGBOOK combines both divisions without duplicating jobs.
*/

const TAUR_DIVISIONS = ["MECHANICS", "DETAILING", "BOTH"];

function taurCustomerRouting(customer) {
  return customer?.logRouting || "MECHANICS";
}

function taurSetCustomerRouting(customer, routing) {
  if (!customer || !TAUR_DIVISIONS.includes(routing)) return false;
  customer.logRouting = routing;
  return true;
}

function taurJobsForDivision(db, division) {
  return (db?.jobs || []).filter(j => {
    const type = j.type || "MECHANICS";
    return division === "DETAILING" ? type === "DETAILING" : type === "MECHANICS";
  });
}

function taurJobRevenue(db, jobs) {
  return jobs.reduce((sum, job) => sum + Number(job.total || 0), 0);
}

function taurJobCollected(db, jobs) {
  const ids = new Set(jobs.map(j => j.id));
  return (db?.payments || []).filter(p => ids.has(p.jobId))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

function taurDivisionStats(db, division) {
  const jobs = taurJobsForDivision(db, division);
  const value = taurJobRevenue(db, jobs);
  const collected = taurJobCollected(db, jobs);
  return {
    division,
    jobs: jobs.length,
    activeJobs: jobs.filter(j => j.stage !== "COMPLETE" && j.status !== "CANCELLED").length,
    value,
    collected,
    outstanding: Math.max(0, value - collected)
  };
}

function taurTotalLogbookStats(db) {
  const mechanics = taurDivisionStats(db, "MECHANICS");
  const detailing = taurDivisionStats(db, "DETAILING");
  const jobs = [...taurJobsForDivision(db, "MECHANICS"), ...taurJobsForDivision(db, "DETAILING")];
  const value = mechanics.value + detailing.value;
  const collected = mechanics.collected + detailing.collected;
  return {
    customers: (db?.customers || []).length,
    vehicles: (db?.vehicles || []).length,
    jobs: jobs.length,
    activeJobs: mechanics.activeJobs + detailing.activeJobs,
    value,
    collected,
    outstanding: Math.max(0, value - collected),
    mechanics,
    detailing
  };
}

function taurMasterServiceTimeline(db) {
  return [...(db?.jobs || [])].sort((a, b) =>
    new Date(b.updated || b.created || 0) - new Date(a.updated || a.created || 0)
  );
}

/* Integration contract for index.html:
   CUSTOMER CREATE/EDIT -> save customer.logRouting.
   HOME -> show MECHANICS-only operating stats.
   DETAIL -> show DETAILING-only operating stats.
   LOGBOOK -> use taurTotalLogbookStats(db) and taurMasterServiceTimeline(db).
   Never copy a customer into a second division database.
*/