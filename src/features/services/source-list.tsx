import { ExternalLink } from "lucide-react";

import { Icon } from "@/components/ui/icons";
import { VerifyText } from "@/components/ui/verify-text";
import { VERIFY, type Source } from "@/lib/content/schemas";
import { formatDate } from "@/lib/utils/format";

/** Where every fact on the page came from, so readers can check it. */
export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul role="list" className="space-y-3">
      {sources.map((source) => (
        <li key={source.title} className="flex gap-2">
          <Icon icon={ExternalLink} className="mt-0.5 shrink-0 text-muted" />
          <div className="min-w-0">
            {source.url === VERIFY ? (
              <span className="font-bold">
                <VerifyText text={source.title} />{" "}
                <VerifyText text={source.url} />
              </span>
            ) : (
              <a href={source.url} className="font-bold">
                <VerifyText text={source.title} />
              </a>
            )}
            <span className="block text-sm text-muted">
              Official source, checked{" "}
              {source.accessed === VERIFY ? (
                <VerifyText text={source.accessed} />
              ) : (
                <time dateTime={source.accessed}>
                  {formatDate(source.accessed)}
                </time>
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
