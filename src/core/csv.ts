import { FIELDS, INPUT_COLUMNS, type BusinessRecord } from "./types";

/** RFC 4180 style parser: quoted fields may hold commas, doubled quotes and line breaks. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  // Strip a UTF-8 byte order mark that spreadsheet exports often add.
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (inQuotes) throw new CsvError("Unclosed quoted field at end of input.");
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Blank lines carry no record and would otherwise become empty rows.
  return rows.filter((r) => !(r.length === 1 && r[0]!.trim() === ""));
}

export class CsvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvError";
  }
}

/** Maps CSV rows to records by header name; header match ignores case and surrounding spaces. */
export function toRecords(text: string): BusinessRecord[] {
  const rows = parseCsv(text);
  if (rows.length === 0) throw new CsvError("The CSV is empty.");
  const header = rows[0]!.map((h) => h.trim().toLowerCase());
  const missing = INPUT_COLUMNS.filter((col) => !header.includes(col));
  if (missing.length > 0) {
    throw new CsvError(`Missing column(s): ${missing.join(", ")}. Expected: ${INPUT_COLUMNS.join(", ")}.`);
  }
  if (rows.length === 1) throw new CsvError("The CSV has a header but no data rows.");
  const index = Object.fromEntries(INPUT_COLUMNS.map((col) => [col, header.indexOf(col)]));

  return rows.slice(1).map((cells, i) => {
    const record = { id: cells[index.id!] ?? "" } as BusinessRecord;
    for (const f of FIELDS) record[f] = cells[index[f]!] ?? "";
    if (record.id.trim() === "") record.id = `row-${i + 1}`;
    return record;
  });
}

function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map(escapeCell).join(",")).join("\n") + "\n";
}
