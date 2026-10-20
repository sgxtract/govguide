import { describe, expect, it } from "vitest";

import {
  emailOutdatedInfoUrl,
  emailSuggestServiceUrl,
  githubOutdatedInfoUrl,
  githubSuggestServiceUrl,
} from "@/features/feedback/report-links";

const REPO = "https://github.com/example/govguide";
const report = {
  subject: "Get a new driver's license",
  pageUrl: "https://govguide.test/sorsogon/services/drivers-license-new",
};

describe("GitHub report links", () => {
  it("opens the outdated-info form with the page pre-filled", () => {
    const url = new URL(githubOutdatedInfoUrl(REPO, report));
    expect(url.pathname).toBe("/example/govguide/issues/new");
    expect(url.searchParams.get("template")).toBe("outdated-info.yml");
    expect(url.searchParams.get("page")).toBe(report.pageUrl);
    expect(url.searchParams.get("title")).toBe(
      "Outdated info: Get a new driver's license",
    );
  });

  it("opens the suggest-service form, with the city when known", () => {
    const url = new URL(githubSuggestServiceUrl(REPO, "Sorsogon"));
    expect(url.searchParams.get("template")).toBe("suggest-service.yml");
    expect(url.searchParams.get("city")).toBe("Sorsogon");
    expect(
      new URL(githubSuggestServiceUrl(REPO)).searchParams.has("city"),
    ).toBe(false);
  });
});

describe("email report links", () => {
  const link = emailOutdatedInfoUrl("reports@govguide.test", report);

  it("is a mailto link to the inbox", () => {
    expect(link.startsWith("mailto:reports@govguide.test?")).toBe(true);
  });

  it("encodes spaces as %20, never +", () => {
    // Many phone mail apps show "+" literally.
    expect(link).not.toContain("+");
    expect(link).toContain("Outdated%20info");
  });

  it("uses CRLF line breaks and includes the page", () => {
    const body = decodeURIComponent(link.split("body=")[1] ?? "");
    expect(body).toContain(`Page: ${report.pageUrl}\r\n`);
    expect(body).toContain("don't send ID numbers");
  });

  it("pre-fills the city when suggesting a service", () => {
    const body = decodeURIComponent(
      emailSuggestServiceUrl("reports@govguide.test", "Sorsogon").split(
        "body=",
      )[1] ?? "",
    );
    expect(body).toContain("Which city or town? Sorsogon");
  });
});
