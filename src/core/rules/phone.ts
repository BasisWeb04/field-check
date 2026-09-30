import type { Verdict } from "../types";
import { isBlank, verdict } from "./verdict";

export interface NormalizedPhone {
  digits: string;
  extension: string;
}

/** Strips punctuation, a leading +1 or 1 country code and a trailing extension (x, ext, #). */
export function normalizePhone(raw: string): NormalizedPhone {
  const [main = "", ext = ""] = raw.trim().toLowerCase().split(/\s*(?:ext\.?|extension|x|#)\s*/);
  let digits = main.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return { digits, extension: ext.replace(/\D/g, "") };
}

export function checkPhone(raw: string): Verdict | null {
  if (isBlank(raw)) return null;
  const fail = (message: string, evidence: string) => verdict("phone", "phone.nanp", "fail", message, evidence);

  if (/[a-wyz]/i.test(raw.replace(/ext\.?|extension/gi, ""))) {
    return fail("Phone contains letters.", `raw "${raw}"`);
  }
  const { digits, extension } = normalizePhone(raw);
  if (digits.length !== 10) {
    return fail(`Expected 10 digits after removing punctuation and country code, found ${digits.length}.`, `digits ${digits || "(none)"}`);
  }
  const npa = digits.slice(0, 3);
  const nxx = digits.slice(3, 6);
  const line = digits.slice(6);
  const shown = `NPA ${npa}, NXX ${nxx}, line ${line}`;

  if (!/^[2-9]/.test(npa)) return fail(`Area code ${npa} starts with ${npa[0]}; NANP area codes start with 2-9.`, shown);
  if (npa.slice(1) === "11") return fail(`Area code ${npa} is an N11 service code, not a geographic area code.`, shown);
  if (npa[1] === "9") return fail(`Area code ${npa} has 9 as its middle digit, which NANP reserves for expansion.`, shown);
  if (!/^[2-9]/.test(nxx)) return fail(`Exchange ${nxx} starts with ${nxx[0]}; NANP exchanges start with 2-9.`, shown);
  if (nxx.slice(1) === "11") return fail(`Exchange ${nxx} is an N11 service code.`, shown);

  const formatted = `(${npa}) ${nxx}-${line}${extension ? ` ext ${extension}` : ""}`;
  // The fictional range is well formed; naming it tells a reviewer the number is a safe sample, not a listing.
  const message = isFictionalLine(nxx, line)
    ? "Valid NANP number format, in 555-0100 to 555-0199, the range reserved for fictional use."
    : "Valid NANP number format. This does not prove the line is in service.";
  return verdict("phone", "phone.nanp", "pass", message, `normalized ${formatted}`);
}

/** True for exchange 555 with line 0100 to 0199, which NANPA reserves for fictional use in any area code. */
export function isFictionalLine(nxx: string, line: string): boolean {
  return nxx === "555" && /^01\d\d$/.test(line);
}
