function initNavbar() {
  const mainMenu = document.getElementById("main-menu");
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const backdrop = document.getElementById("menu-backdrop");
  const menuCloseBtn = document.getElementById("menu-close-btn");

  // Check if all elements exist before proceeding
  if (mainMenu && menuToggleBtn && backdrop && menuCloseBtn) {
    const btn = menuToggleBtn;
    const menu = mainMenu;
    const back = backdrop;
    const closeBtn = menuCloseBtn;
    const firstFocusable = 'a, button, [tabindex]:not([tabindex="-1"])';

    // Remove existing listeners to prevent duplicates if init runs multiple times
    // (A simple way is to clone the nodes, but that kills internal state.
    // Better: check if we attached a listener or use a cleanup function if possible.
    // However, given the DOM replacement in Astro, fresh elements are likely.)

    let isAnimating = false;
    let openFallbackTimer: number | undefined;
    let closeFallbackTimer: number | undefined;

    function cleanupAfterClose() {
      menu.setAttribute("hidden", "");
      menu.setAttribute("data-open", "false");
      menu.setAttribute("inert", ""); // Ensure inert attribute is set
      menu.classList.remove("is-closing");
      back.setAttribute("hidden", "");
      document.body.style.overflow = "";
      isAnimating = false;
      window.clearTimeout(closeFallbackTimer);
    }

    function onDocumentKeydown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Esc") {
        if (btn.getAttribute("aria-expanded") === "true") {
          e.preventDefault();
          closeMenu();
        }
      }
    }

    function onMenuTransitionEnd(e: TransitionEvent) {
      if (e.target !== menu) return;
      isAnimating = false;
      window.clearTimeout(openFallbackTimer);
      menu.removeEventListener("transitionend", onMenuTransitionEnd);
    }

    function openMenu() {
      if (isAnimating) return;
      isAnimating = true;
      btn.setAttribute("aria-expanded", "true");
      menu.removeAttribute("hidden");
      menu.removeAttribute("inert"); // Explicitly remove inert attribute
      menu.setAttribute("data-open", "true");
      back.removeAttribute("hidden");
      back.classList.add("visible");
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        void menu.offsetWidth; // Trigger reflow for transition
        menu.classList.add("is-open");
        const first = menu.querySelector<HTMLElement>(firstFocusable);
        if (first) first.focus();
        document.addEventListener("keydown", onDocumentKeydown);
        menu.addEventListener("transitionend", onMenuTransitionEnd);
      });

      openFallbackTimer = window.setTimeout(() => {
        if (isAnimating) {
          isAnimating = false;
          menu.removeEventListener("transitionend", onMenuTransitionEnd);
        }
      }, 600);
    }

    function closeMenu(returnFocus = true) {
      if (isAnimating) return;
      isAnimating = true;
      btn.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.classList.add("is-closing");
      back.classList.remove("visible");

      function onEnd(e: TransitionEvent) {
        if (e.target !== menu) return;
        cleanupAfterClose();
        menu.removeEventListener("transitionend", onEnd);
      }

      menu.addEventListener("transitionend", onEnd);

      closeFallbackTimer = window.setTimeout(() => {
        if (isAnimating) {
          cleanupAfterClose();
          menu.removeEventListener("transitionend", onEnd);
        }
      }, 600);

      document.removeEventListener("keydown", onDocumentKeydown);
      if (returnFocus) btn.focus();
    }

    function toggleMenu() {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      if (isExpanded) closeMenu();
      else openMenu();
    }

    const desktopBreakpoint = 768;
    function setDesktopNavState() {
      const isDesktop = window.innerWidth >= desktopBreakpoint;
      const isMenuOpen = menu.getAttribute("data-open") === "true";

      if (isDesktop) {
        menu.removeAttribute("inert");
        if (isMenuOpen) {
          closeMenu(false);
          document.body.style.overflow = "";
          back.setAttribute("hidden", "");
        }
      } else {
        if (!isMenuOpen) {
          menu.setAttribute("inert", "");
        } else {
          menu.removeAttribute("inert");
        }
      }
    }

    // Attach all event listeners
    // Note: If using View Transitions, elements are replaced, so simple addEventListener is fine.
    btn.onclick = toggleMenu; // Use onclick property to auto-replace previous listener
    closeBtn.onclick = () => closeMenu();
    back.onclick = () => closeMenu();

    // For delegate listener on menu, we can't use onclick property easily for complex logic?
    // Actually we can.
    menu.onclick = (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      const isActivator = e.target.closest("a, button");
      if (!isActivator) return;
      // Only close when the off-canvas menu is actually open (mobile state)
      if (menu.getAttribute("data-open") === "true") {
        closeMenu();
      }
    };

    // Initial setup and resize listener
    setDesktopNavState();

    // Debounced resize listener
    let resizeTimer: number;
    window.onresize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setDesktopNavState, 100);
    };
  } else {
    // console.warn("Navigation elements not found (this is normal on pages without navbar)");
  }
}

// Support Astro View Transitions
document.addEventListener("astro:page-load", initNavbar);
// Fallback for initial load if View Transitions not active or first load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbar);
} else {
  initNavbar();
}
