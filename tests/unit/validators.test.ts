import { describe, it, expect } from "vitest";
import { createArticleSchema } from "@/lib/validators/article";

const valid = {
  title: "Arsenal Win",
  excerpt: "A short summary",
  content: { type: "doc", content: [] },
  categoryId: "cat_123",
  status: "DRAFT",
};

describe("createArticleSchema", () => {
  it("accepts a valid payload", () => {
    expect(createArticleSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects empty title", () => {
    const r = createArticleSchema.safeParse({ ...valid, title: "" });
    expect(r.success).toBe(false);
  });
  it("rejects invalid status", () => {
    const r = createArticleSchema.safeParse({ ...valid, status: "LIVE" });
    expect(r.success).toBe(false);
  });
  it("defaults status to DRAFT when omitted", () => {
    const { status, ...rest } = valid;
    void status;
    const r = createArticleSchema.safeParse(rest);
    expect(r.success && r.data.status).toBe("DRAFT");
  });
});
