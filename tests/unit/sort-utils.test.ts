import { describe, it, expect } from "vitest";
import {
  dateSortComparator,
  getYearsFromItems,
  normalizeSlug,
} from "../../src/lib/sort-utils";

describe("sort-utils", () => {
  describe("normalizeSlug", () => {
    it("should remove .md and .mdx extensions", () => {
      expect(normalizeSlug("post.md")).toBe("post");
      expect(normalizeSlug("project.mdx")).toBe("project");
      expect(normalizeSlug("nested/file.md")).toBe("nested/file");
    });

    it("should handle null or undefined", () => {
      expect(normalizeSlug(null)).toBe("");
      expect(normalizeSlug(undefined)).toBe("");
    });
  });

  describe("dateSortComparator", () => {
    const itemA = { startDate: "2023-01-01", endDate: "2023-12-31" };
    const itemB = { startDate: "2022-01-01", endDate: "2022-12-31" };
    const itemPresent = { startDate: "2023-01-01", endDate: "9999-12-31" };

    it("should sort by end date descending (experience mode)", () => {
      // B ends before A, so A should come first in desc
      expect(
        dateSortComparator(itemA, itemB, "desc", "end-first"),
      ).toBeLessThan(0);
      expect(
        dateSortComparator(itemB, itemA, "desc", "end-first"),
      ).toBeGreaterThan(0);
    });

    it("should handle 'Present' as latest date", () => {
      expect(
        dateSortComparator(itemPresent, itemA, "desc", "end-first"),
      ).toBeLessThan(0);
      expect(
        dateSortComparator(itemA, itemPresent, "desc", "end-first"),
      ).toBeGreaterThan(0);
    });

    it("should sort by start date descending (project mode)", () => {
      const itemEarly = { startDate: "2020-01-01" };
      const itemLate = { startDate: "2021-01-01" };
      expect(
        dateSortComparator(itemLate, itemEarly, "desc", "start-first"),
      ).toBeLessThan(0);
    });
  });

  describe("getYearsFromItems", () => {
    it("should extract unique years and 'Present'", () => {
      const items = [
        { startDate: "2021-06-01", endDate: "2022-06-01" },
        { date: "2023-06-01" },
        { startDate: "2020-06-01", endDate: "9999-12-31" },
      ];
      const years = getYearsFromItems(items);
      expect(years).toContain("2021");
      expect(years).toContain("2022");
      expect(years).toContain("2023");
      expect(years).toContain("2020");
      expect(years).toContain("Present");
    });

    it("should be sorted: Present first, then descending years", () => {
      const items = [
        { date: "2021-06-01" },
        { date: "2023-06-01" },
        { date: "9999-12-31" },
      ];
      const years = getYearsFromItems(items);
      expect(years).toEqual(["Present", "2023", "2021"]);
    });
  });
});
