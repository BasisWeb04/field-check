import { describe, expect, it } from "vitest";
import { checkDuplicates, normalizeName } from "../src/core/rules/duplicate";
import { cleanRecord } from "./helpers";

describe("duplicate", () => {
  it("normalizes case, spacing, punctuation and ampersands", () => {
    expect(normalizeName("  Oak & Anvil   BARBERS, Inc.")).toBe("oak and anvil barbers inc");
  });

  it("flags every row in a duplicate group and names the other rows", () => {
    const rows = [
      cleanRecord({ id: "A", business_name: "Harbor Line Bakery", phone: "(503) 555-0109" }),
      cleanRecord({ id: "B", business_name: "  harbor line   BAKERY", phone: "503.555.0109" }),
      cleanRecord({ id: "C", business_name: "Harbor Line Bakery", phone: "+1 503 555 0109" }),
    ];
    const verdicts = checkDuplicates(rows);
    expect(verdicts.map((v) => v?.status)).toEqual(["fail", "fail", "fail"]);
    expect(verdicts[0]?.message).toBe("Same normalized name and phone as row(s) B, C.");
  });

  it("does not flag branches that share a name but not a phone", () => {
    const rows = [
      cleanRecord({ id: "A", business_name: "Tin Kettle Coffee", phone: "(208) 555-0104" }),
      cleanRecord({ id: "B", business_name: "Tin Kettle Coffee", phone: "(208) 555-0105" }),
    ];
    expect(checkDuplicates(rows).map((v) => v?.status)).toEqual(["pass", "pass"]);
  });

  it("returns null for a row with no name", () => {
    expect(checkDuplicates([cleanRecord({ business_name: "" })])).toEqual([null]);
  });
});
