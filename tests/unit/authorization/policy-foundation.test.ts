import { describe, expect, it } from "vitest";
import {
  getAccountStateReason,
  isAccountBlocked,
} from "@/lib/authorization/account-state";
import {
  hasStudioGlobalRole,
  isGlobalAdminRole,
} from "@/lib/authorization/global-role";

describe("CF-03-F authorization foundation", () => {
  describe("global roles", () => {
    it("treats ADMIN and SUPER_ADMIN as global administrators", () => {
      expect(isGlobalAdminRole("ADMIN")).toBe(true);
      expect(isGlobalAdminRole("SUPER_ADMIN")).toBe(true);
      expect(isGlobalAdminRole("USER")).toBe(false);
      expect(isGlobalAdminRole("MODERATOR")).toBe(false);
    });

    it("treats ADMIN, SUPER_ADMIN and RADIO_HOST as global Studio roles", () => {
      expect(hasStudioGlobalRole("ADMIN")).toBe(true);
      expect(hasStudioGlobalRole("SUPER_ADMIN")).toBe(true);
      expect(hasStudioGlobalRole("RADIO_HOST")).toBe(true);
      expect(hasStudioGlobalRole("USER")).toBe(false);
    });
  });

  describe("account state", () => {
    it("blocks banned accounts", () => {
      const state = { isBanned: true, isSuspended: false };
      expect(isAccountBlocked(state)).toBe(true);
      expect(getAccountStateReason(state)).toBe("Account is banned");
    });

    it("blocks suspended accounts", () => {
      const state = { isBanned: false, isSuspended: true };
      expect(isAccountBlocked(state)).toBe(true);
      expect(getAccountStateReason(state)).toBe("Account is suspended");
    });

    it("allows active accounts", () => {
      const state = { isBanned: false, isSuspended: false };
      expect(isAccountBlocked(state)).toBe(false);
      expect(getAccountStateReason(state)).toBeNull();
    });
  });
});
