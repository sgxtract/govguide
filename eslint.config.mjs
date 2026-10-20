import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message:
                "Use Link from @/components/ui/link: it prefetches on intent to save mobile data.",
            },
          ],
        },
      ],
    },
  },
  {
    // The wrapper is the one place allowed to import next/link.
    files: ["src/components/ui/link.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
  prettier,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
