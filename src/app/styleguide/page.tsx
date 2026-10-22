import { Check, Map as MapIcon, Phone, Printer, X } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import { Icon, categoryIcon } from "@/components/ui/icons";
import { Notice } from "@/components/ui/notice";
import { VerifyText } from "@/components/ui/verify-text";
import { TopicTiles } from "@/features/categories/topic-tiles";
import { OfficeCard } from "@/features/offices/office-card";
import { StatusLine } from "@/features/offices/open-status-label";
import { SearchForm } from "@/features/search/search-form";
import { AtAGlance } from "@/features/services/at-a-glance";
import { FeeTable } from "@/features/services/fee-table";
import { GuideRows } from "@/features/services/guide-rows";
import { RequirementChecklist } from "@/features/services/requirement-checklist";
import { StepRoute } from "@/features/services/step-route";
import {
  VERIFY,
  categoryIcons,
  type Category,
  type Office,
  type NationalService,
} from "@/lib/content/schemas";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "GovGuide's design tokens and components.",
  robots: { index: false },
};

// ── Sample data. Facts stay [VERIFY]: this page must never invent them. ──

function sampleService(
  slug: string,
  title: string,
  agency: string,
  overrides: Partial<NationalService> = {},
): NationalService {
  return {
    slug,
    scope: "national",
    status: "draft",
    title,
    summary: `${title}.`,
    keywords: [],
    category: "ids-and-documents",
    agency,
    whoCanApply: [],
    requirements: [{ label: VERIFY, form: "original", alternatives: [] }],
    steps: [{ title: VERIFY }],
    fees: [],
    processingTime: VERIFY,
    online: [],
    tips: [],
    faqs: [],
    related: [],
    sources: [{ title: VERIFY, url: VERIFY, accessed: VERIFY }],
    lastVerified: VERIFY,
    ...overrides,
  };
}

const guides = [
  sampleService("drivers-license-new", "Get a new driver's license", "lto"),
  sampleService("psa-birth-certificate", "Get a PSA birth certificate", "psa"),
  sampleService("barangay-clearance", "Get a barangay clearance", "barangay"),
];
const agencyNames = {
  lto: "Land Transportation Office (LTO)",
  psa: "Philippine Statistics Authority (PSA)",
  barangay: "Barangay Hall",
};

const sampleGuide = sampleService(
  "drivers-license-new",
  "Get a new driver's license",
  "lto",
  {
    fees: [
      { label: `License fee ${VERIFY}`, amount: VERIFY },
      { label: `Computer fee ${VERIFY}`, amount: VERIFY },
    ],
    requirements: [
      { label: "Student permit", form: "original", alternatives: [] },
      {
        label: "Medical certificate from an LTO-accredited clinic",
        form: "original",
        alternatives: [],
      },
      {
        label: "Valid government ID",
        form: "original-and-photocopy",
        copies: 1,
        alternatives: [`${VERIFY} list of accepted IDs`],
      },
    ],
    steps: [
      { title: "Register or log in to the LTMS portal", where: "Online" },
      {
        title: "Take the theoretical driving exam",
        where: VERIFY,
        duration: VERIFY,
      },
      { title: "Take the practical driving exam", where: VERIFY },
      { title: "Pay the fees", where: "Cashier" },
      { title: "Get your license card or temporary paper license" },
    ],
  },
);

const sampleCategories: { category: Category; count: number }[] = [
  {
    category: {
      slug: "ids-and-documents",
      name: "IDs & Documents",
      description: "",
      icon: "documents",
    },
    count: 7,
  },
  {
    category: {
      slug: "vehicles-and-driving",
      name: "Vehicles & Driving",
      description: "",
      icon: "vehicles",
    },
    count: 2,
  },
  {
    category: {
      slug: "health",
      name: "Health",
      description: "",
      icon: "health",
    },
    count: 0,
  },
];

const sampleOffice: Office = {
  slug: "sample-office",
  city: "sorsogon",
  agency: "lto",
  name: "LTO Sorsogon District Office",
  address: `${VERIFY} street address, Sorsogon City`,
  hours: [
    {
      days: ["mon", "tue", "wed", "thu", "fri"],
      opens: VERIFY,
      closes: VERIFY,
    },
  ],
  phones: [],
  notes: [],
};

