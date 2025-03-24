import { describe, it, expect } from "vitest";
import { formatDuration } from "@/lib/utils";

describe("formatDuration utility", () => {
  it("formats seconds correctly", () => {
    expect(formatDuration(30)).toBe("30s");
    expect(formatDuration(1)).toBe("1s");
    expect(formatDuration(59)).toBe("59s");
  });

  it("formats minutes correctly", () => {
    expect(formatDuration(60)).toBe("1m");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(120)).toBe("2m");
    expect(formatDuration(3599)).toBe("59m 59s");
  });

  it("formats hours correctly", () => {
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(3660)).toBe("1h 1m");
    expect(formatDuration(7200)).toBe("2h");
    expect(formatDuration(7260)).toBe("2h 1m");
  });
});
