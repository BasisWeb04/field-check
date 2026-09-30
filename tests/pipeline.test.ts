import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCsv } from "../src/core/csv";
import { cellStatus, rowStatus, verifyCsv, verifyRecords } from "../src/core/engine";
import { formatSummary, toResultsCsv, toResultsJson } from "../src/core/export";
import { FIELDS, RULE_IDS } from "../src/core/types";
import { cleanRecord } from "./helpers";

const sample = readFileSync(new URL("../data/sample.csv", import.meta.url), "utf8");
const result = verifyCsv(sample);

// Rows seeded with problems on purpose; every other row is expected to be fully verified.
const NEEDS_REVIEW = [
  "FC-003", "FC-007", "FC-009", "FC-012", "FC-015", "FC-018", "FC-020", "FC-023", "FC-025",
  "FC-028", "FC-031", "FC-034", "FC-037", "FC-040", "FC-044", "FC-048", "FC-051", "FC-060",
];
const PARTLY = [
  "FC-006", "FC-011", "FC-016", "FC-021", "FC-027", "FC-032", "FC-036", "FC-042", "FC-046", "FC-050", "FC-053", "FC-057",
];

describe("golden run on data/sample.csv", () => {
  it("produces the exact summary counts", () => {
    expect(result.summary).toEqual({
      rows: 60,
      verified: 30,
      partlyVerified: 12,
      needsReview: 18,
      verdicts: { pass: 800, fail: 19, unverifiable: 15 },
      failsByRule: {
        required: 2,
        "phone.nanp": 6,
        "email.syntax": 1,
        "website.syntax": 1,
        "email.domain-match": 2,
        "zip.format": 1,
        "zip.state": 2,
        "hours.parse": 2,
        duplicate: 2,
      },
    });
  });

  it("assigns each seeded row the expected status", () => {
    for (const row of result.rows) {
      const id = row.record.id;
      const expected = NEEDS_REVIEW.includes(id) ? "needs review" : PARTLY.includes(id) ? "partly verified" : "verified";
      expect(row.status, id).toBe(expected);
    }
  });

  it("reports the near-duplicate pair on both rows", () => {
    const dupes = result.rows.filter((r) => r.verdicts.some((v) => v.ruleId === "duplicate" && v.status === "fail"));
    expect(dupes.map((r) => r.record.id)).toEqual(["FC-009", "FC-031"]);
  });
});

describe("invariants", () => {
  const all = result.rows.flatMap((r) => r.verdicts);

  it("every verdict has a known ruleId, a valid status and a non-empty source, message and evidence", () => {
    for (const v of all) {
      expect(RULE_IDS).toContain(v.ruleId);
      expect(["pass", "fail", "unverifiable"]).toContain(v.status);
      expect(v.source.trim()).not.toBe("");
      expect(v.message.trim()).not.toBe("");
      expect(v.evidence.trim()).not.toBe("");
    }
  });

  it("every field of every row gets at least one verdict", () => {
    for (const row of result.rows) {
      for (const f of FIELDS) {
        expect(row.verdicts.some((v) => v.field === f), `${row.record.id} ${f}`).toBe(true);
      }
    }
  });

  it("row counts add up to the verdict list and match the row status rule", () => {
    for (const row of result.rows) {
      expect(row.counts.pass + row.counts.fail + row.counts.unverifiable).toBe(row.verdicts.length);
      expect(row.status).toBe(rowStatus(row.counts));
    }
  });
});

describe("row status and cell status", () => {
  it("is verified only when every verdict passes", () => {
    expect(verifyRecords([cleanRecord()]).rows[0]!.status).toBe("verified");
  });

  it("is partly verified when something is unverifiable and nothing fails", () => {
    expect(verifyRecords([cleanRecord({ email: "shop@mail.example" })]).rows[0]!.status).toBe("partly verified");
  });

  it("needs review when any verdict fails, even alongside unverifiable ones", () => {
    const row = verifyRecords([cleanRecord({ email: "", hours: "whenever" })]).rows[0]!;
    expect(row.counts).toMatchObject({ fail: 1, unverifiable: 1 });
    expect(row.status).toBe("needs review");
  });

  it("colors a cell by its worst verdict", () => {
    const row = verifyRecords([cleanRecord({ email: "shop@mail.example" })]).rows[0]!;
    expect(cellStatus(row.verdicts.filter((v) => v.field === "email"))).toBe("unverifiable");
    expect(cellStatus([])).toBeNull();
  });
});

describe("exports", () => {
  it("results.csv has one line per verdict and a source on each", () => {
    const rows = parseCsv(toResultsCsv(result));
    expect(rows[0]).toEqual(["id", "row_status", "field", "rule_id", "status", "message", "evidence", "source"]);
    expect(rows.length - 1).toBe(800 + 19 + 15);
    expect(rows.slice(1).every((r) => r[7]!.length > 0)).toBe(true);
  });

  it("results.json carries the summary and all rows", () => {
    const json = JSON.parse(toResultsJson(result));
    expect(json.summary.needsReview).toBe(18);
    expect(json.rows).toHaveLength(60);
    expect(formatSummary(result)).toMatch(/needs review\s+18/);
  });
});
