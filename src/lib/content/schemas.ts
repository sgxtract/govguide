import { z } from "zod";

import { VERIFY } from "./verify";

export { VERIFY };

/**
 * The content contract. Every YAML file in /content is parsed with these
 * schemas at build time, so a typo fails the build instead of shipping.
 * Types are inferred from the schemas: this file is the single source of truth.
 */

/** A typed value (URL, number, date…) that may still be a [VERIFY] placeholder. */
const orVerify = <T extends z.ZodType>(schema: T) =>
  z.union([schema, z.literal(VERIFY)]);

const text = z.string().trim().min(1);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase-words-with-dashes");
const isoDate = z.iso.date(); // "2026-10-19"
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'use 24-hour "HH:MM"');

/**
 * An amount in pesos, or [VERIFY]. Accepts the ways people write money:
 * 585, "585", "₱585.00", "PHP 1,234.50", "P67.63". Stored as a number.
 */
const pesosHint = `write the amount in pesos, like 585 or 67.63 (0 = free), or "${VERIFY}" if not checked yet`;
const pesos = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === VERIFY) {
      return typeof value === "string" ? value.trim() : value;
    }
    const digits = value
      .trim()
      .replace(/^(₱|php|p)\s*/i, "")
      .replace(/,/g, "");
    return /^\d+(\.\d{1,2})?$/.test(digits) ? Number(digits) : value;
  },
  z.union([z.number().nonnegative({ error: pesosHint }), z.literal(VERIFY)], {
    error: pesosHint,
  }),
);

// ── Shared pieces ──────────────────────────────────────────────────────────

export const sourceSchema = z.strictObject({
  title: text, // e.g. "LTO Citizen's Charter 2026"
  url: orVerify(z.url()),
  accessed: orVerify(isoDate), // when you last opened it
});

const hotlineSchema = z.strictObject({
  label: text,
  number: text,
});

// ── Category ───────────────────────────────────────────────────────────────

/** Icons a category can use. The UI maps each to one Lucide icon. */
export const categoryIcons = [
  "documents",
  "vehicles",
  "business",
  "health",
  "social",
  "benefits",
] as const;

export const categorySchema = z.strictObject({
  slug,
  name: text,
  description: text,
  icon: z.enum(categoryIcons),
});

export const categoriesFileSchema = z.array(categorySchema).min(1);

// ── Public holidays (offices are closed) ──────────────────────────────────

export const holidaySchema = z.strictObject({
  date: isoDate,
  name: text,
});

export const holidaysFileSchema = z.array(holidaySchema).default([]);

// ── City ───────────────────────────────────────────────────────────────────

export const citySchema = z.strictObject({
  name: text,
  province: text,
  description: text,
  hotlines: z.array(hotlineSchema).default([]),
});

/**
 * City folder names that would clash with a site page at the same URL
 * (/services, /about…). The loader rejects them.
 */
export const reservedCitySlugs = [
  "about",
  "agencies",
  "categories",
  "contribute",
  "disclaimer",
  "opengraph-image",
  "privacy",
  "search",
  "services",
  "styleguide",
] as const;

// "Most looked up" on the home page, in this order (content/popular.yaml).
export const popularFileSchema = z.array(slug).default([]);

// ── Agency (shared by all cities) ─────────────────────────────────────────

export const agencySchema = z.strictObject({
  name: text,
  acronym: text.optional(),
  level: z.enum(["national", "provincial", "city", "barangay"]),
  description: text,
  website: orVerify(z.url()).optional(),
  portals: z
    .array(z.strictObject({ label: text, url: orVerify(z.url()) }))
    .default([]),
  hotline: text.optional(),
  // Other names people search for: old names, local terms ("NSO" for PSA).
  keywords: z.array(text).default([]),
});

// ── Office (a local branch, belongs to one city) ──────────────────────────

export const weekdays = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
export const weekdaySchema = z.enum(weekdays);

export const hoursSchema = z.strictObject({
  days: z.array(weekdaySchema).min(1),
  opens: orVerify(time),
  closes: orVerify(time),
});

export const officeSchema = z.strictObject({
  agency: slug,
  name: text,
  address: text,
  mapUrl: orVerify(z.url()).optional(),
  hours: z.array(hoursSchema).default([]),
  phones: z.array(text).default([]),
  email: orVerify(z.email()).optional(),
  notes: z.array(text).default([]), // "Cut-off for applications is 3 PM"
});

// ── Service guide (the core content) ──────────────────────────────────────

