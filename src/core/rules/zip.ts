import { statesForPrefix } from "../reference/zip3";
import type { Verdict } from "../types";
import { isBlank, verdict } from "./verdict";

const ZIP_FORMAT = /^\d{5}(?:-\d{4})?$/;

export function checkZipFormat(raw: string): Verdict | null {
  if (isBlank(raw)) return null;
  const value = raw.trim();
  if (ZIP_FORMAT.test(value)) {
    return verdict("zip", "zip.format", "pass", "ZIP format is valid.", `"${value}"`);
  }
  return verdict("zip", "zip.format", "fail", "ZIP must be 5 digits or ZIP+4 (12345-6789).", `"${value}"`);
}

/** Null when the ZIP is malformed or the state is blank; those are reported by other rules. */
export function checkZipState(rawZip: string, rawState: string): Verdict | null {
  const zip = rawZip.trim();
  const state = rawState.trim().toUpperCase();
  if (!ZIP_FORMAT.test(zip) || state === "") return null;
  const prefix = zip.slice(0, 3);
  const states = statesForPrefix(prefix);
  if (!states) {
    return verdict("zip", "zip.state", "unverifiable", `Prefix ${prefix} is not in the reference table, so the state cannot be confirmed.`, `prefix ${prefix}, stated ${state}`);
  }
  const evidence = `prefix ${prefix} -> ${states.join("/")}, stated ${state}`;
  if (states.includes(state)) {
    return verdict("zip", "zip.state", "pass", `ZIP prefix ${prefix} belongs to ${state}.`, evidence);
  }
  return verdict("zip", "zip.state", "fail", `ZIP prefix ${prefix} belongs to ${states.join("/")}, but the row says ${state}.`, evidence);
}