// ── Tokens shown as swatches ───────────────────────────────────────────────

const SWATCHES: { token: string; className: string; use: string }[] = [
  {
    token: "brand",
    className: "bg-brand text-on-brand",
    use: "Headers, primary buttons. White on it: 5.9:1",
  },
  {
    token: "signal",
    className: "bg-signal text-on-signal",
    use: "Route stops, search button, focus halo",
  },
  {
    token: "route",
    className: "bg-route text-on-route",
    use: "Route line, ticks, progress",
  },
  {
    token: "brand-tint",
    className: "bg-brand-tint text-link",
    use: "Icon wells, row hover",
  },
  { token: "bg", className: "bg-bg text-ink", use: "Page background" },
  {
    token: "surface",
    className: "bg-surface text-ink",
    use: "Lists, cards, tables",
  },
  { token: "ink", className: "bg-ink text-bg", use: "Text" },
  {
    token: "muted",
    className: "bg-surface text-muted",
    use: "Secondary text, 6.4:1 or more",
  },
  { token: "link", className: "bg-surface text-link", use: "Text links" },
  {
    token: "signal-tint",
    className: "bg-signal-tint text-ink",
    use: "Notices and tips",
  },
  { token: "open", className: "bg-surface text-open", use: "Open now" },
  {
    token: "soon",
    className: "bg-surface text-soon",
    use: "Closes within the hour",
  },
  { token: "closed", className: "bg-surface text-closed", use: "Closed now" },
];

const SECTIONS = [
  ["principles", "Principles"],
  ["colour", "Colour"],
  ["type", "Type"],
  ["shape", "Shape"],
  ["icons", "Icons"],
  ["controls", "Controls"],
  ["lists", "Lists"],
  ["guide", "Guide parts"],
  ["offices", "Offices"],
  ["notices", "Notices"],
] as const;

