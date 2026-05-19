import { describe, expect, test } from "vitest";
import { groupErrors } from "../src/services/grouping.js";
import type { ParsedLogEvent } from "../src/types/log.js";

describe("groupErrors", () => {
  test("groups similar errors", () => {
    const events: ParsedLogEvent[] = [
      { severity: "ERROR", message: "Redis timeout", raw: "Redis timeout", tags: ["redis"] },
      { severity: "ERROR", message: "Redis timeout", raw: "Redis timeout", tags: ["redis"] },
      { severity: "ERROR", message: "Postgres timeout", raw: "Postgres timeout", tags: ["postgres"] }
    ];
    const groups = groupErrors(events);
    expect(groups.length).toBe(2);
    expect(groups[0]!.count).toBe(2);
  });
});

