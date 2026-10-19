import type { Agency } from "@/lib/content/schemas";

const LABELS: Record<Agency["level"], string> = {
  national: "National government agency",
  provincial: "Provincial government office",
  city: "City government office",
  barangay: "Barangay office",
};

/** "national" → "National government agency". */
export function agencyLevelLabel(level: Agency["level"]): string {
  return LABELS[level];
}

/** "Land Transportation Office (LTO)". */
export function agencyDisplayName(agency: Agency): string {
  return agency.acronym ? `${agency.name} (${agency.acronym})` : agency.name;
}
