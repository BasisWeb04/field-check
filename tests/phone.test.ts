import { describe, expect, it } from "vitest";
import { checkPhone, isFictionalLine, normalizePhone } from "../src/core/rules/phone";

const status = (raw: string) => checkPhone(raw)?.status;

describe("phone.nanp", () => {
  it("passes common formats of a valid number", () => {
    for (const raw of ["(303) 555-0142", "303.555.0142", "303-555-0142", "3035550142"]) {
      expect(status(raw), raw).toBe("pass");
    }
  });

  it("strips a +1 country code and keeps the extension", () => {
    expect(normalizePhone("+1 303 555 0142 ext. 12")).toEqual({ digits: "3035550142", extension: "12" });
    expect(checkPhone("1-303-555-0142 x7")?.evidence).toBe("normalized (303) 555-0142 ext 7");
  });

  it("passes the 555-0100 to 555-0199 range and names it as reserved for fictional use", () => {
    for (const raw of ["(505) 555-0100", "(505) 555-0199", "(212) 555-0142"]) {
      const v = checkPhone(raw);
      expect(v?.status, raw).toBe("pass");
      expect(v?.message, raw).toMatch(/reserved for fictional use/);
    }
  });

  it("limits the fictional range to exchange 555, lines 0100 to 0199", () => {
    expect(isFictionalLine("555", "0100")).toBe(true);
    expect(isFictionalLine("555", "0199")).toBe(true);
    expect(isFictionalLine("555", "0099")).toBe(false);
    expect(isFictionalLine("555", "0200")).toBe(false);
    expect(isFictionalLine("556", "0142")).toBe(false);
  });

  it("fails the wrong number of digits", () => {
    expect(checkPhone("555-0142")?.message).toMatch(/found 7/);
    expect(checkPhone("515-555-016")?.message).toMatch(/found 9/);
  });

  it("fails an area code starting with 0 or 1", () => {
    expect(status("(123) 555-0142")).toBe("fail");
    expect(checkPhone("(050) 555-0142")?.message).toMatch(/starts with 0/);
  });

  it("fails an N11 area code", () => {
    expect(checkPhone("(411) 555-0142")?.message).toMatch(/N11/);
  });

  it("fails an area code with 9 as the middle digit", () => {
    expect(checkPhone("(596) 555-0142")?.message).toMatch(/reserves for expansion/);
  });

  it("fails an N11 exchange and an exchange starting with 1", () => {
    expect(checkPhone("(614) 911-0142")?.message).toMatch(/Exchange 911 is an N11/);
    expect(checkPhone("(614) 191-0142")?.message).toMatch(/Exchange 191 starts with 1/);
  });

  it("fails letters and returns null for blank", () => {
    expect(status("303-CALL-NOW")).toBe("fail");
    expect(checkPhone("(614) 555-PIPE")?.message).toMatch(/letters/);
    expect(checkPhone("")).toBeNull();
  });
});
