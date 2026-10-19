import { VERIFY } from "@/lib/content/schemas";

/**
 * Renders text, highlighting any [VERIFY] placeholder so editors spot it.
 * Published guides can't contain [VERIFY] (the build fails), so in production
 * this is plain text.
 */
export function VerifyText({ text }: { text: string | number }) {
  const value = String(text);
  if (!value.includes(VERIFY)) return <>{value}</>;

  const parts = value.split(VERIFY);
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <mark className="rounded-sm bg-notice px-1 text-sm font-bold text-ink">
              {VERIFY}
            </mark>
          )}
        </span>
      ))}
    </>
  );
}
