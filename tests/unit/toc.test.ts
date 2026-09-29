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

  it("should be a no-op when the container is already initialised", () => {
    // The controller is registered on both DOMContentLoaded and astro:page-load, so
    // it can run twice against one document. Without the guard the second pass would
    // attach a second set of listeners and make the toggle fire twice.
    const container = {
      dataset: { tocInit: "1" },
      querySelector: vi.fn().mockReturnValue(null),
    };
    const querySelector = vi.fn().mockReturnValue(container);
    vi.stubGlobal("document", {
      querySelector,
      querySelectorAll: vi.fn().mockReturnValue([]),
      getElementById: vi.fn().mockReturnValue(null),
      addEventListener: vi.fn(),
    });

    initToc();

    expect(querySelector).toHaveBeenCalledWith(".project-toc");
    // The guard must return before doing any further DOM work.
    expect(container.querySelector).not.toHaveBeenCalled();
    expect(document.querySelectorAll).not.toHaveBeenCalled();
  });
});