export default function StyleguidePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <PageHeader
          title="Counter window, with a route to follow"
          subtitle="GovGuide's design tokens and components. Everything here is the real component, so you can tab through it."
        />

        <nav
          aria-label="Styleguide sections"
          className="sticky top-0 z-10 bg-bg"
        >
          <ul className="mx-auto flex max-w-page [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 py-2.5">
            {SECTIONS.map(([id, label]) => (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  className="inline-flex min-h-11 items-center rounded-pill bg-surface px-4 text-sm font-bold whitespace-nowrap text-ink no-underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mx-auto grid max-w-page grid-cols-1 gap-16 px-4 pt-8">
          <Section id="principles" title="Principles">
            <p className="max-w-prose text-muted">
              For a Sorsoganon on a prepaid phone, often outdoors or in a queue,
              who wants the errand done in one trip.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Spec title="Do">
                <Rules
                  ok
                  items={[
                    "Spend boldness in one place. The route is the signature; everything around it stays quiet.",
                    "Teal frames (headers, primary buttons, the route line). Yellow marks stops, the search button and focus.",
                    "Order follows the errand: at a glance, what to bring, your route, fees, where to go, online, tips, questions, sources.",
                    "Status always has words: “Open now, closes 5:00 PM”, never a dot alone.",
                    "Everything you can tap is at least 44px tall and shows the yellow-and-ink focus ring.",
                  ]}
                />
              </Spec>
              <Spec title="Don't">
                <Rules
                  items={[
                    "Gradients, glassy cards, decorative illustrations, carousels.",
                    "Flag colours, official seals, or anything that suggests an LGU site.",
                    "Text under 16px, grey-on-grey, or tracked-out all-caps labels.",
                    "Invented requirements, fees, hours or times. Unchecked values show as [VERIFY].",
                    "Motion nobody asked for. Things move only when you tap them.",
                  ]}
                />
              </Spec>
            </div>
          </Section>

          <Section id="colour" title="Colour">
            <p className="max-w-prose text-muted">
              Semantic tokens only; components never use raw hex. Every text
              pair passes WCAG AA in light and dark. Use the toggle in the bar
              to check.
            </p>
            <ul
              role="list"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            >
              {SWATCHES.map((s) => (
                <li
                  key={s.token}
                  className="overflow-hidden rounded-control border border-line bg-surface"
                >
                  <div
                    className={`flex h-18 items-end p-2.5 text-lg font-extrabold ${s.className}`}
                  >
                    Aa
                  </div>
                  <div className="p-2.5 text-sm">
                    <code className="font-bold">{s.token}</code>
                    <p className="text-muted">{s.use}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="type" title="Type">
            <p className="max-w-prose text-muted">
              Archivo Narrow is the counter sign: page titles, the home
              question, step numerals. Atkinson Hyperlegible Next is for reading
              everything else. Nothing smaller than 16px; body is 18px.
            </p>
            <Spec>
              <TypeRow label="display: Archivo Narrow 700">
                <span className="sign text-display">
                  What do you need to get done?
                </span>
              </TypeRow>
              <TypeRow label="2xl: Archivo Narrow, guide titles">
                <span className="sign text-2xl">
                  Get a new driver&apos;s license
                </span>
              </TypeRow>
              <TypeRow label="xl: Atkinson 800, section headings">
                <span className="text-xl font-extrabold">What to bring</span>
              </TypeRow>
              <TypeRow label="lg: Atkinson 700, step and list titles">
                <span className="text-lg font-bold">
                  Take the theoretical driving exam
                </span>
              </TypeRow>
              <TypeRow label="base: Atkinson 400, body at 1.55 line height">
                <span className="max-w-prose">
                  Bring the original and one photocopy. Sentences stay short,
                  and paragraphs stay under 65 characters wide.
                </span>
              </TypeRow>
              <TypeRow label="sm: 16px, the smallest size allowed">
                <span className="text-sm text-muted">
                  Original + 1 photocopy
                </span>
              </TypeRow>
            </Spec>
          </Section>

          <Section id="shape" title="Shape">
            <p className="max-w-prose text-muted">
              Radius follows hierarchy. No drop shadows on content: raised tiles
              get a 2px lip. Real shadows only for things that float.
            </p>
            <div className="flex flex-wrap items-end gap-6">
              <ShapeSample label="control, 10px">
                <div className="h-12 w-20 rounded-control border-2 border-control" />
              </ShapeSample>
              <ShapeSample label="card, 14px + lip">
                <div className="h-18 w-24 rounded-card bg-surface shadow-lip" />
              </ShapeSample>
              <ShapeSample label="pill">
                <div className="h-11 w-24 rounded-pill bg-ink" />
              </ShapeSample>
              <ShapeSample label="route stop">
                <span className="grid size-10 place-items-center rounded-full border-4 border-route bg-signal sign text-xl text-on-signal">
                  3
                </span>
              </ShapeSample>
            </div>
          </Section>

          <Section id="icons" title="Icons">
            <p className="max-w-prose text-muted">
              Lucide, 2px stroke, 22px, always beside a visible word.
            </p>
            <ul role="list" className="flex flex-wrap gap-x-6 gap-y-3">
              {categoryIcons.map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <Icon icon={categoryIcon(name)} />
                  {name}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="controls" title="Controls">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Spec title="Search on the teal header">
                <div className="rounded-card bg-brand p-4">
                  <SearchForm
                    city="sorsogon"
                    inputId="sg-search-hero"
                    variant="hero"
                    labelledBy="sg-search-label"
                  />
                  <span id="sg-search-label" className="sr-only">
                    Search guides
                  </span>
                </div>
              </Spec>
              <Spec title="Search on a page">
                <SearchForm
                  city="sorsogon"
                  inputId="sg-search-page"
                  variant="page"
                />
              </Spec>
              <Spec title="Buttons">
                <p className="text-sm text-muted">
                  48px tall, verb first. One primary per screen.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className={buttonClass("primary")}>
                    <Icon icon={Printer} />
                    Print checklist
                  </button>
                  <button type="button" className={buttonClass("secondary")}>
                    <Icon icon={Phone} />
                    Call
                  </button>
                  <button type="button" className={buttonClass("secondary")}>
                    <Icon icon={MapIcon} />
                    Open in Maps
                  </button>
                </div>
              </Spec>
              <Spec title="Links and focus">
                <p>
                  Inline links are underlined, in{" "}
                  <a href="#colour">link teal</a>. Press Tab: the ring is a
                  yellow halo with an ink inner edge, so it shows on teal, white
                  and dark.
                </p>
              </Spec>
            </div>
          </Section>

          <Section id="lists" title="Lists">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Spec title="Guide rows">
                <GuideRows services={guides} agencyNames={agencyNames} />
              </Spec>
              <Spec title="Topic tiles">
                <TopicTiles city="sorsogon" categories={sampleCategories} />
              </Spec>
            </div>
          </Section>

          <Section id="guide" title="Guide parts">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Spec title="At a glance">
                <div className="rounded-card bg-brand px-3 pt-10 pb-1">
                  <AtAGlance body={sampleGuide} />
                </div>
              </Spec>
              <Spec title="What to bring">
                <RequirementChecklist
                  guide="/styleguide"
                  requirements={sampleGuide.requirements}
                  labelledBy="sg-bring"
                />
                <span id="sg-bring" className="sr-only">
                  What to bring
                </span>
              </Spec>
              <Spec title="Your route">
                <StepRoute steps={sampleGuide.steps} />
              </Spec>
              <Spec title="Fees">
                <FeeTable fees={sampleGuide.fees} />
              </Spec>
            </div>
          </Section>

          <Section id="offices" title="Offices and open-now">
            <p className="max-w-prose text-muted">
              Worked out from verified hours in Philippine time. Each state has
              its own marker shape, plus words.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <OfficeCard office={sampleOffice} holidays={[]} />
              <Spec title="The four states">
                <ul role="list" className="grid gap-3 sm:grid-cols-2">
                  <li>
                    <StatusLine
                      variant="full"
                      tone="open"
                      status="Open now"
                      detail="Closes 5:00 PM"
                    />
                  </li>
                  <li>
                    <StatusLine
                      variant="full"
                      tone="soon"
                      status="Closes soon"
                      detail="At 5:00 PM, in 40 minutes"
                    />
                  </li>
                  <li>
                    <StatusLine
                      variant="full"
                      tone="closed"
                      status="Closed now"
                      detail="Opens Monday at 8:00 AM"
                    />
                  </li>
                  <li>
                    <StatusLine
                      variant="full"
                      tone="unknown"
                      status="Hours not checked yet"
                      detail="Call before you go"
                    />
                  </li>
                </ul>
                <p className="text-sm text-muted">
                  Sample times for this page only.
                </p>
              </Spec>
            </div>
          </Section>

          <Section id="notices" title="Notices">
            <p className="max-w-prose text-muted">
              Only for the three things people commonly get wrong.
            </p>
            <div className="grid max-w-3xl grid-cols-1 gap-3">
              <Notice
                kind="draft"
                title="Draft, not published"
                headingLevel={3}
              >
                <p>
                  Highlighted <VerifyText text={VERIFY} /> values still need
                  checking against an official source.
                </p>
              </Notice>
              <Notice
                kind="warning"
                title="This guide may be out of date"
                headingLevel={3}
              >
                <p>Confirm with the office before you go.</p>
              </Notice>
              <Notice kind="info" title="Good to know" headingLevel={3}>
                <p>
                  <VerifyText text={`${VERIFY} Bring a black pen.`} />
                </p>
              </Notice>
            </div>
          </Section>
        </div>
      </main>
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid scroll-mt-20 grid-cols-1 gap-4"
    >
      <h2 id={`${id}-title`} className="sign text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Spec({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 content-start gap-3 rounded-card bg-surface p-5">
      {title && <h3 className="text-lg font-extrabold">{title}</h3>}
      {children}
    </div>
  );
}

function Rules({ items, ok = false }: { items: string[]; ok?: boolean }) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Icon
            icon={ok ? Check : X}
            className={`mt-0.5 shrink-0 ${ok ? "text-open" : "text-closed"}`}
          />
          <span>
            <VerifyText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function TypeRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line py-3 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}

function ShapeSample({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-1.5">
      {children}
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
