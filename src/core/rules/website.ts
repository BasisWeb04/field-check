import type { Verdict } from "../types";
import { hostProblem } from "./host";
import { isBlank, verdict } from "./verdict";

/** Returns the lower-cased host without a leading www., or null when the URL is not valid. */
export function websiteHost(raw: string): string | null {
  const v = checkWebsite(raw);
  if (v?.status !== "pass") return null;
  return parse(raw.trim())!.hostname.toLowerCase().replace(/^www\./, "");
}

function parse(value: string): URL | null {
  // Directory listings often omit the scheme; assume http for parsing only.
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `http://${value}`;
  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
}

export function checkWebsite(raw: string): Verdict | null {
  if (isBlank(raw)) return null;
  const value = raw.trim();
  const fail = (message: string) => verdict("website", "website.syntax", "fail", message, `"${value}"`);

  if (/\s/.test(value)) return fail("URL contains whitespace.");
  const url = parse(value);
  if (!url) return fail("URL cannot be parsed.");
  if (url.protocol !== "http:" && url.protocol !== "https:") return fail(`Scheme "${url.protocol}" is not http or https.`);
  // WHATWG parsing forgives "https:/host"; a directory entry should not.
  if (/^https?:/i.test(value) && !/^https?:\/\/[^/]/i.test(value)) return fail("Scheme must be followed by //.");
  if (url.username || url.password) return fail("URL embeds credentials.");
  const problem = hostProblem(url.hostname);
  if (problem) return fail(`Host is not valid: ${problem}.`);
  return verdict(
    "website",
    "website.syntax",
    "pass",
    "Well-formed http(s) URL. Reachability and ownership are not checked offline.",
    `host ${url.hostname.toLowerCase()}`,
  );
}
