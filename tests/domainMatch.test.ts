import { describe, expect, it } from "vitest";
import { FICTIONAL_FREE_MAIL_DOMAINS, FREE_MAIL_DOMAINS } from "../src/core/reference/freemail";
import { checkDomainMatch, registrableDomain } from "../src/core/rules/domainMatch";

describe("email.domain-match", () => {
  it("passes an exact match", () => {
    expect(checkDomainMatch("a@quill.example", "https://quill.example")?.status).toBe("pass");
  });

  it("passes when email and website are subdomains of the same domain", () => {
    expect(checkDomainMatch("a@mail.quill.example", "https://www.quill.example")?.status).toBe("pass");
    expect(registrableDomain("a.b.quill.example")).toBe("quill.example");
  });

  it("fails when the domains differ", () => {
    const v = checkDomainMatch("studio@kestrelyoga.example", "https://kestrelloft.example");
    expect(v?.status).toBe("fail");
    expect(v?.evidence).toBe("email domain kestrelyoga.example, website host kestrelloft.example");
  });

  it("marks a free-mail address unverifiable, not fail", () => {
    const v = checkDomainMatch("shop@mail.example", "https://quill.example");
    expect(v?.status).toBe("unverifiable");
    expect(v?.message).toMatch(/free-mail/);
  });

  it("knows the fictional free-mail domains and still lists real providers for production data", () => {
    for (const d of FICTIONAL_FREE_MAIL_DOMAINS) expect(FREE_MAIL_DOMAINS.has(d), d).toBe(true);
    expect(checkDomainMatch("shop@inbox.example", "https://quill.example")?.status).toBe("unverifiable");
    expect(FREE_MAIL_DOMAINS.has("gmail.com")).toBe(true);
  });

  it("marks a missing website unverifiable", () => {
    expect(checkDomainMatch("a@quill.example", "")?.status).toBe("unverifiable");
  });

  it("returns null when the email or website is itself invalid", () => {
    expect(checkDomainMatch("a@@quill.example", "https://quill.example")).toBeNull();
    expect(checkDomainMatch("", "https://quill.example")).toBeNull();
    expect(checkDomainMatch("a@quill.example", "http//quill.example")).toBeNull();
  });
});
