import { VerifyText } from "@/components/ui/verify-text";
import { VERIFY, type Service } from "@/lib/content/schemas";
import { formatDate, formatPeso } from "@/lib/utils/format";

import { totalFee } from "./fee-table";

/**
 * The three things people ask first, as raised tiles that overlap the teal
 * header. Wraps to one per row when the phone's text is very large.
 */
export function AtAGlance({ service }: { service: Service }) {
  const total = totalFee(service.fees);
  const fee =
    service.fees.length === 0 ? (
      "Not listed"
    ) : total !== undefined ? (
      formatPeso(total)
    ) : (
      <VerifyText text={VERIFY} />
    );

  return (
    // auto-fit columns: three across on phones, one per row with huge text.
    <dl className="relative -mt-8 grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2 print:mt-4">
      <Tile label="Fees">{fee}</Tile>
      <Tile label="Takes">
        <VerifyText text={service.processingTime} />
      </Tile>
      <Tile label="Checked">
        {service.lastVerified === VERIFY ? (
          <VerifyText text={VERIFY} />
        ) : (
          <time dateTime={service.lastVerified}>
            {formatDate(service.lastVerified)}
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
