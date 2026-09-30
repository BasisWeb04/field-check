import { describe, expect, it } from "vitest";
import { checkHours, parseHours } from "../src/core/rules/hours";

const status = (raw: string) => checkHours(raw)?.status;

describe("hours.parse", () => {
  it("parses ranges, closed days and split shifts into a schedule", () => {
    const p = parseHours("Mon-Thu 8:00-12:00, 13:00-17:00; Fri 8:00-13:00; Sun closed");
    expect(p.ok && p.schedule.Tue).toEqual([
      { open: "08:00", close: "12:00", overnight: false },
      { open: "13:00", close: "17:00", overnight: false },
    ]);
    expect(p.ok && p.schedule.Sun).toBe("closed");
    expect(p.ok && p.schedule.Sat).toBeUndefined();
  });

  it("parses 12-hour times and full day names", () => {
    const p = parseHours("Tuesday-Saturday 10am-7:30pm");
    expect(p.ok && p.schedule.Sat).toEqual([{ open: "10:00", close: "19:30", overnight: false }]);
  });

  it("accepts Daily, wrap-around day ranges and overnight hours", () => {
    expect(checkHours("Daily 6:30-18:00")?.message).toMatch(/7 of 7/);
    const p = parseHours("Fri-Mon 16:00-01:00");
    expect(p.ok && Object.keys(p.schedule)).toEqual(["Fri", "Sat", "Sun", "Mon"]);
    expect(checkHours("Fri-Mon 16:00-01:00")?.evidence).toMatch(/Fri 16:00-01:00 \(overnight\)/);
  });

  it("fails free text without days", () => {
    expect(status("9 to 5 weekdays")).toBe("fail");
    expect(status("call for hours")).toBe("fail");
  });

  it("fails impossible times", () => {
    expect(checkHours("Mon-Fri 9:00-25:00")?.message).toMatch(/hour above 23/);
    expect(status("Mon 9:75-17:00")).toBe("fail");
    expect(status("Mon 13pm-5pm")).toBe("fail");
  });

  it("fails ambiguous bare numbers", () => {
    expect(checkHours("Mon-Fri 9-5")?.message).toMatch(/ambiguous/);
  });

  it("fails a day listed twice and a zero-length interval", () => {
    expect(checkHours("Mon-Fri 9:00-17:00; Fri 10:00-12:00")?.message).toMatch(/Fri is listed more than once/);
    expect(status("Mon 9:00-9:00")).toBe("fail");
  });

  it("returns null for blank", () => {
    expect(checkHours("")).toBeNull();
  });
});
