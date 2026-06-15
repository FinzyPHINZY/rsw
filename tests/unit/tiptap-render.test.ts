import { describe, it, expect } from "vitest";
import { renderTiptap } from "@/lib/tiptap-render";

describe("renderTiptap", () => {
  it("renders paragraphs and headings", () => {
    const html = renderTiptap({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Hello" }] },
        { type: "paragraph", content: [{ type: "text", text: "World" }] },
      ],
    });
    expect(html).toContain("<h2>Hello</h2>");
    expect(html).toContain("<p>World</p>");
  });

  it("applies bold, italic, and link marks", () => {
    const html = renderTiptap({
      type: "doc",
      content: [
        { type: "paragraph", content: [
          { type: "text", text: "b", marks: [{ type: "bold" }] },
          { type: "text", text: "i", marks: [{ type: "italic" }] },
          { type: "text", text: "L", marks: [{ type: "link", attrs: { href: "https://x.com" } }] },
        ] },
      ],
    });
    expect(html).toContain("<strong>b</strong>");
    expect(html).toContain("<em>i</em>");
    expect(html).toContain('<a href="https://x.com">L</a>');
  });

  it("renders lists and images and escapes text", () => {
    const html = renderTiptap({
      type: "doc",
      content: [
        { type: "bulletList", content: [
          { type: "listItem", content: [
            { type: "paragraph", content: [{ type: "text", text: "a & b" }] },
          ] },
        ] },
        { type: "image", attrs: { src: "/uploads/x.png", alt: "pic" } },
      ],
    });
    expect(html).toContain("<ul><li><p>a &amp; b</p></li></ul>");
    expect(html).toContain('<img src="/uploads/x.png" alt="pic">');
  });
});
