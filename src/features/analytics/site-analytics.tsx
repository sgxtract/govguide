"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

import { stripQuery } from "./strip-query";

// A client component because beforeSend is a function, which a Server
// Component can't pass down. The root layout renders it on production only.
export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => ({
        ...event,
        url: stripQuery(event.url),
      })}
    />
  );
}
