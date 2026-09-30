import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "../src/App";

describe("first paint", () => {
  // React inserts comment markers between adjacent text nodes; strip them so text assertions read naturally.
  const html = renderToString(createElement(App)).replaceAll("<!-- -->", "");

  it("shows the sample results at once instead of the empty state", () => {
    expect(html).not.toContain("No results yet");
    expect(html).toContain("from data/sample.csv");
    expect(html).toContain("Showing 60 of 60 rows");
    // One body row per record: 60 keyed result rows plus the header row.
    expect((html.match(/<tr\b/g) ?? []).length).toBeGreaterThanOrEqual(61);
  });

  it("keeps the input controls and the browser-only wording", () => {
    expect(html).toContain("Checks run in this browser tab");
    expect(html).toContain("Load sample (60 rows)");
    expect(html).toContain("Choose CSV file");
    expect(html).toContain("Paste CSV");
  });
});
