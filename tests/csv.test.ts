import { describe, expect, it } from "vitest";
import { CsvError, parseCsv, toCsv, toRecords } from "../src/core/csv";

const HEADER = "id,business_name,phone,email,website,street,city,state,zip,hours";
// Built from its code point so the source file stays plain ASCII.
const BOM = String.fromCharCode(0xfeff);

describe("parseCsv", () => {
  it("handles quoted commas, doubled quotes and embedded newlines", () => {
    const rows = parseCsv('a,"b, c","say ""hi""","line1\nline2"\n');
    expect(rows).toEqual([["a", "b, c", 'say "hi"', "line1\nline2"]]);
  });

  it("accepts CRLF line endings, a byte order mark and skips blank lines", () => {
    expect(parseCsv(`${BOM}a,b\r\n\r\nc,d\r\n`)).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("rejects an unclosed quote", () => {
    expect(() => parseCsv('a,"b\n')).toThrow(CsvError);
  });

  it("round-trips through toCsv", () => {
    const rows = [
      ["x", 'He said "ok", then left'],
      ["multi\nline", ""],
    ];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });
});

describe("toRecords", () => {
  it("maps columns by header name regardless of order and case", () => {
    const text = "ZIP,Id,business_name,phone,email,website,street,city,state,hours\n80202,A-1,Name,,,,,,CO,\n";
    const [rec] = toRecords(text);
    expect(rec).toMatchObject({ id: "A-1", zip: "80202", business_name: "Name", state: "CO" });
  });

  it("names the missing columns", () => {
    expect(() => toRecords("id,business_name\nA,B\n")).toThrow(/Missing column\(s\): phone, email/);
  });

  it("rejects a header with no data rows", () => {
    expect(() => toRecords(`${HEADER}\n`)).toThrow(/no data rows/);
  });
});
