import { VerifyText } from "@/components/ui/verify-text";
import { VERIFY, type GuideBody } from "@/lib/content/schemas";
import { formatDate, formatPeso } from "@/lib/utils/format";

import { feeSummary } from "./fee-summary";

/**
 * The three things people ask first, as raised tiles. On a national guide
 * they overlap the teal header; inside a city's block they don't.
 * Wraps to one per row when the phone's text is very large.
 */
export function AtAGlance({
  body,
  overlap = true,
}: {
  body: Pick<GuideBody, "fees" | "processingTime" | "lastVerified">;
  overlap?: boolean;
}) {
  const summary = feeSummary(body.fees);
  const fee =
    summary.kind === "none" ? (
      "Not listed"
    ) : summary.kind === "verify" ? (
      <VerifyText text={VERIFY} />
    ) : summary.kind === "varies" ||
      // "From Free" says nothing: the extras are what people pay.
      (summary.from && summary.amount === 0) ? (
      "Varies"
    ) : summary.from ? (
      `From ${formatPeso(summary.amount)}`
    ) : (
      formatPeso(summary.amount)
    );

  return (
    // auto-fit columns: three across on phones, one per row with huge text.
    <dl
      className={`relative ${overlap ? "-mt-8" : ""} grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2 print:mt-4`}
    >
      <Tile label="Fees">{fee}</Tile>
      <Tile label="Takes">
        <VerifyText text={body.processingTime} />
      </Tile>
      <Tile label="Checked">
        {body.lastVerified === VERIFY ? (
          <VerifyText text={VERIFY} />
        ) : (
          <time dateTime={body.lastVerified}>
            {formatDate(body.lastVerified)}
          </time>
        )}
      </Tile>
    </dl>
  );
}

function Tile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-control bg-surface p-2.5 shadow-lip print:border print:border-line">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="leading-snug font-extrabold wrap-anywhere">{children}</dd>
    </div>
  );
}
