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

  if (!mainMenu || !menuToggleBtn || !backdrop || !menuCloseBtn) return;

  // Prevent duplicate initialization on the same elements
  if (menuToggleBtn.dataset.navInit === "true") return;
  menuToggleBtn.dataset.navInit = "true";

  const btn = menuToggleBtn;
  const menu = mainMenu;
  const back = backdrop;
  const closeBtn = menuCloseBtn;

  let isAnimating = false;

  function cleanupAfterClose() {
    menu.setAttribute("hidden", "");
    menu.setAttribute("data-open", "false");
    menu.setAttribute("inert", "");
    menu.classList.remove("is-closing", "is-open");
    back.classList.remove("visible");
    back.setAttribute("hidden", "");
    document.body.style.overflow = "";
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
    document.body.style.overflow = "hidden";

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

  // Close when clicking any link inside the menu
  menu.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.closest("a")) {
      closeMenu(false);
    }
  });

  // Handle Resize: Close menu if switching to desktop
  const mql = window.matchMedia("(min-width: 768px)");
  const handleResize = () => {
    if (mql.matches && menu.getAttribute("data-open") === "true") {
      closeMenu(false);
    }
    // Update inert state for desktop
    if (mql.matches) {
      menu.removeAttribute("inert");
      menu.removeAttribute("hidden");
    } else if (menu.getAttribute("data-open") === "false") {
      menu.setAttribute("inert", "");
      menu.setAttribute("hidden", "");
    }
  };

  mql.addEventListener("change", handleResize);
  handleResize(); // Initial check
}

// Initialize on page load and VT navigation
document.addEventListener("astro:page-load", initNavbar);
