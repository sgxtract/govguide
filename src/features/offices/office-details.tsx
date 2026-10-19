import { VerifyText } from "@/components/ui/verify-text";
import { VERIFY, type Office } from "@/lib/content/schemas";
import { formatDays, formatTime } from "@/lib/utils/format";

const time = (value: string) =>
  value === VERIFY ? <VerifyText text={value} /> : formatTime(value);

/** One office: where it is, when it's open, how to reach it. */
export function OfficeDetails({ office }: { office: Office }) {
  return (
    <div className="border-t-2 border-ink pt-3">
      <h3 className="text-lg font-bold">{office.name}</h3>
      <p className="mt-1">
        <VerifyText text={office.address} />
      </p>
      {office.mapUrl && (
        <p className="mt-1">
          {office.mapUrl === VERIFY ? (
            <VerifyText text={office.mapUrl} />
          ) : (
            <a href={office.mapUrl}>Open in Maps</a>
          )}
        </p>
      )}

      {office.hours.length > 0 && (
        <dl className="mt-3 border-t border-rule">
          {office.hours.map((h) => (
            <div
              key={h.days.join()}
              className="flex justify-between gap-4 border-b border-rule py-2"
            >
              <dt>{formatDays(h.days)}</dt>
              <dd className="font-bold tabular-nums">
                {time(h.opens)} – {time(h.closes)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(office.phones.length > 0 || office.email) && (
        <ul role="list" className="mt-3 space-y-1">
          {office.phones.map((phone) => (
            <li key={phone}>
              {/* tel: links let people call with one tap. */}
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
            </li>
          ))}
          {office.email && (
            <li>
              {office.email === VERIFY ? (
                <VerifyText text={office.email} />
              ) : (
                <a href={`mailto:${office.email}`}>{office.email}</a>
              )}
            </li>
          )}
        </ul>
      )}

      {office.notes.length > 0 && (
        <ul role="list" className="mt-3 list-disc space-y-1 pl-5 text-muted">
          {office.notes.map((note) => (
            <li key={note}>
              <VerifyText text={note} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
