import { describe, it, expect } from "vitest";
import { readingTimeFromTiptap } from "@/lib/reading-time";

const doc = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

describe("readingTimeFromTiptap", () => {
  it("returns at least 1 minute for short text", () => {
    expect(readingTimeFromTiptap(doc("hello world"))).toBe(1);
  });

  it("rounds up at ~200 wpm", () => {
    const words = Array.from({ length: 450 }, () => "word").join(" ");
    expect(readingTimeFromTiptap(doc(words))).toBe(3); // ceil(450/200)
  });

  it("walks nested nodes and handles empty docs", () => {
    expect(readingTimeFromTiptap({ type: "doc", content: [] })).toBe(1);
    const nested = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title here" }] },
        { type: "bulletList", content: [
          { type: "listItem", content: [
            { type: "paragraph", content: [{ type: "text", text: "one two three" }] },
          ] },
        ] },
      ],
    };
    expect(readingTimeFromTiptap(nested)).toBe(1);
  });
});
