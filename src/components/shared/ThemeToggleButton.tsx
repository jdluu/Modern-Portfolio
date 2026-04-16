import { createSignal, onMount, Show, createEffect } from "solid-js";
import "./ThemeToggleButton.css";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

/**
 * ThemeToggleButton component.
 *
 * Provides a highly animated Day/Night toggle for theme switching.
 * Utilizes the View Transitions API for a circular expansion effect
 * when switching between light and dark modes.
 *
 * Theme state is persisted in localStorage and applied to the
 * document root as a 'data-theme' attribute.
 */
const ThemeToggleButton = () => {
  /** Reactive signal for the current theme. Initialized as null to prevent hydration mismatch. */
  const [theme, setTheme] = createSignal<Theme | null>(null);

  /**
   * Updates the document's data-theme attribute.
   * @param t - The theme to apply ('light' or 'dark').
   */
  const updateDocument = (t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
  };

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    // Determine initial state: localStorage -> system preference -> default light
    let initial: Theme;
    if (saved === "light" || saved === "dark") {
      initial = saved;
    } else {
      const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initial = sysDark ? "dark" : "light";
    }

    setTheme(initial);
    updateDocument(initial);
  });

  // Sync theme changes to localStorage
  createEffect(() => {
    const t = theme();
    if (t) {
      localStorage.setItem(STORAGE_KEY, t);
    }
  });

  /**
   * Handles the toggle click event.
   * Implements circular View Transition animation if supported.
   * @param e - The click event.
   */
  const toggle = (e: MouseEvent) => {
    const checked = (e.target as HTMLInputElement).checked;
    const next = checked ? "light" : "dark";

    // Fallback if View Transitions API is not supported
    if (!document.startViewTransition) {
      setTheme(next);
      updateDocument(next);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      setTheme(next);
      updateDocument(next);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      // Animate the incoming view (the 'new' root) to expand from the click point
      document.documentElement.animate(
        { clipPath },
        {
          duration: 750,
          easing: "ease-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <Show
      when={theme() !== null}
      fallback={
        <div
          class="toggle-wrapper"
          style={{ "min-width": "80px", "min-height": "40px" }}
        />
      }
    >
      <div class="toggle-wrapper">
        <input
          id="theme-toggle"
          type="checkbox"
          checked={theme() === "light"}
          onClick={(e) => toggle(e)}
          aria-label="Toggle Theme"
        />
        <label for="theme-toggle" class="toggle">
          <span class="sr-only">Toggle theme</span>
          <span class="toggle-button">
            <span class="crater crater-1" />
            <span class="crater crater-2" />
            <span class="crater crater-3" />
            <span class="crater crater-4" />
            <span class="crater crater-5" />
            <span class="crater crater-6" />
            <span class="crater crater-7" />
          </span>
          <span class="star star-1" />
          <span class="star star-2" />
          <span class="star star-3" />
          <span class="star star-4" />
          <span class="star star-5" />
          <span class="star star-6" />
          <span class="star star-7" />
          <span class="star star-8" />
        </label>
      </div>
    </Show>
  );
};

export default ThemeToggleButton;
