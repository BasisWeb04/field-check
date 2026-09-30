import { FREE_MAIL_DOMAINS } from "../reference/freemail";
import type { Verdict } from "../types";
import { emailDomain } from "./email";
import { isBlank, verdict } from "./verdict";
import { websiteHost } from "./website";

/** Last two labels. US directory data rarely uses multi-part public suffixes such as co.uk. */
export function registrableDomain(host: string): string {
  return host.toLowerCase().split(".").slice(-2).join(".");
}

/** Null when the email is blank or invalid, or the website is invalid: other rules already report those. */
export function checkDomainMatch(email: string, website: string): Verdict | null {
  const domain = emailDomain(email);
  if (!domain) return null;
  const v = (status: "pass" | "fail" | "unverifiable", message: string, evidence: string) =>
    verdict("email", "email.domain-match", status, message, evidence);

  if (FREE_MAIL_DOMAINS.has(domain)) {
    return v("unverifiable", `${domain} is a free-mail provider, so it cannot confirm which website the business owns.`, `email domain ${domain}`);
  }
  if (isBlank(website)) {
    return v("unverifiable", "No website to compare the email domain against.", `email domain ${domain}, website blank`);
  }
  const host = websiteHost(website);
  if (!host) return null;
  const evidence = `email domain ${domain}, website host ${host}`;
  if (registrableDomain(domain) === registrableDomain(host)) {
    return v("pass", "Email domain and website host share the same registrable domain.", evidence);
  }
  return v("fail", "Email domain differs from the website domain; one of them may belong to another business.", evidence);
}
