import { buildSearchDocs } from "@/features/search/build-index";
import { listCities } from "@/lib/content/repository";

// Written to a static file at build time: /sorsogon/search-index.json.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const cities = await listCities();
  return cities.map((city) => ({ city: city.slug }));
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/[city]/search-index.json">,
) {
  const { city } = await ctx.params;
  return Response.json(await buildSearchDocs(city));
}
