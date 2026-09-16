/* TAUR DETAILING — QC ENGINE v1.2 */

const TAUR_DETAIL_QC_ITEMS = [
  { id: "interior", label: "Interior inspected" },
  { id: "exterior", label: "Exterior inspected" },
  { id: "glass", label: "Glass inspected" },
  { id: "wheels", label: "Wheels / tires inspected" },
  { id: "stains", label: "Stains / spots addressed or documented" },
  { id: "concerns", label: "Customer-specific concerns addressed" },
  { id: "media", label: "Before / after documentation captured" },
  { id: "finalNotes", label: "Final condition notes recorded" }
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

function taurDetailQcMissing(job) {
  const qc = job?.qc || taurDetailQcDefault();
  return TAUR_DETAIL_QC_ITEMS.filter(x => qc.items?.[x.id] !== true).map(x => x.label);
}

function taurDetailQcComplete(qc) {
  return !!qc && TAUR_DETAIL_QC_ITEMS.every(x => qc.items?.[x.id] === true);
}

function taurDetailQcC4RequiresInspection(job) {
  return job?.type === "DETAILING" && String(job.condition || "").startsWith("C4");
}

function taurDetailQcCanVerify(job) {
  if (!job || job.type !== "DETAILING") return { ok: false, reason: "NOT A DETAILING JOB" };
  if (taurDetailQcC4RequiresInspection(job) && job.inspectionComplete !== true) {
    return { ok: false, reason: "C4 INSPECTION REQUIRED" };
  }
  const missing = taurDetailQcMissing(job);
  if (missing.length) return { ok: false, reason: "QC INCOMPLETE", missing };
  return { ok: true };
}

function taurDetailQcVerify(job, verifiedBy = "") {
  const check = taurDetailQcCanVerify(job);
  if (!check.ok) return check;
  const qc = job.qc || taurDetailQcDefault();
  qc.status = "VERIFIED";
  qc.verifiedAt = new Date().toISOString();
  qc.verifiedBy = verifiedBy;
  job.qc = qc;
  return { ok: true };
}

function taurDetailQcCanCompleteV2(job) {
  if (!job || job.type !== "DETAILING") return { ok: false, reason: "NOT A DETAILING JOB" };
  if (job.qc?.status !== "VERIFIED") return { ok: false, reason: "FINAL QC VERIFICATION REQUIRED" };
  return { ok: true };
}

function taurDetailQcMissingV2(job) {
  return taurDetailQcMissing(job);
}

// Integration contract:
// 1. Detail jobs receive job.qc on open/create.
// 2. QC items are updated in the Job File.
// 3. All items plus any required C4 inspection must pass before verification.
// 4. A DETAILING job cannot be moved to COMPLETE unless QC status is VERIFIED.
