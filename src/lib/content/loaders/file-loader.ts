import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";
import { z } from "zod";

import { checkIntegrity } from "../integrity";
import {
  agencySchema,
  categoriesFileSchema,
  cityLocalServiceSchema,
  cityNationalServiceSchema,
  citySchema,
  holidaysFileSchema,
  officeSchema,
  popularFileSchema,
  reservedCitySlugs,
  serviceSchema,
  type Agency,
  type Category,
  type City,
  type CityService,
  type Holiday,
  type Office,
  type Service,
} from "../schemas";

/** Everything in /content, validated. The repository is the only consumer. */
export type ContentStore = {
  categories: Category[];
  holidays: Holiday[];
  cities: City[];
  agencies: Agency[];
  offices: Office[];
  services: Service[]; // content/services: one per guide, nationwide
  cityServices: CityService[]; // cities/<city>/services: what a city adds
  popular: string[];
};

export class ContentError extends Error {
  constructor(public readonly problems: string[]) {
    super(
      `Content has ${problems.length} problem(s):\n\n${problems.join("\n\n")}`,
    );
    this.name = "ContentError";
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Reads and validates every content file. Collects all problems before
 * failing, so one build run shows every mistake at once.
 */
export async function loadFileContent(root: string): Promise<ContentStore> {
  const problems: string[] = [];
  const rel = (file: string) => path.relative(root, file);

  async function load<T extends z.ZodType>(
    schema: T,
    file: string,
  ): Promise<z.infer<T> | undefined> {
    let data: unknown;
    try {
      data = parse(await readFile(file, "utf8"));
    } catch (error) {
      problems.push(`${rel(file)}\n  ✖ ${(error as Error).message}`);
      return undefined;
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      problems.push(`${rel(file)}\n${z.prettifyError(result.error)}`);
      return undefined;
    }
    return result.data;
  }

  /** The file name is the slug: content/agencies/lto.yaml → "lto". */
  function slugOf(file: string): string | undefined {
    const slug = path.basename(file, ".yaml");
    if (SLUG.test(slug)) return slug;
    problems.push(
      `${rel(file)}\n  ✖ File name must be lowercase-words-with-dashes`,
    );
    return undefined;
  }

  const categories =
    (await load(categoriesFileSchema, path.join(root, "categories.yaml"))) ??
    [];

  // Optional: without it, offices are simply never shown as "closed for a holiday".
  const holidaysFile = path.join(root, "holidays.yaml");
  const holidays = (await exists(holidaysFile))
    ? ((await load(holidaysFileSchema, holidaysFile)) ?? [])
    : [];

  // Optional: without it, the home page shows the first few guides instead.
  const popularFile = path.join(root, "popular.yaml");
  const popular = (await exists(popularFile))
    ? ((await load(popularFileSchema, popularFile)) ?? [])
    : [];

  // Files that exist but failed to load. References to them aren't reported
  // again as "unknown", so one typo gives one error, not a cascade.
  const broken = new Set<string>();

  const agencies: Agency[] = [];
  for (const file of await listYaml(path.join(root, "agencies"))) {
    const slug = slugOf(file);
    const data = await load(agencySchema, file);
    if (slug && data) agencies.push({ ...data, slug });
    else if (slug) broken.add(`agency:${slug}`);
  }

  const services: Service[] = [];
  for (const file of await listYaml(path.join(root, "services"))) {
    const slug = slugOf(file);
    const data = await load(serviceSchema, file);
    if (slug && data) services.push({ ...data, slug });
    else if (slug) broken.add(`service:${slug}`);
  }
  const serviceBySlug = new Map(services.map((s) => [s.slug, s]));
  const reserved: readonly string[] = reservedCitySlugs;

  const cities: City[] = [];
  const offices: Office[] = [];
  const cityServices: CityService[] = [];

  for (const city of await listDirs(path.join(root, "cities"))) {
    if (reserved.includes(city)) {
      problems.push(
        `cities/${city}\n  ✖ City folder name "${city}" is reserved for a site page (/${city}). Rename the folder.`,
      );
      continue;
    }
    const cityDir = path.join(root, "cities", city);
    const data = await load(citySchema, path.join(cityDir, "city.yaml"));
    if (!data) continue;
    cities.push({ ...data, slug: city });

    for (const file of await listYaml(path.join(cityDir, "offices"))) {
      const slug = slugOf(file);
      const office = await load(officeSchema, file);
      if (slug && office) offices.push({ ...office, slug, city });
      else if (slug) broken.add(`office:${city}/${slug}`);
    }

    // The national file decides what a city may add: tips and offices for a
    // national guide, the whole guide for a city-run one.
    for (const file of await listYaml(path.join(cityDir, "services"))) {
      const slug = slugOf(file);
      if (!slug) continue;
      const service = serviceBySlug.get(slug);
      if (!service) {
        if (!broken.has(`service:${slug}`)) {
          problems.push(
            `${rel(file)}\n  ✖ Unknown guide "${slug}": no content/services/${slug}.yaml`,
          );
        }
        continue;
      }
      if (service.scope === "national") {
        const extra = await load(cityNationalServiceSchema, file);
        if (extra)
          cityServices.push({ ...extra, scope: "national", city, slug });
        else broken.add(`city-service:${city}/${slug}`);
      } else {
        const version = await load(cityLocalServiceSchema, file);
        if (version)
          cityServices.push({ ...version, scope: "local", city, slug });
        else broken.add(`city-service:${city}/${slug}`);
      }
    }
  }

  const store = {
    categories,
    holidays,
    cities,
    agencies,
    offices,
    services,
    cityServices,
    popular,
  };
  problems.push(...checkIntegrity(store, broken));

  if (problems.length > 0) throw new ContentError(problems);
  return store;
}

async function listYaml(dir: string): Promise<string[]> {
  const entries = await readdirOrEmpty(dir);
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

async function listDirs(dir: string): Promise<string[]> {
  const entries = await readdirOrEmpty(dir);
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function readdirOrEmpty(dir: string) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}
