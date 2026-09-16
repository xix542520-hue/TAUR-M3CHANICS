/* TAUR DETAILING — QC ENGINE v1.0
 * Shared-job compatible. No pricing logic.
 */

const TAUR_DETAIL_QC_ITEMS = [
  { id: "interior", label: "Interior inspected" },
  { id: "exterior", label: "Exterior inspected" },
  { id: "glass", label: "Glass inspected" },
  { id: "wheels", label: "Wheels / tires inspected" },
  { id: "stains", label: "Stains / spots addressed or documented" },
  { id: "concerns", label: "Customer-specific concerns addressed" },
  { id: "media", label: "Before / after documentation captured" }
];

function taurDetailQcDefault() {
  return {
    status: "NOT STARTED",
    items: Object.fromEntries(TAUR_DETAIL_QC_ITEMS.map(x => [x.id, false])),
    notes: "",
    verifiedAt: "",
    verifiedBy: ""
  };
}

function taurDetailQcComplete(qc) {
  if (!qc || qc.status !== "VERIFIED") return false;
  return TAUR_DETAIL_QC_ITEMS.every(x => qc.items?.[x.id] === true);
}

function taurDetailQcVerify(job, verifiedBy = "") {
  if (!job || job.type !== "DETAILING") return { ok: false, reason: "NOT A DETAILING JOB" };
  const qc = job.qc || taurDetailQcDefault();
  const missing = TAUR_DETAIL_QC_ITEMS.filter(x => qc.items?.[x.id] !== true).map(x => x.label);
  if (missing.length) return { ok: false, reason: "QC INCOMPLETE", missing };
  qc.status = "VERIFIED";
  qc.verifiedAt = new Date().toISOString();
  qc.verifiedBy = verifiedBy;
  job.qc = qc;
  return { ok: true };
}

function taurDetailQcC4RequiresInspection(job) {
  return job?.type === "DETAILING" && String(job.condition || "").startsWith("C4");
}

// Integration contract:
// job.qc = taurDetailQcDefault()
// Do not mark a detailing job COMPLETE from QC unless taurDetailQcVerify(job) returns ok:true.
