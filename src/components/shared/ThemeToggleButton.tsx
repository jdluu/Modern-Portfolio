import { createSignal, onMount, Show, createEffect } from "solid-js";
import "./ThemeToggleButton.css";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

/**
 * ThemeToggleButton
 *
 * Toggles between Light and Dark mode using a Day/Night toggle animation.
 *
 * Visual Logic (based on CSS):
 * - Checked = Day (Light Mode)
 * - Unchecked = Night (Dark Mode)
 */
const ThemeToggleButton = () => {
  const [theme, setTheme] = createSignal<Theme | null>(null);

  const updateDocument = (t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
  };

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    // Determine initial state
    let initial: Theme;
    if (saved === "light" || saved === "dark") {
      initial = saved;
    } else {
      // Logic: Respect system preference by default
      const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initial = sysDark ? "dark" : "light";
    }

    setTheme(initial);
    updateDocument(initial);
  });

  // Effect to sync with localStorage whenever theme signal changes
  createEffect(() => {
    const t = theme();
    if (t) {
      localStorage.setItem(STORAGE_KEY, t);
    }
  });

  const toggle = (e: MouseEvent) => {
    // Checkbox checked state
    // In our new visual logic: Checked = Light, Unchecked = Dark
    const checked = (e.target as HTMLInputElement).checked;
    const next = checked ? "light" : "dark";

    // View Transition Logic
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

      // If going to Dark (next === "dark"), we want the darkness to expand.
      // If going to Light (next === "light"), we want the light to expand.
      // In both cases, the "View" we are transitioning TO is the one expanding.
      // So we animate the NEW view from 0 to radius.

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
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
        {/* 
            Note: checked={theme() === "light"} 
            because in this specific CSS implementation, "Checked" is the Day state (Light mode) 
        */}
        <input
          id="theme-toggle"
          type="checkbox"
          checked={theme() === "light"}
          /* @ts-ignore: Event type compatibility */
          onClick={toggle}
          aria-label="Toggle Theme"
        />
        <label for="theme-toggle" class="toggle">
          <span class="sr-only">Toggle theme</span>
          <span class="toggle-button">
            <span class="crater crater-1"></span>
            <span class="crater crater-2"></span>
            <span class="crater crater-3"></span>
            <span class="crater crater-4"></span>
            <span class="crater crater-5"></span>
            <span class="crater crater-6"></span>
            <span class="crater crater-7"></span>
          </span>
          <span class="star star-1"></span>
          <span class="star star-2"></span>
          <span class="star star-3"></span>
          <span class="star star-4"></span>
          <span class="star star-5"></span>
          <span class="star star-6"></span>
          <span class="star star-7"></span>
          <span class="star star-8"></span>
        </label>
      </div>
    </Show>
  );
};

export default ThemeToggleButton;
