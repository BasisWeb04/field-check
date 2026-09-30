import type { Verdict } from "../types";
import { hostProblem } from "./host";
import { isBlank, verdict } from "./verdict";

const LOCAL_PART = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;

/** Returns the lower-cased domain of a syntactically valid address, or null. */
export function emailDomain(raw: string): string | null {
  return checkEmail(raw)?.status === "pass" ? raw.trim().split("@")[1]!.toLowerCase() : null;
}

export function checkEmail(raw: string): Verdict | null {
  if (isBlank(raw)) return null;
  const value = raw.trim();
  const fail = (message: string) => verdict("email", "email.syntax", "fail", message, `"${value}"`);

  const at = value.split("@");
  if (at.length !== 2) return fail(`Expected exactly one @, found ${at.length - 1}.`);
  const [local, domain] = at as [string, string];
  if (local.length === 0) return fail("Nothing before the @.");
  if (local.length > 64) return fail("Local part is longer than 64 characters.");
  if (!LOCAL_PART.test(local)) return fail(`Local part "${local}" has spaces, consecutive dots or characters outside RFC 5322 atoms.`);
  const problem = hostProblem(domain);
  if (problem) return fail(`Domain is not valid: ${problem}.`);
  return verdict("email", "email.syntax", "pass", "Address syntax is valid. Deliverability is not checked offline.", `domain ${domain.toLowerCase()}`);
}
