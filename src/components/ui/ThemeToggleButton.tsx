import { createSignal, createEffect, onMount, Show } from "solid-js";

const SunIcon = (props: { class?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class}
  >
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeToggleButton = () => {
  const [isDarkMode, setDarkMode] = createSignal<boolean | null>(null);
  const [isAnimated, setAnimated] = createSignal(false);

  onMount(() => {
    const darkModeSaved = localStorage.getItem("darkmode");
    if (darkModeSaved === null) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
      localStorage.setItem("darkmode", JSON.stringify(prefersDark));
    } else {
      setDarkMode(JSON.parse(darkModeSaved));
    }
  });

  createEffect(() => {
    const mode = isDarkMode();
    if (mode === null) return;

    if (mode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  });

  const handleToggle = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(document as any).startViewTransition) {
      const newMode = !isDarkMode();
      setDarkMode(newMode);
      localStorage.setItem("darkmode", JSON.stringify(newMode));
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).startViewTransition(() => {
      const newMode = !isDarkMode();
      setDarkMode(newMode);
      localStorage.setItem("darkmode", JSON.stringify(newMode));
    });
  };

  return (
    <Show
      when={isDarkMode() !== null}
      fallback={<div class="btn-placeholder" />}
    >
      <div
        class="btn"
        onClick={handleToggle}
      >
        <div class="btn__indicator">
          <div class="btn__icon-container">
            <Show
              when={isDarkMode()}
              fallback={
                <SunIcon class={`btn__icon btn__icon--sun ${isAnimated() ? "is-animated" : ""}`} />
              }
            >
              <MoonIcon class={`btn__icon btn__icon--moon ${isAnimated() ? "is-animated" : ""}`} />
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ThemeToggleButton;
