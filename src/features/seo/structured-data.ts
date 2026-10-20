import "server-only";

import type {
  BreadcrumbList,
  DayOfWeek,
  GovernmentService,
  OpeningHoursSpecification,
  WebSite,
  WithContext,
} from "schema-dts";

import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/config/site-url";
import type {
  Agency,
  Category,
  City,
  Office,
  Service,
} from "@/lib/content/schemas";
import { VERIFY } from "@/lib/content/verify";

const DAYS: Record<Office["hours"][number]["days"][number], DayOfWeek> = {
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
};

const known = (value: string | undefined) =>
  value && !value.includes(VERIFY) ? value : undefined;

export function websiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: "en-PH",
  };
}

/** Matches the visible breadcrumbs; Google can show these in results. */
export function breadcrumbJsonLd(
  items: { label: string; href?: string }[],
  currentPath: string,
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href ?? currentPath),
    })),
  };
}

function hoursJsonLd(office: Office): OpeningHoursSpecification[] {
  return office.hours.flatMap((h) =>
    h.opens === VERIFY || h.closes === VERIFY
      ? []
      : [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.days.map((d) => DAYS[d]),
            opens: h.opens,
            closes: h.closes,
          },
        ],
  );
}

/**
 * Describes the agency's service (the agency is the provider, not GovGuide).
 * Only built for published guides, which contain no [VERIFY] values; the
 * `known()` checks are a second line of defence.
 */
export function serviceJsonLd(input: {
  service: Service;
  agency: Agency;
  category: Category;
  city: City;
  offices: Office[];
  path: string;
}): WithContext<GovernmentService> {
  const { service, agency, category, city, offices, path } = input;

  return {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: service.title,
    description: service.summary,
    url: absoluteUrl(path),
    serviceType: category.name,
    provider: {
      "@type": "GovernmentOrganization",
      name: agency.name,
      alternateName: agency.acronym,
      url: known(agency.website),
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: `${city.province}, Philippines`,
      },
    },
    availableChannel: [
      ...offices.map((office) => ({
        "@type": "ServiceChannel" as const,
        name: office.name,
        serviceLocation: {
          "@type": "GovernmentOffice" as const,
          name: office.name,
          address: {
            "@type": "PostalAddress" as const,
            streetAddress: known(office.address),
            addressRegion: city.province,
            addressCountry: "PH",
          },
          telephone: office.phones[0],
          openingHoursSpecification: hoursJsonLd(office),
        },
      })),
      ...service.online.flatMap((item) =>
        known(item.url)
          ? [
              {
                "@type": "ServiceChannel" as const,
                name: item.label,
                serviceUrl: item.url,
              },
            ]
          : [],
      ),
    ],
    offers: service.fees.flatMap((fee) =>
      typeof fee.amount === "number"
        ? [
            {
              "@type": "Offer" as const,
              name: fee.label,
              price: fee.amount,
              priceCurrency: "PHP",
            },
          ]
        : [],
    ),
  };
}
