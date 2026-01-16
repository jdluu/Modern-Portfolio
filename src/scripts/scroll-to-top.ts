// Scroll-to-top button functionality
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("scroll-top")) return;

  function throttle(fn: (...args: any[]) => void, wait: number) {
    let last = 0;
    let timer: number | null = null;
    return (...args: any[]) => {
      const now = Date.now();
      if (last && now < last + wait) {
        if (timer !== null) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          last = Date.now();
          fn(...args);
          timer = null;
        }, wait);
      } else {
        last = now;
        fn(...args);
      }
    };
  }

  const scrollTopBtn = document.createElement("button");
  scrollTopBtn.id = "scroll-top";
  scrollTopBtn.className = "scroll-top";
  scrollTopBtn.type = "button";
  scrollTopBtn.setAttribute("aria-label", "Back to top");
  scrollTopBtn.setAttribute("aria-hidden", "true");
  scrollTopBtn.innerHTML = "↑";
  document.body.appendChild(scrollTopBtn);

  function updateScrollTopVisibility() {
    try {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight =
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        ) - window.innerHeight;
      const percent = docHeight > 0 ? scrollY / docHeight : 0;
      if (percent > 0.5) {
        scrollTopBtn.classList.add("visible");
        scrollTopBtn.setAttribute("aria-hidden", "false");
      } else {
        scrollTopBtn.classList.remove("visible");
        scrollTopBtn.setAttribute("aria-hidden", "true");
      }
    } catch (e) {
      // Fail silently
    }
  }

  const throttledUpdate = throttle(updateScrollTopVisibility, 150);
  window.addEventListener("scroll", throttledUpdate, { passive: true });
  window.addEventListener("resize", throttledUpdate);

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateScrollTopVisibility();
});
