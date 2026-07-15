import { describe, it, expect } from "vitest";
import {
  createChurchSchema,
  createPostSchema,
  createEventSchema,
} from "@/lib/validators/schemas";

describe("createChurchSchema", () => {
  it("accepts a minimal valid church", () => {
    const result = createChurchSchema.safeParse({ name: "Grace", slug: "grace" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = createChurchSchema.safeParse({ name: "", slug: "grace" });
    expect(result.success).toBe(false);
  });

  it("rejects a slug shorter than 3 characters", () => {
    const result = createChurchSchema.safeParse({ name: "Grace", slug: "gr" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = createChurchSchema.safeParse({
      name: "Grace",
      slug: "grace",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields when valid", () => {
    const result = createChurchSchema.safeParse({
      name: "Grace",
      slug: "grace",
      email: "hello@grace.org",
      website: "https://grace.org",
      city: "Paris",
    });
    expect(result.success).toBe(true);
  });
});

describe("createPostSchema", () => {
  it("accepts a valid post", () => {
    const result = createPostSchema.safeParse({ churchId: "c1", content: "Hello" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty content", () => {
    const result = createPostSchema.safeParse({ churchId: "c1", content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing churchId", () => {
    const result = createPostSchema.safeParse({ content: "Hello" });
    expect(result.success).toBe(false);
  });
});

describe("createEventSchema", () => {
  it("accepts a valid event", () => {
    const result = createEventSchema.safeParse({
      churchId: "c1",
      title: "Sunday Service",
      startDate: "2026-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing title", () => {
    const result = createEventSchema.safeParse({
      churchId: "c1",
      startDate: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing startDate", () => {
    const result = createEventSchema.safeParse({
      churchId: "c1",
      title: "Sunday Service",
    });
    expect(result.success).toBe(false);
  });
});
