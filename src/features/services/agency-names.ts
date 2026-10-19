import { agencyDisplayName } from "@/features/agencies/agency-level";
import { listAgencies } from "@/lib/content/repository";

/** Agency slug → "Land Transportation Office (LTO)", for lists of guides. */
export async function getAgencyNames(): Promise<Record<string, string>> {
  const agencies = await listAgencies();
  return Object.fromEntries(
    agencies.map((a) => [a.slug, agencyDisplayName(a)]),
  );
}
