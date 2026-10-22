import { ChevronRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icons";
import { Notice } from "@/components/ui/notice";
import { VerifyText } from "@/components/ui/verify-text";
import { VERIFY, type GuideBody } from "@/lib/content/schemas";

import { FeeTable } from "./fee-table";
import { PrintButton } from "./print-button";
import { RequirementChecklist } from "./requirement-checklist";
import { SectionTabs } from "./section-tabs";
import { SourceList } from "./source-list";
import { StepRoute } from "./step-route";

type Props = {
  body: GuideBody;
  /** Prefix for every section id: "" for a national guide, "<city>-" in a city's block. */
  idPrefix: string;
  /** One list of ticks per guide (and per city for a city-run guide). */
  checklistKey: string;
  /** The "Where to go" section, placed after Fees. */
  where?: ReactNode;
  /** Related guides, placed just before Sources. */
  related?: ReactNode;
  /** Report link under Sources. */
  report: ReactNode;
};

/**
 * Everything a guide tells you to do, in reading order. A national guide
 * renders it once; a city-run guide renders it once per city.
 */
export function GuideSections({
  body,
  idPrefix,
  checklistKey,
  where,
  related,
  report,
}: Props) {
  const id = (name: string) => `${idPrefix}${name}`;

  // Tabs only for sections this guide has, in reading order.
  const sections = [
    { id: id("bring"), label: "What to bring" },
    { id: id("route"), label: "Your route" },
    body.fees.length > 0 && { id: id("fees"), label: "Fees" },
    where !== undefined && { id: id("where"), label: "Where to go" },
    body.online.length > 0 && { id: id("online"), label: "Online" },
    body.faqs.length > 0 && { id: id("questions"), label: "Questions" },
    { id: id("sources"), label: "Sources" },
  ].filter((s) => s !== false);

  return (
    <>
      <div className="mt-4">
        <SectionTabs sections={sections} />
      </div>

      <div className="grid grid-cols-1 gap-12 pt-4">
        {body.whoCanApply.length > 0 && (
          <GuideSection id={id("who")} title="Who can apply">
            <ul role="list" className="list-disc space-y-1 pl-5">
              {body.whoCanApply.map((item) => (
                <li key={item}>
                  <VerifyText text={item} />
                </li>
              ))}
            </ul>
          </GuideSection>
        )}

        <GuideSection id={id("bring")} title="What to bring">
          <RequirementChecklist
            guide={checklistKey}
            requirements={body.requirements}
            labelledBy={`${id("bring")}-heading`}
          />
          <div className="mt-4">
            <PrintButton />
          </div>
        </GuideSection>

        <GuideSection id={id("route")} title="Your route">
          <StepRoute steps={body.steps} />
        </GuideSection>

        {body.fees.length > 0 && (
          <GuideSection id={id("fees")} title="Fees">
            <FeeTable fees={body.fees} />
          </GuideSection>
        )}

        {where !== undefined && (
          <GuideSection id={id("where")} title="Where to go">
            {where}
          </GuideSection>
        )}

        {body.online.length > 0 && (
          <GuideSection id={id("online")} title="What you can do online">
            <ul role="list" className="print-urls rounded-card bg-surface">
              {body.online.map((item) => (
                <li
                  key={item.label}
                  className="border-b border-line px-4 py-3 last:border-0"
                >
                  {item.url === VERIFY ? (
                    <span className="font-bold">
                      <VerifyText text={item.label} />{" "}
                      <VerifyText text={item.url} />
                    </span>
                  ) : (
                    <a
                      href={item.url}
                      className="inline-flex items-center gap-1.5 font-bold"
                    >
                      <VerifyText text={item.label} />
                      <Icon icon={ExternalLink} size={18} />
                    </a>
                  )}
                  <span className="ml-2 text-sm text-muted">official site</span>
                  <p className="mt-1">
                    <VerifyText text={item.whatYouCanDo} />
                  </p>
                </li>
              ))}
            </ul>
          </GuideSection>
        )}

        {body.tips.length > 0 && (
          <Notice kind="info" title="Good to know">
            <ul role="list" className="list-disc space-y-1 pl-5">
              {body.tips.map((tip) => (
                <li key={tip}>
                  <VerifyText text={tip} />
                </li>
              ))}
            </ul>
          </Notice>
        )}

        {body.faqs.length > 0 && (
          <GuideSection id={id("questions")} title="Common questions" noPrint>
            <div className="rounded-card bg-surface">
              {body.faqs.map((faq) => (
                // Native disclosure: works without JS, and Ctrl+F finds hidden answers.
                <details
                  key={faq.question}
                  className="group border-b border-line last:border-0"
                >
                  <summary className="flex min-h-14 list-none items-center justify-between gap-3 px-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                    <span>
                      <VerifyText text={faq.question} />
                    </span>
                    <Icon
                      icon={ChevronRight}
                      className="shrink-0 text-muted transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="px-4 pb-4">
                    <VerifyText text={faq.answer} />
                  </p>
                </details>
              ))}
            </div>
          </GuideSection>
        )}

        {related}

        <section
          id={id("sources")}
          aria-labelledby={`${id("sources")}-heading`}
          className="print-urls border-t-2 border-ink pt-5"
        >
          <h2
            id={`${id("sources")}-heading`}
            className="mb-3 text-xl font-extrabold"
          >
            Sources
          </h2>
          <SourceList sources={body.sources} />
          <div className="mt-8">{report}</div>
        </section>
      </div>
    </>
  );
}

export function GuideSection({
  id,
  title,
  noPrint = false,
  children,
}: {
  id: string;
  title: string;
  noPrint?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={noPrint ? "print:hidden" : undefined}
    >
      <h2 id={`${id}-heading`} className="mb-3 text-xl font-extrabold">
        {title}
      </h2>
      {children}
    </section>
  );
}
