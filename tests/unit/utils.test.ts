import { describe, it, expect } from "vitest";
import {
  parseSafeDate,
  isSentinelEnd,
  formatMonthYear,
  sanitizeStringForUI,
} from "../../src/lib/utils";

describe("utils", () => {
  describe("parseSafeDate", () => {
    it("should parse ISO strings", () => {
      const d = parseSafeDate("2023-06-01");
      expect(d?.getUTCFullYear()).toBe(2023);
      expect(d?.getUTCMonth()).toBe(5); // June
    });

    it("should parse Date objects", () => {
      const input = new Date(2022, 5, 1);
      const d = parseSafeDate(input);
      expect(d?.getTime()).toBe(input.getTime());
    });

    it("should return null for invalid strings", () => {
      expect(parseSafeDate("not-a-date")).toBeNull();
    });

    it("should return null for null/undefined", () => {
      expect(parseSafeDate(null)).toBeNull();
      expect(parseSafeDate(undefined)).toBeNull();
    });
  });

  describe("isSentinelEnd", () => {
    it("should detect 'Present' (year 9999)", () => {
      expect(isSentinelEnd("9999-12-31")).toBe(true);
    });

    it("should return false for normal dates", () => {
      expect(isSentinelEnd("2023-01-01")).toBe(false);
    });

    it("should handle null/invalid", () => {
      expect(isSentinelEnd(null)).toBe(false);
      expect(isSentinelEnd("invalid")).toBe(false);
    });
  });

  describe("formatMonthYear", () => {
    it("should format dates correctly", () => {
      const d = new Date(2023, 0, 15);
      expect(formatMonthYear(d)).toBe("January 2023");
    });

    it("should return empty string for invalid dates", () => {
      expect(formatMonthYear(new Date(NaN))).toBe("");
    });
  });

  describe("sanitizeStringForUI", () => {
    it("should trim strings", () => {
      expect(sanitizeStringForUI("  hello  ")).toBe("hello");
    });

    it("should join arrays with commas", () => {
      expect(sanitizeStringForUI(["React", "Astro"])).toBe("React, Astro");
    });

    it("should return empty string for null", () => {
      expect(sanitizeStringForUI(null)).toBe("");
    });
  });
});
