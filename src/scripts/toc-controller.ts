export class TableOfContentsController {
  private tocElement: HTMLElement;
  private tocCard: HTMLElement | null;
  private tocList: HTMLElement | null;
  private tocToggle: HTMLElement | null;
  private tocLinks: HTMLAnchorElement[];
  private sections: HTMLElement[];
  private mediaQuery: MediaQueryList;

  private static readonly STORAGE_KEYS = {
    DESKTOP: "toc-collapsed-desktop",
    MOBILE: "toc-collapsed-mobile",
    LEGACY: "toc-collapsed",
  };

  private static readonly NAV_HEIGHT_VAR = "--nav-height";
  private static readonly DEFAULT_NAV_HEIGHT = 64;

  constructor(element: HTMLElement) {
    this.tocElement = element;
    this.tocCard = this.tocElement.querySelector(".toc-card");
    this.tocList = this.tocCard?.querySelector(".toc-list") || null;
    this.tocToggle =
      this.tocCard?.querySelector("#toc-toggle") ||
      document.getElementById("toc-toggle");
    this.tocLinks = Array.from(
      this.tocList?.querySelectorAll("a") || [],
    ) as HTMLAnchorElement[];
    this.sections = Array.from(
      document.querySelectorAll("section[id]"),
    ) as HTMLElement[];
    this.mediaQuery = window.matchMedia("(max-width: 980px)");

    this.init();
  }

  private init(): void {
    if (this.tocElement.dataset.tocInit === "1") return;
    this.tocElement.dataset.tocInit = "1";
    console.debug("[TOC] init: scoped controller attached");

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener("change", () => this.handleModeChange());
    } else if (this.mediaQuery.addListener) {
      this.mediaQuery.addListener(() => this.handleModeChange());
    }

    this.setupToggle();
    this.setupSmoothScroll();
    this.setupScrollSpy();
    this.handleModeChange(); // Initial layout and state application
  }

  /**
   * Layout & Positioning Logic
   */
  private applyTocPosition(): void {
    const isMobile = this.mediaQuery.matches;
    this.tocElement.style.position = "fixed";

    if (isMobile) {
      this.tocElement.style.top = "";
      this.tocElement.style.left = "";
      this.tocElement.style.right = "clamp(12px, 6vw, 24px)";
      this.tocElement.style.bottom = `calc(env(safe-area-inset-bottom, 0px) + var(--space-6))`;
      this.tocElement.style.zIndex = "200";
    } else {
      this.tocElement.style.bottom = "";
      this.tocElement.style.left = "";
      this.tocElement.style.top = `calc(var(--nav-height) + var(--space-6))`;
      this.tocElement.style.right = `clamp(18px, 6vw, 56px)`;
      this.tocElement.style.zIndex = "120";
    }
  }

  /**
   * State Management (Collapse/Expand)
   */
  private handleModeChange(): void {
    this.applyTocPosition();
    const isMobile = this.mediaQuery.matches;
    const key = isMobile
      ? TableOfContentsController.STORAGE_KEYS.MOBILE
      : TableOfContentsController.STORAGE_KEYS.DESKTOP;

    const saved = localStorage.getItem(key);
    if (saved === null) {
      // Default: collapsed on mobile, expanded on desktop
      this.setTocCollapsed(isMobile);
    } else {
      this.setTocCollapsed(saved === "1");
    }

    // Perform migration if needed (one-time check usually handled in setTocCollapsed but safe here too)
    this.migrateLegacyStorage();
  }

  private migrateLegacyStorage(): void {
    try {
      const isMobile = this.mediaQuery.matches;
      const legacy = localStorage.getItem(
        TableOfContentsController.STORAGE_KEYS.LEGACY,
      );
      if (legacy !== null) {
        // If we have legacy but no specific key, migrate
        const key = isMobile
          ? TableOfContentsController.STORAGE_KEYS.MOBILE
          : TableOfContentsController.STORAGE_KEYS.DESKTOP;

        if (localStorage.getItem(key) === null) {
          localStorage.setItem(
            key,
            isMobile ? (legacy === "1" ? "1" : "0") : "0",
          );
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  private setTocCollapsed(collapsed: boolean): void {
    if (!this.tocCard || !this.tocToggle) return;

    this.tocElement.classList.toggle("toc-collapsed", collapsed);
    this.tocCard.classList.toggle("toc-collapsed", collapsed);
    this.tocToggle.setAttribute("aria-expanded", String(!collapsed));
    this.tocToggle.textContent = collapsed ? "☰" : "−";
    this.tocToggle.setAttribute(
      "aria-label",
      collapsed ? "Expand Table of Contents" : "Collapse Table of Contents",
    );

    // Inline styles for JS-based overrides
    const list = this.tocList;
    const title = this.tocCard.querySelector("h4");

    if (collapsed) {
      this.tocCard.style.width = "56px";
      if (list) list.style.display = "none";
      if (title) title.style.display = "none";
    } else {
      this.tocCard.style.width = "";
      if (list) list.style.removeProperty("display");
      if (title) title.style.removeProperty("display");
    }

    // Persist
    try {
      const isMobile = this.mediaQuery.matches;
      const key = isMobile
        ? TableOfContentsController.STORAGE_KEYS.MOBILE
        : TableOfContentsController.STORAGE_KEYS.DESKTOP;
      localStorage.setItem(key, collapsed ? "1" : "0");
    } catch (e) {}
  }

  private setupToggle(): void {
    if (this.tocToggle) {
      this.tocToggle.addEventListener("click", () => {
        const isCollapsed =
          this.tocElement.classList.contains("toc-collapsed") ||
          this.tocCard?.classList.contains("toc-collapsed") ||
          false;
        this.setTocCollapsed(!isCollapsed);
      });
    }
  }

  /**
   * Navigation & Scroll Spy
   */
  private setupSmoothScroll(): void {
    this.tocLinks.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (!href) return;
        const target = document.querySelector(href);
        if (!target) return;

        const navHeight =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              TableOfContentsController.NAV_HEIGHT_VAR,
            ),
          ) || TableOfContentsController.DEFAULT_NAV_HEIGHT;
        const targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - navHeight - 24;

        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        history.pushState(null, "", href);
      });
    });
  }

  private setupScrollSpy(): void {
    if (!this.sections.length || !this.tocLinks.length) return;

    const entryMap = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        try {
          // update map with latest entries
          for (const e of entries) {
            const el = e.target as HTMLElement;
            if (el && el.id) entryMap.set(el.id, e);
          }

          // gather candidates from entryMap in the order of DOM sections
          const candidates = this.sections
            .map((s) => entryMap.get(s.id))
            .filter((v): v is IntersectionObserverEntry => !!v);

          // pick the best visible candidate, or nearest-to-top fallback
          const visible = candidates.filter((c) => c.isIntersecting);
          let active: IntersectionObserverEntry | null = null;
          if (visible.length > 0) {
            visible.sort(
              (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0),
            );
            active = visible[0];
          } else if (candidates.length > 0) {
            candidates.sort(
              (a, b) =>
                Math.abs(a.boundingClientRect.top) -
                Math.abs(b.boundingClientRect.top),
            );
            active = candidates[0];
          }

          // Clear only within this tocCard
          this.tocLinks.forEach((link) => {
            link.classList.remove("link-active");
            link.setAttribute("aria-current", "false");
          });

          if (active?.target && (active.target as HTMLElement).id) {
            const id = (active.target as HTMLElement).id;
            const matching = this.tocLinks.find(
              (a) => a.getAttribute("href") === "#" + id,
            );
            if (matching) {
              matching.classList.add("link-active");
              matching.setAttribute("aria-current", "true");
              // console.debug('[TOC] active:', id);
            }
          }
        } catch (err) {
          // no-op on failure
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    this.sections.forEach((s) => observer.observe(s));
  }
}
