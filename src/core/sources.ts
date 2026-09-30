import type { RuleId } from "./types";

/** Where each rule's truth comes from. Every verdict carries one of these, so a reviewer can check the basis. */
export const RULE_SOURCES: Record<RuleId, string> = {
  required: "Field policy in src/core/rules/required.ts: business_name, phone, street, city, state and zip are required",
  "phone.nanp":
    "NANP numbering rules (NANPA): NPA and NXX start with 2-9, N11 codes are service codes, NPA middle digit 9 is reserved, 555-0100 to 555-0199 is reserved for fictional use and passes as such",
  "email.syntax": "Practical subset of RFC 5322 address syntax with RFC 1035 host labels, src/core/rules/email.ts",
  "website.syntax": "WHATWG URL parsing plus RFC 1035 host label rules, src/core/rules/website.ts",
  "email.domain-match":
    "Comparison of the email domain with the website host in the same row; free-mail list in src/core/reference/freemail.ts. " +
    "The sample data uses the fictional free-mail domains mail.example and inbox.example; real webmail providers on that list are matched the same way in production use",
  "zip.format": "USPS ZIP Code format: 5 digits, or ZIP+4 as 5 digits, hyphen, 4 digits",
  "zip.state": "USPS ZIP prefix to state table, data/zip3-state.json",
  "hours.parse": "Weekly hours grammar in src/core/rules/hours.ts",
  duplicate: "Within-file comparison of normalized business_name plus normalized phone digits",
};

export const RULE_LABELS: Record<RuleId, string> = {
  required: "Required field present",
  "phone.nanp": "Phone is valid NANP",
  "email.syntax": "Email syntax",
  "website.syntax": "Website URL syntax",
  "email.domain-match": "Email domain matches website",
  "zip.format": "ZIP format",
  "zip.state": "ZIP prefix matches state",
  "hours.parse": "Hours parse to a weekly schedule",
  duplicate: "Not a duplicate row",
};
