import { describe, it, expect } from "vitest";
import {
  containsBannedWord,
  containsSpamPattern,
  isContentInappropriate,
  filterContent,
} from "@/lib/content-filter";

describe("containsBannedWord", () => {
  it("returns false for clean content", () => {
    expect(containsBannedWord("God bless this community")).toBe(false);
  });

  it("detects a banned word regardless of case", () => {
    expect(containsBannedWord("This is SHIT")).toBe(true);
    expect(containsBannedWord("you idiot")).toBe(true);
  });

  it("detects French banned words", () => {
    expect(containsBannedWord("quel connard")).toBe(true);
  });

  it("matches banned words even inside larger words (substring match)", () => {
    // "sex" is banned, and appears inside "sextet"
    expect(containsBannedWord("sextet performance")).toBe(true);
  });

  it("returns false for an empty string", () => {
    expect(containsBannedWord("")).toBe(false);
  });
});

describe("containsSpamPattern", () => {
  it("detects phone numbers", () => {
    expect(containsSpamPattern("call me at 123-456-7890")).toBe(true);
  });

  it("detects email addresses", () => {
    expect(containsSpamPattern("reach me at test@example.com")).toBe(true);
  });

  it("detects URLs", () => {
    expect(containsSpamPattern("visit https://example.com now")).toBe(true);
  });

  it("detects money amounts", () => {
    expect(containsSpamPattern("only $50 today")).toBe(true);
  });

  it("detects spam keywords", () => {
    expect(containsSpamPattern("claim your free prize")).toBe(true);
  });

  it("returns false for clean content", () => {
    expect(containsSpamPattern("Welcome to our Sunday service")).toBe(false);
  });
});

describe("isContentInappropriate", () => {
  it("is true when a banned word is present", () => {
    expect(isContentInappropriate("what a bitch")).toBe(true);
  });

  it("is true when a spam pattern is present", () => {
    expect(isContentInappropriate("email me at a@b.co")).toBe(true);
  });

  it("is false for clean content", () => {
    expect(isContentInappropriate("Join us for worship")).toBe(false);
  });
});

describe("filterContent", () => {
  it("masks banned words with asterisks of matching length", () => {
    const result = filterContent("you idiot");
    expect(result).toBe("you *****");
  });

  it("redacts spam patterns", () => {
    const result = filterContent("email me at test@example.com");
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("test@example.com");
  });

  it("leaves clean content unchanged", () => {
    const clean = "God bless this community";
    expect(filterContent(clean)).toBe(clean);
  });

  it("handles content with both banned words and spam", () => {
    const result = filterContent("idiot call 123-456-7890");
    expect(result).toContain("*****");
    expect(result).toContain("[REDACTED]");
  });
});
