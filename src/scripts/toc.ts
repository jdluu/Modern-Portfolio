/**
 * Initializes the Table of Contents controller.
 *
 * This function identifies the TOC container and sections on the page,
 * then sets up:
 * - `IntersectionObserver` to track the active section and highlight links.
 * - Smooth scroll event listeners for TOC anchor links.
 * - Responsive positioning logic and state persistence (localStorage).
 *
 * @returns {void}
 */
export function initToc(): void {
  const projectToc = (document.querySelector(".project-toc") ||
    document.querySelector(
      'aside[aria-label="Table of contents"]',
    )) as HTMLElement | null;
  if (!projectToc) return;

  // Prevent duplicate initialization (HMR/dev reload)
  if (projectToc.dataset.tocInit === "1") return;
  projectToc.dataset.tocInit = "1";
  console.debug("[TOC] init: scoped controller attached");

  const tocCard = projectToc.querySelector(".toc-card") as HTMLElement | null;
  const tocList = tocCard?.querySelector(".toc-list") as HTMLElement | null;
  const tocLinks = Array.from(
    tocList?.querySelectorAll("a") || [],
  ) as HTMLAnchorElement[];
  const tocToggle = ((tocCard && tocCard.querySelector("#toc-toggle")) ||
    document.getElementById("toc-toggle")) as HTMLElement | null;
  const sections = Array.from(
    document.querySelectorAll("section[id]"),
  ) as HTMLElement[];

  // Defensive: nothing to do without sections or links
  if (!sections.length || !tocLinks.length) {
    if (tocToggle) {
      tocToggle.addEventListener("click", () => {
        projectToc.classList.toggle("toc-collapsed");
        tocCard?.classList.toggle("toc-collapsed");
      });
    }
    return;
  }

  const entryMap = new Map<string, IntersectionObserverEntry>();

  const observer = new IntersectionObserver(
    (entries) => {
      try {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (el && el.id) entryMap.set(el.id, e);
        }

        const candidates = sections
          .map((s) => entryMap.get(s.id))
          .filter((v): v is IntersectionObserverEntry => !!v);

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

        tocLinks.forEach((link) => {
          link.classList.remove("link-active");
          link.setAttribute("aria-current", "false");
        });

        if (active?.target && (active.target as HTMLElement).id) {
          const id = (active.target as HTMLElement).id;
          const matching = tocLinks.find(
            (a) => a.getAttribute("href") === "#" + id,
          );
          if (matching) {
            matching.classList.add("link-active");
            matching.setAttribute("aria-current", "true");
          }
        }
      } catch (err) {}
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  );

  sections.forEach((s) => observer.observe(s));

  tocLinks.forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const href = anchor.getAttribute("href");
      if (!href) return;
      const target = document.querySelector(href);
      if (!target) return;
      const navHeight =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-height",
          ),
        ) || 64;
      const targetPosition =
        (target as HTMLElement).getBoundingClientRect().top +
        window.pageYOffset;
      const offsetPosition = targetPosition - navHeight - 24;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      history.pushState(null, "", href);
    });
  });

  const mql = window.matchMedia("(max-width: 980px)");
  function applyTocPosition() {
    if (!projectToc) return;
    const isMobile = mql.matches;
    projectToc.style.position = "fixed";
    if (isMobile) {
      projectToc.style.top = "";
      projectToc.style.left = "";
      projectToc.style.right = "clamp(12px, 6vw, 24px)";
      projectToc.style.bottom = `calc(env(safe-area-inset-bottom, 0px) + var(--space-6))`;
      projectToc.style.zIndex = "200";
    } else {
      projectToc.style.bottom = "";
      projectToc.style.left = "";
      projectToc.style.top = `calc(var(--nav-height) + var(--space-6))`;
      projectToc.style.right = `clamp(18px, 6vw, 56px)`;
      projectToc.style.zIndex = "120";
    }
  }

  function getTocStorageKey(isMobileMode: boolean) {
    return isMobileMode ? "toc-collapsed-mobile" : "toc-collapsed-desktop";
  }

  function setTocCollapsed(collapsed: boolean) {
    if (!projectToc || !tocCard || !tocToggle) return;
    projectToc.classList.toggle("toc-collapsed", collapsed);
    tocCard.classList.toggle("toc-collapsed", collapsed);
    tocToggle.setAttribute("aria-expanded", String(!collapsed));
    tocToggle.textContent = collapsed ? "☰" : "−";
    tocToggle.setAttribute(
      "aria-label",
      collapsed ? "Expand Table of Contents" : "Collapse Table of Contents",
    );

    const list = tocCard.querySelector(".toc-list");
    const title = tocCard.querySelector("h4");
    if (collapsed) {
      if (tocCard instanceof HTMLElement) tocCard.style.width = "56px";
      if (list instanceof HTMLElement) list.style.display = "none";
      if (title instanceof HTMLElement) title.style.display = "none";
    } else {
      if (tocCard instanceof HTMLElement) tocCard.style.width = "";
      if (list instanceof HTMLElement) list.style.removeProperty("display");
      if (title instanceof HTMLElement) title.style.removeProperty("display");
    }

    try {
      const desktopKey = "toc-collapsed-desktop";
      const mobileKey = "toc-collapsed-mobile";
      const isMobile = mql.matches;
      const savedCurrent = localStorage.getItem(
        isMobile ? mobileKey : desktopKey,
      );
      const legacy = localStorage.getItem("toc-collapsed");
      if (savedCurrent !== null) {
        localStorage.setItem(
          isMobile ? mobileKey : desktopKey,
          collapsed ? "1" : "0",
        );
      } else if (legacy !== null) {
        localStorage.setItem(
          isMobile ? mobileKey : desktopKey,
          isMobile ? (legacy === "1" ? "1" : "0") : "0",
        );
      } else {
        localStorage.setItem(
          isMobile ? mobileKey : desktopKey,
          isMobile ? "1" : "0",
        );
      }
    } catch (e) {}
  }

  applyTocPosition();
  const handleModeChange = () => {
    applyTocPosition();
    try {
      const isMobile = mql.matches;
      const key = getTocStorageKey(isMobile);
      const saved = localStorage.getItem(key);
      if (saved === null) {
        setTocCollapsed(isMobile);
      } else {
        setTocCollapsed(saved === "1");
      }
    } catch (e) {}
  };

  if (mql.addEventListener) {
    mql.addEventListener("change", handleModeChange);
  } else if ((mql as any).addListener) {
    (mql as any).addListener(handleModeChange);
  }

  try {
    const isMobile = mql.matches;
    const desktopKey = "toc-collapsed-desktop";
    const mobileKey = "toc-collapsed-mobile";
    const savedCurrent = localStorage.getItem(
      isMobile ? mobileKey : desktopKey,
    );
    const legacy = localStorage.getItem("toc-collapsed");
    if (savedCurrent !== null) {
      setTocCollapsed(savedCurrent === "1");
    } else if (legacy !== null) {
      setTocCollapsed(isMobile ? legacy === "1" : false);
      try {
        localStorage.setItem(
          isMobile ? mobileKey : desktopKey,
          isMobile ? (legacy === "1" ? "1" : "0") : "0",
        );
      } catch (e) {}
    } else {
      setTocCollapsed(isMobile);
      try {
        localStorage.setItem(
          isMobile ? mobileKey : desktopKey,
          isMobile ? "1" : "0",
        );
      } catch (e) {}
    }
  } catch (e) {}

  tocToggle?.addEventListener("click", () => {
    const isCollapsed =
      projectToc?.classList.contains("toc-collapsed") ||
      tocCard?.classList.contains("toc-collapsed");
    setTocCollapsed(!isCollapsed);
  });
}