export const requirementSchema = z.strictObject({
  label: text,
  form: z.enum(["original", "photocopy", "original-and-photocopy"]),
  copies: z.number().int().positive().optional(), // photocopies to bring
  notes: text.optional(),
  alternatives: z.array(text).default([]), // e.g. list of accepted IDs
});

export const stepSchema = z.strictObject({
  title: text,
  details: text.optional(),
  where: text.optional(), // "Window 3", "Cashier", "Online"
  duration: text.optional(), // "About 30 minutes"
});

export const feeSchema = z.strictObject({
  label: text,
  amount: pesos, // 0 = free
  notes: text.optional(),
  // Only in some cases ("Motorcycle with sidecar", "Expedited processing").
  // Such fees aren't added to the total.
  when: text.optional(),
});

/**
 * What a guide tells you to do: the same shape whether it's written once
 * nationally or by one city for a city-run service.
 */
export const guideBodySchema = z.strictObject({
  whoCanApply: z.array(text).default([]),
  requirements: z.array(requirementSchema).min(1),
  // In order; numbering comes from position. The last step is drawn as the
  // finish, so make it what you leave with ("Get your license card").
  steps: z.array(stepSchema).min(1),
  fees: z.array(feeSchema).default([]),
  processingTime: text,
  online: z
    .array(
      z.strictObject({
        label: text,
        url: orVerify(z.url()),
        whatYouCanDo: text,
      }),
    )
    .default([]),
  tips: z.array(text).default([]),
  faqs: z.array(z.strictObject({ question: text, answer: text })).default([]),
  sources: z.array(sourceSchema).min(1), // no source, no guide
  lastVerified: orVerify(isoDate),
});

const status = z.enum(["draft", "published"]);

/** What every guide has, in content/services/<slug>.yaml. */
const serviceBase = {
  title: text, // plain-language task: "Get a new driver's license"
  summary: text, // one sentence
  // Everyday and Filipino words people type: "birth cert", "lisensya".
  keywords: z.array(text).default([]),
  category: slug,
  related: z.array(slug).default([]),
};

/** Same everywhere in the country (LTO, PSA…): written once. */
export const nationalServiceSchema = z.strictObject({
  scope: z.literal("national"),
  status,
  ...serviceBase,
  agency: slug,
  ...guideBodySchema.shape,
});

/** Run by each city (business permit, cedula): each city writes the rest. */
export const localServiceSchema = z.strictObject({
  scope: z.literal("local"),
  ...serviceBase,
});

export const serviceSchema = z.discriminatedUnion("scope", [
  nationalServiceSchema,
  localServiceSchema,
]);

/** cities/<city>/services/<slug>.yaml for a national guide (optional). */
export const cityNationalServiceSchema = z.strictObject({
  // Replaces the default: the city's offices of the guide's agency.
  offices: z.array(slug).optional(),
  tips: z.array(text).default([]), // local tips: "Photocopy shop across the street"
});

/** cities/<city>/services/<slug>.yaml for a local guide: the city's version. */
export const cityLocalServiceSchema = z.strictObject({
  status,
  agency: slug,
  offices: z.array(slug).default([]),
  ...guideBodySchema.shape,
});

// ── Inferred types (with slug/city added by the loader) ───────────────────

export type Category = z.infer<typeof categorySchema>;
export type CategoryIcon = Category["icon"];
export type Holiday = z.infer<typeof holidaySchema>;
export type City = z.infer<typeof citySchema> & { slug: string };
export type Agency = z.infer<typeof agencySchema> & { slug: string };
export type Office = z.infer<typeof officeSchema> & {
  slug: string;
  city: string;
};
export type OfficeHours = z.infer<typeof hoursSchema>;
export type Weekday = z.infer<typeof weekdaySchema>;
export type GuideBody = z.infer<typeof guideBodySchema>;
export type NationalService = z.infer<typeof nationalServiceSchema> & {
  slug: string;
};
export type LocalService = z.infer<typeof localServiceSchema> & {
  slug: string;
};
export type Service = NationalService | LocalService;
export type CityNationalService = z.infer<typeof cityNationalServiceSchema> & {
  scope: "national";
  city: string;
  slug: string;
};
export type CityLocalService = z.infer<typeof cityLocalServiceSchema> & {
  scope: "local";
  city: string;
  slug: string;
};
export type CityService = CityNationalService | CityLocalService;
export type Requirement = z.infer<typeof requirementSchema>;
export type Step = z.infer<typeof stepSchema>;
export type Fee = z.infer<typeof feeSchema>;
export type Source = z.infer<typeof sourceSchema>;
