/** Fictional free-mail providers for the sample data, so the public demo never shows a real mailbox address. */
export const FICTIONAL_FREE_MAIL_DOMAINS = ["mail.example", "inbox.example"] as const;

/** Real consumer mailbox providers, matched exactly like the fictional ones when checking production data. */
const REAL_FREE_MAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "zoho.com",
  "comcast.net",
  "att.net",
  "verizon.net",
];

/** Consumer mailbox providers: an address here says nothing about which website the business owns. */
export const FREE_MAIL_DOMAINS: ReadonlySet<string> = new Set([...REAL_FREE_MAIL_DOMAINS, ...FICTIONAL_FREE_MAIL_DOMAINS]);
