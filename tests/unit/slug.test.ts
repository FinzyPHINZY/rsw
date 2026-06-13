import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and dashes", () => {
    expect(slugify("Arsenal Beat Chelsea 2-1")).toBe("arsenal-beat-chelsea-2-1");
  });
  it("strips punctuation and collapses spaces", () => {
    expect(slugify("  Hello,   World!! ")).toBe("hello-world");
  });
});

describe("uniqueSlug", () => {
  it("returns base when not taken", async () => {
    const result = await uniqueSlug("hello-world", async () => false);
    expect(result).toBe("hello-world");
  });
  it("suffixes when taken", async () => {
    const taken = new Set(["hello-world", "hello-world-2"]);
    const result = await uniqueSlug("hello-world", async (s) => taken.has(s));
    expect(result).toBe("hello-world-3");
  });
});
