import type { Thing, WithContext } from "schema-dts";

/**
 * Structured data for search engines. `<` is escaped so content can never
 * close the script tag early.
 */
export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
