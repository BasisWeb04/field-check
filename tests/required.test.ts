import { describe, expect, it } from "vitest";
import { checkPresence, checkRequired } from "../src/core/rules/required";
import { cleanRecord } from "./helpers";

describe("required", () => {
  it("passes a filled required field", () => {
    expect(checkPresence("city", "Denver")?.status).toBe("pass");
  });

  it("fails a blank or whitespace-only required field", () => {
    expect(checkPresence("phone", "   ")?.status).toBe("fail");
  });

  it("marks a blank optional field unverifiable, never pass", () => {
    const v = checkPresence("website", "");
    expect(v?.status).toBe("unverifiable");
    expect(v?.ruleId).toBe("required");
  });

  it("leaves a filled optional field to its format rule", () => {
    expect(checkPresence("email", "a@b.example")).toBeNull();
    expect(checkRequired(cleanRecord()).map((v) => v.field)).toEqual([
      "business_name",
      "phone",
      "street",
      "city",
      "state",
      "zip",
    ]);
  });
});
