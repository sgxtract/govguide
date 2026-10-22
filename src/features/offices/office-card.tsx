import { Mail, Map as MapIcon, MapPin, Phone } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { VerifyText } from "@/components/ui/verify-text";
import { VERIFY, type Holiday, type Office } from "@/lib/content/schemas";
import { formatDays, formatTime } from "@/lib/utils/format";

import { OpenStatusLabel } from "./open-status-label";

const time = (value: string) =>
  value === VERIFY ? <VerifyText text={value} /> : formatTime(value);

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** One office: open now or not, where it is, its hours, how to reach it. */
export function OfficeCard({
  office,
  holidays,
  headingLevel = 3,
}: {
  office: Office;
  holidays: Holiday[];
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const phone = office.phones.find((p) => !p.includes(VERIFY));
  const mapUrl = office.mapUrl !== VERIFY ? office.mapUrl : undefined;
  const email = office.email !== VERIFY ? office.email : undefined;
  // Office slugs are unique within a city, so the anchor includes the city.
  const anchor = `${office.city}-${office.slug}`;

  return (
    <article
      id={anchor}
      aria-labelledby={`${anchor}-name`}
      className="print-keep grid scroll-mt-20 grid-cols-1 gap-3 rounded-card bg-surface p-4 print:border print:border-line"
    >
      <Heading id={`${anchor}-name`} className="text-lg font-extrabold">
        <VerifyText text={office.name} />
      </Heading>

      <OpenStatusLabel hours={office.hours} holidays={holidays} />

      <p className="flex gap-2">
        <Icon icon={MapPin} className="mt-0.5 shrink-0 text-muted" />
        <span>
          <VerifyText text={office.address} />
        </span>
      </p>

      {office.hours.length > 0 && (
        <table className="w-full text-sm">
          <caption className="sr-only">Office hours</caption>
          <tbody>
            {office.hours.map((h) => (
              <tr key={h.days.join()} className="border-b border-line">
                <th scope="row" className="py-1.5 pr-4 text-left font-bold">
                  {formatDays(h.days)}
                </th>
                <td className="py-1.5 text-right tabular-nums">
                  {time(h.opens)} – {time(h.closes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {office.notes.length > 0 && (
        <ul role="list" className="space-y-1 text-sm">
          {office.notes.map((note) => (
            <li key={note}>
              <VerifyText text={note} />
            </li>
          ))}
        </ul>
      )}

      {(phone || mapUrl || email) && (
        <div className="flex flex-wrap gap-2">
          {phone && (
            <a href={telHref(phone)} className={buttonClass("secondary")}>
              <Icon icon={Phone} />
              Call {phone}
            </a>
          )}
          {mapUrl && (
            <a href={mapUrl} className={buttonClass("secondary")}>
              <Icon icon={MapIcon} />
              Open in Maps
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className={buttonClass("secondary")}>
              <Icon icon={Mail} />
              Email
            </a>
          )}
        </div>
      )}

      {/* Paper copies still need the numbers. */}
      {(phone || email) && (
        <p className="hidden text-sm print:block">
          {[phone, email].filter(Boolean).join(", ")}
        </p>
      )}

      {/* Unchecked contact details stay visible to editors on drafts. */}
      {office.phones.some((p) => p.includes(VERIFY)) && (
        <p className="text-sm">
          Phone: <VerifyText text={VERIFY} />
        </p>
      )}
      {office.mapUrl === VERIFY && (
        <p className="text-sm">
          Map link: <VerifyText text={VERIFY} />
        </p>
      )}
    </article>
  );
}
