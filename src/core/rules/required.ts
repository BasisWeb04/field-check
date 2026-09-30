import { FIELDS, type BusinessRecord, type FieldName, type Verdict } from "../types";
import { isBlank, verdict } from "./verdict";

export const REQUIRED_FIELDS: readonly FieldName[] = ["business_name", "phone", "street", "city", "state", "zip"];

/**
 * Required fields get pass or fail. A blank optional field gets "unverifiable" because there is nothing
 * to check; a filled optional field is left to its format rule.
 */
export function checkPresence(field: FieldName, value: string): Verdict | null {
  const required = REQUIRED_FIELDS.includes(field);
  if (!isBlank(value)) {
    return required ? verdict(field, "required", "pass", "Required field is present.", `"${value.trim()}"`) : null;
  }
  return required
    ? verdict(field, "required", "fail", "Required field is blank.", "empty value")
    : verdict(field, "required", "unverifiable", "Optional field is blank, so there is nothing to verify.", "empty value");
}

export function checkRequired(record: BusinessRecord): Verdict[] {
  return FIELDS.map((f) => checkPresence(f, record[f])).filter((v): v is Verdict => v !== null);
}
