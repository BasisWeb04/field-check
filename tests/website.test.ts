import { describe, expect, it } from "vitest";
import { checkWebsite, websiteHost } from "../src/core/rules/website";

const status = (raw: string) => checkWebsite(raw)?.status;

describe("website.syntax", () => {
  it("passes http and https URLs with paths", () => {
    expect(status("https://quillember.example/shop?x=1")).toBe("pass");
    expect(status("http://redcedar.example")).toBe("pass");
  });

  it("passes a bare host and reports the host without www", () => {
    expect(status("www.quillember.example")).toBe("pass");
    expect(websiteHost("https://WWW.Quillember.example/")).toBe("quillember.example");
  });

  it("says in the message that reachability is not checked", () => {
    expect(checkWebsite("quillember.example")?.message).toMatch(/not checked offline/);
  });

  it("fails a missing colon or single slash after the scheme", () => {
    expect(status("http//copperpotsoup.example")).toBe("fail");
    expect(checkWebsite("https:/copperpot.example")?.message).toMatch(/followed by \/\//);
  });

  it("fails other schemes, whitespace and hosts without a TLD", () => {
    expect(status("ftp://files.example")).toBe("fail");
    expect(status("www.copper leaf.example")).toBe("fail");
    expect(status("https://copperleaf")).toBe("fail");
  });

  it("fails bad host labels and returns null for blank", () => {
    expect(status("https://-bad-.example")).toBe("fail");
    expect(status("https://shop..example")).toBe("fail");
    expect(checkWebsite("")).toBeNull();
  });
});
