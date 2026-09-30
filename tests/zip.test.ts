import { describe, expect, it } from "vitest";
import { ZIP3_RANGES, statesForPrefix } from "../src/core/reference/zip3";
import { checkZipFormat, checkZipState } from "../src/core/rules/zip";

const STATES_AND_DC = (
  "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND " +
  "OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY"
).split(" ");

describe("zip.format", () => {
  it("passes 5-digit and ZIP+4, keeping leading zeros", () => {
    expect(checkZipFormat("05602")?.status).toBe("pass");
    expect(checkZipFormat("80202-1234")?.status).toBe("pass");
  });

  it("fails short, long and non-numeric ZIPs", () => {
    for (const z of ["8021", "802021", "8020A", "80202-12"]) expect(checkZipFormat(z)?.status, z).toBe("fail");
  });
});

describe("zip.state", () => {
  it("passes when the prefix belongs to the stated state, case-insensitive", () => {
    expect(checkZipState("80202", "co")?.status).toBe("pass");
    expect(checkZipState("05602", "VT")?.status).toBe("pass");
  });

  it("fails a prefix that belongs to another state and names both", () => {
    const v = checkZipState("94107", "CO");
    expect(v?.status).toBe("fail");
    expect(v?.message).toBe("ZIP prefix 941 belongs to CA, but the row says CO.");
  });

  it("is unverifiable for a prefix outside the table, never pass", () => {
    expect(checkZipState("21305", "MD")?.status).toBe("unverifiable");
    expect(checkZipState("00312", "NY")?.status).toBe("unverifiable");
  });

  it("returns null when the ZIP is malformed or the state is blank", () => {
    expect(checkZipState("8021", "CO")).toBeNull();
    expect(checkZipState("80202", "")).toBeNull();
  });

  it("handles single-prefix exceptions inside a neighbouring state's block", () => {
    expect(statesForPrefix("733")).toEqual(["TX"]);
    expect(statesForPrefix("734")).toEqual(["OK"]);
    expect(statesForPrefix("055")).toEqual(["MA"]);
  });
});

describe("ZIP prefix table", () => {
  it("covers all 50 states and DC", () => {
    const covered = new Set(ZIP3_RANGES.flatMap((r) => r.states));
    expect(STATES_AND_DC.filter((s) => !covered.has(s))).toEqual([]);
  });

  it("has well-formed, sorted, non-overlapping ranges", () => {
    let last = -1;
    for (const r of ZIP3_RANGES) {
      expect(r.from).toMatch(/^\d{3}$/);
      expect(r.to).toMatch(/^\d{3}$/);
      expect(Number(r.from)).toBeGreaterThan(last);
      expect(Number(r.to)).toBeGreaterThanOrEqual(Number(r.from));
      last = Number(r.to);
    }
  });
});
