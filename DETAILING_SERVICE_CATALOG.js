/* TAUR DETAILING — SERVICE CATALOG DATA v1.0 */

const TAUR_DETAIL_SERVICE_CATALOG = [
  {
    id: "A1",
    family: "A — MAINTENANCE",
    name: "Maintenance Interior",
    purpose: "Routine interior cleaning and preservation.",
    conditions: ["C1 — MAINTENANCE", "C2 — MODERATE"],
    c4RequiresInspection: true,
    included: [
      "Interior inspection",
      "Loose-debris removal",
      "Accessible-surface cleaning",
      "Common touch-point cleaning",
      "Vacuum accessible carpet, seats, mats, and floors",
      "Interior glass cleaning",
      "Final interior inspection"
    ],
    exclusions: [
      "Severe stain restoration",
      "Heavy pet-hair removal",
      "Biohazard cleanup",
      "Mold remediation",
      "Deep extraction unless separately approved",
      "Material repair"
    ],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["interior", "glass", "concerns", "media", "finalNotes"]
  },
  {
    id: "A2",
    family: "A — MAINTENANCE",
    name: "Maintenance Exterior",
    purpose: "Routine exterior cleaning and preservation.",
    conditions: ["C1 — MAINTENANCE", "C2 — MODERATE"],
    c4RequiresInspection: true,
    included: [
      "Exterior condition inspection",
      "Approved exterior wash process",
      "Wheel and tire cleaning within scope",
      "Exterior glass cleaning",
      "Drying",
      "Final exterior inspection"
    ],
    exclusions: [
      "Paint correction",
      "Paint repair",
      "Heavy oxidation restoration",
      "Deep bonded-contaminant restoration unless separately approved"
    ],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["exterior", "glass", "wheels", "concerns", "media", "finalNotes"]
  },
  {
    id: "A3",
    family: "A — MAINTENANCE",
    name: "Maintenance Full",
    purpose: "Combined routine interior and exterior maintenance.",
    conditions: ["C1 — MAINTENANCE", "C2 — MODERATE"],
    c4RequiresInspection: true,
    included: ["A1 Maintenance Interior scope", "A2 Maintenance Exterior scope"],
    exclusions: ["All A1/A2 exclusions unless separately approved"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["interior", "exterior", "glass", "wheels", "concerns", "media", "finalNotes"]
  },
  {
    id: "B1",
    family: "B — RESTORATION",
    name: "Interior Restoration",
    purpose: "Address interior contamination requiring materially more labor than routine maintenance.",
    conditions: ["C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Inspection", "Approved restoration procedures", "Final condition verification"],
    exclusions: ["Material repair/replacement", "Unapproved restoration", "Hazardous remediation outside approved scope"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["interior", "stains", "concerns", "media", "finalNotes"]
  },
  {
    id: "B2",
    family: "B — RESTORATION",
    name: "Exterior Restoration",
    purpose: "Address exterior contamination requiring additional labor beyond maintenance.",
    conditions: ["C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Inspection", "Approved restoration procedures", "Final condition verification"],
    exclusions: ["Body repair", "Paint repair", "Unapproved correction work"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["exterior", "wheels", "concerns", "media", "finalNotes"]
  },
  {
    id: "B3",
    family: "B — RESTORATION",
    name: "Full Restoration",
    purpose: "Combined interior and exterior restoration.",
    conditions: ["C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Approved B1 scope", "Approved B2 scope"],
    exclusions: ["Anything outside approved restoration scope"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["interior", "exterior", "glass", "wheels", "stains", "concerns", "media", "finalNotes"]
  },
  {
    id: "C1",
    family: "C — SPECIALTY / ADD-ONS",
    name: "Pet Hair Treatment",
    purpose: "Remove or materially reduce pet hair beyond routine vacuuming.",
    conditions: ["C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Inspection", "Approved hair-removal process", "Collection of removed hair", "Final inspection"],
    exclusions: ["Material repair", "Damage replacement", "Out-of-scope contamination"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["interior", "concerns", "media", "finalNotes"]
  },
  {
    id: "C2",
    family: "C — SPECIALTY / ADD-ONS",
    name: "Odor Treatment",
    purpose: "Treat an identified odor source or reduce persistent odor within approved scope.",
    conditions: ["C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Odor-source inspection", "Approved treatment process", "Post-treatment verification"],
    exclusions: ["Permanent odor-elimination guarantee", "Hazardous remediation outside approved scope"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["interior", "concerns", "media", "finalNotes"]
  },
  {
    id: "C3",
    family: "C — SPECIALTY / ADD-ONS",
    name: "Seat / Carpet Extraction",
    purpose: "Deep-clean fabric surfaces where routine cleaning is insufficient.",
    conditions: ["C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Inspection", "Approved extraction process", "Drying procedure", "Final inspection"],
    exclusions: ["Permanent dye damage", "Burns", "Tears", "Material failure", "Unsafe treatment"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["interior", "stains", "concerns", "media", "finalNotes"]
  },
  {
    id: "C4",
    family: "C — SPECIALTY / ADD-ONS",
    name: "Headlight Restoration",
    purpose: "Improve clarity of degraded exterior headlight lenses through an approved process.",
    conditions: ["C2 — MODERATE", "C3 — HEAVY"],
    c4RequiresInspection: true,
    included: ["Lens inspection", "Approved restoration process", "Finishing process", "Final visual inspection"],
    exclusions: ["Lamp/housing replacement", "Internal failure", "Cracked lens repair"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["exterior", "concerns", "media", "finalNotes"]
  },
  {
    id: "C5",
    family: "C — SPECIALTY / ADD-ONS",
    name: "Engine Bay Detail",
    purpose: "Clean approved accessible engine-bay surfaces using a controlled process.",
    conditions: ["C1 — MAINTENANCE", "C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Inspection", "Approved accessible-area cleaning", "Drying", "Final inspection"],
    exclusions: ["Mechanical diagnosis/repair", "Electrical repair", "Component removal", "Unsafe or hazardous cleaning"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["exterior", "concerns", "media", "finalNotes"]
  },
  {
    id: "C6",
    family: "C — SPECIALTY / ADD-ONS",
    name: "Other Specialty",
    purpose: "Controlled placeholder for a specialty service not yet represented by a dedicated catalog item.",
    conditions: ["C1 — MAINTENANCE", "C2 — MODERATE", "C3 — HEAVY", "C4 — EXTREME / INSPECTION REQUIRED"],
    c4RequiresInspection: true,
    included: ["Explicitly defined procedures entered into the approved quote"],
    exclusions: ["Anything not explicitly included in the approved scope"],
    laborTargetUnit: "FIELD_MEASURED_JOB_HOURS",
    qc: ["concerns", "media", "finalNotes"]
  }
];

function taurDetailGetService(serviceId) {
  return TAUR_DETAIL_SERVICE_CATALOG.find(s => s.id === serviceId) || null;
}

function taurDetailServicesByFamily(family) {
  return TAUR_DETAIL_SERVICE_CATALOG.filter(s => s.family === family);
}

function taurDetailServiceAllowsCondition(serviceId, condition) {
  const service = taurDetailGetService(serviceId);
  if (!service) return false;
  return service.conditions.includes(condition);
}

function taurDetailServiceRequiresInspection(serviceId, condition) {
  const service = taurDetailGetService(serviceId);
  if (!service) return true;
  return service.c4RequiresInspection && String(condition || "").startsWith("C4");
}
