import type { BusinessRecord } from "../src/core/types";

/** A record that passes every rule; tests override one field at a time. */
export function cleanRecord(overrides: Partial<BusinessRecord> = {}): BusinessRecord {
  return {
    id: "T-1",
    business_name: "Quill and Ember Stationers",
    phone: "(303) 555-0142",
    email: "desk@quillember.example",
    website: "https://quillember.example",
    street: "100 Test St",
    city: "Denver",
    state: "CO",
    zip: "80202",
    hours: "Mon-Fri 9:00-17:00",
    ...overrides,
  };
}
