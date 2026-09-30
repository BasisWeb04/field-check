import { describe, expect, it } from "vitest";
import { checkEmail, emailDomain } from "../src/core/rules/email";

const status = (raw: string) => checkEmail(raw)?.status;

describe("email.syntax", () => {
  it("passes ordinary and plus-tagged addresses", () => {
    expect(status("orders@harborline.example")).toBe("pass");
    expect(status("first.last+tag@mail.shop.example")).toBe("pass");
    expect(emailDomain("Desk@Quill.Example")).toBe("quill.example");
  });

  it("fails a doubled or missing @", () => {
    expect(checkEmail("orders@@kettleworks.example")?.message).toMatch(/exactly one @/);
    expect(status("sales.bramble.example")).toBe("fail");
  });

  it("fails a domain without a top-level domain", () => {
    expect(status("owner@bramble")).toBe("fail");
  });

  it("fails spaces and consecutive dots in the local part", () => {
    expect(status("front desk@x.example")).toBe("fail");
    expect(status("a..b@x.example")).toBe("fail");
  });

  it("returns null for blank so the presence rule speaks instead", () => {
    expect(checkEmail("  ")).toBeNull();
  });
});
