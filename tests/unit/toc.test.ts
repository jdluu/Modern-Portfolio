import { describe, it, expect, vi, beforeEach } from "vitest";
import { initToc } from "../../src/scripts/toc";

describe("TOC Controller", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      querySelector: vi.fn().mockReturnValue(null),
      querySelectorAll: vi.fn().mockReturnValue([]),
      getElementById: vi.fn().mockReturnValue(null),
      addEventListener: vi.fn(),
    });
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
      }),
    });
  });

  it("should not crash if TOC elements are missing", () => {
    expect(() => initToc()).not.toThrow();
  });

  it("should return early if project-toc is not found", () => {
    initToc();
    expect(document.querySelector).toHaveBeenCalledWith(".project-toc");
  });
});
