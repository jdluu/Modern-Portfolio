/**
 * Navbar Controller
 * Handles mobile hamburger menu opening/closing with focus trapping and scroll locking.
 * Optimized for Astro View Transitions.
 */

function initNavbar() {
  const mainMenu = document.getElementById("main-menu");
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const backdrop = document.getElementById("menu-backdrop");
  const menuCloseBtn = document.getElementById("menu-close-btn");
  const panelHomeLink = mainMenu?.querySelector(
    ".panel-header .home-link",
  ) as HTMLAnchorElement | null;

  if (!mainMenu || !menuToggleBtn || !backdrop || !menuCloseBtn) return;

  const btn = menuToggleBtn;
  const menu = mainMenu;
  const back = backdrop;
  const closeBtn = menuCloseBtn;

  // Handle Resize / Initial state: Close menu and update inert for desktop
  const mql = window.matchMedia("(min-width: 768px)");
  const resetDesktopState = () => {
    if (mql.matches) {
      // Desktop: Always ensure visible and interactive
      menu.removeAttribute("inert");
      menu.removeAttribute("hidden");
      menu.setAttribute("data-open", "false");
      menu.classList.remove("is-open", "is-closing");
      back.classList.remove("visible");
      back.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    } else if (menu.getAttribute("data-open") === "false") {
      // Mobile & Closed: Ensure hidden and inert
      menu.setAttribute("inert", "");
      menu.setAttribute("hidden", "");
    }
  };

  // Perform initial reset for the current page load context
  resetDesktopState();

  // Prevent duplicate event listeners on subsequent astro:page-load events
  if (btn.dataset.navInit === "true") return;
  btn.dataset.navInit = "true";

  let isAnimating = false;

  function cleanupAfterClose() {
    menu.setAttribute("hidden", "");
    menu.setAttribute("data-open", "false");
    menu.setAttribute("inert", "");
    menu.classList.remove("is-closing", "is-open");
    back.classList.remove("visible");
    back.setAttribute("hidden", "");
    document.body.classList.remove("menu-open");
    isAnimating = false;
  }

  function onDocumentKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (btn.getAttribute("aria-expanded") === "true") {
        e.preventDefault();
        closeMenu();
      }
    }
  }

  function openMenu() {
    if (isAnimating) return;
    isAnimating = true;

    btn.setAttribute("aria-expanded", "true");
    menu.removeAttribute("hidden");
    menu.removeAttribute("inert");
    menu.setAttribute("data-open", "true");
    back.removeAttribute("hidden");

    // Trigger layout for transitions
    void menu.offsetWidth;

    menu.classList.add("is-open");
    back.classList.add("visible");
    document.body.classList.add("menu-open");

    // Wait for transition
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== menu) return;
      isAnimating = false;
      menu.removeEventListener("transitionend", onEnd);
      // Focus first link
      const firstLink = menu.querySelector("a");
      if (firstLink) firstLink.focus();
    };
    menu.addEventListener("transitionend", onEnd);

    // Fallback timer
    setTimeout(() => {
      if (isAnimating) {
        isAnimating = false;
        const firstLink = menu.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    }, 400);

    document.addEventListener("keydown", onDocumentKeydown);
  }

  function closeMenu(returnFocus = true) {
    if (isAnimating) return;
    isAnimating = true;

    btn.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    menu.classList.add("is-closing");
    back.classList.remove("visible");

    const onEnd = (e: TransitionEvent) => {
      if (e.target !== menu) return;
      cleanupAfterClose();
      menu.removeEventListener("transitionend", onEnd);
      if (returnFocus) btn.focus();
    };
    menu.addEventListener("transitionend", onEnd);

    // Fallback timer
    setTimeout(() => {
      if (isAnimating) {
        cleanupAfterClose();
        if (returnFocus) btn.focus();
      }
    }, 400);

    document.removeEventListener("keydown", onDocumentKeydown);
  }

  function toggleMenu() {
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    if (isExpanded) closeMenu();
    else openMenu();
  }

  // Event Listeners
  btn.addEventListener("click", toggleMenu);
  closeBtn.addEventListener("click", () => closeMenu());
  back.addEventListener("click", () => closeMenu());

  // Explicit handler for panel home link (mobile)
  if (panelHomeLink) {
    panelHomeLink.addEventListener("click", (e) => {
      e.preventDefault();
      const href = panelHomeLink.getAttribute("href");
      closeMenu(false);
      // Navigate after a brief delay to allow menu to close
      if (href) {
        setTimeout(() => {
          window.location.href = href;
        }, 100);
      }
    });
  }

  menu.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const link = e.target.closest("a");
    // Skip if it's the home link (handled separately)
    if (link === panelHomeLink) return;
    if (link && menu.getAttribute("data-open") === "true") {
      // Let the link navigate naturally - just close the menu
      setTimeout(() => closeMenu(false), 50);
    }
  });

  mql.addEventListener("change", resetDesktopState);
}

document.addEventListener("astro:page-load", () => {
  initNavbar();
});
