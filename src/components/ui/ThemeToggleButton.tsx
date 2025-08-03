import { createSignal, onMount, Show } from "solid-js";

const SunIcon = (props: { class?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       class={props.class}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = (props: { class?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       class={props.class}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeToggleButton = () => {
  const [isDarkMode, setDarkMode] = createSignal<boolean | null>(null);
  let thumbRef: HTMLDivElement | undefined;

  onMount(() => {
    const saved = localStorage.getItem("darkmode");
    const initial = saved === null
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : JSON.parse(saved);
    setDarkMode(initial);
    document.documentElement.setAttribute("data-theme", initial ? "dark" : "light");
  });

  const getThumbX = (dark: boolean) => (dark ? 3.8 : 0); // rems to match CSS

  const toggle = () => {
    const anyDoc = document as any;
    const next = !isDarkMode();
    const root = document.documentElement;

    // No VT available: normal path
    if (!anyDoc.startViewTransition) {
      setDarkMode(next);
      localStorage.setItem("darkmode", JSON.stringify(next));
      root.setAttribute("data-theme", next ? "dark" : "light");
      return;
    }

    const curDark = Boolean(isDarkMode());
    const curX = getThumbX(curDark);
    const targetX = getThumbX(next);

    // 1) Tell CSS we will drive transform manually
    root.setAttribute("data-theme-vt", "driving");

    // 2) Seed the current position inline, then in the next frame, set the target
    if (thumbRef) {
      // Ensure the browser sees current style first
      thumbRef.style.transform = `translateX(${curX}rem)`;
      // Force a reflow so the starting transform is committed
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      thumbRef.offsetWidth; // reflow
      // Now set target to start the CSS transition immediately
      thumbRef.style.transform = `translateX(${targetX}rem)`;
    }

    // 3) Start VT and flip theme inside the callback (same frame)
    const vt = anyDoc.startViewTransition(() => {
      setDarkMode(next);
      localStorage.setItem("darkmode", JSON.stringify(next));
      root.setAttribute("data-theme", next ? "dark" : "light");
    });

    // 4) When VT completes, clean up and let CSS rules take over again
    vt.finished.finally(() => {
      // After the thumb finishes its own transition, remove inline transform
      const cleanup = () => {
        thumbRef?.removeEventListener("transitionend", cleanup);
        thumbRef?.style.removeProperty("transform");
        root.removeAttribute("data-theme-vt");
      };
      // If thumbRef missing or transitions disabled, just cleanup root flag
      if (thumbRef) {
        thumbRef.addEventListener("transitionend", cleanup, { once: true });
      } else {
        root.removeAttribute("data-theme-vt");
      }
    });
  };

  return (
    <Show when={isDarkMode() !== null} fallback={<div class="btn-placeholder" />}>
      <button
        type="button"
        class="btn"
        aria-pressed={isDarkMode() ? "true" : "false"}
        title={isDarkMode() ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggle}
      >
        <div class="btn__indicator" ref={el => (thumbRef = el!)}>
          <div class="btn__icon-container">
            <SunIcon class="btn__icon btn__icon--sun" />
            <MoonIcon class="btn__icon btn__icon--moon" />
          </div>
        </div>
      </button>
    </Show>
  );
};

export default ThemeToggleButton;