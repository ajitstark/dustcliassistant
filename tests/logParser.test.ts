import { describe, expect, test } from "vitest";
import { parseLogChunk } from "../src/parsers/logParser.js";

describe("parseLogChunk", () => {
  test("parses common format + stack", () => {
    const ev = parseLogChunk(
      [
        "2026-05-17 12:00:00.123 ERROR [api] Redis timeout",
        "at redis.connect (/app/node_modules/ioredis/index.js:12:3)",
        "at main (/app/src/index.ts:10:1)"
      ],
      "server.log"
    );
    expect(ev).toBeTruthy();
    expect(ev!.severity).toBe("ERROR");
    expect(ev!.service).toBe("api");
    expect(ev!.tags).toContain("redis");
    expect(ev!.stack?.frames[0]?.file).toContain("ioredis");
  });

  test("parses json logs", () => {
    const ev = parseLogChunk([`{"time":"2026-05-17T00:00:00Z","level":"error","service":"api","msg":"ECONNREFUSED 127.0.0.1:6379"}`]);
    expect(ev).toBeTruthy();
    expect(ev!.severity).toBe("ERROR");
    expect(ev!.service).toBe("api");
    expect(ev!.tags).toContain("conn_refused");
  });
});

