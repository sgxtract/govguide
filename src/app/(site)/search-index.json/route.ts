import { buildSearchDocs } from "@/features/search/build-index";

// Written to a static file at build time: /search-index.json.
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await buildSearchDocs());
}
