import { VerifyText } from "@/components/ui/verify-text";
import { VERIFY, type Source } from "@/lib/content/schemas";
import { formatDate } from "@/lib/utils/format";

/** Where every fact on the page came from, so readers can check it. */
export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul role="list" className="space-y-2">
      {sources.map((source) => (
        <li key={source.title}>
          {source.url === VERIFY ? (
            <span className="font-bold">
              <VerifyText text={source.title} />{" "}
              <VerifyText text={source.url} />
            </span>
          ) : (
            <a href={source.url}>
              <VerifyText text={source.title} />
            </a>
          )}
          <span className="block text-sm text-muted">
            Checked{" "}
            {source.accessed === VERIFY ? (
              <VerifyText text={source.accessed} />
            ) : (
              <time dateTime={source.accessed}>
                {formatDate(source.accessed)}
              </time>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
