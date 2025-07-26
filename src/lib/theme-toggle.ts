/// <reference types="astro/client" />

/**
 * Toggles the theme between 'light' and 'dark' and uses the View Transitions API if available.
 */
export const toggleTheme = (): void => {
	const toggle = () => {
		const isDark = document.documentElement.classList.toggle("dark");
		document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
		localStorage.setItem("darkmode", JSON.stringify(isDark));
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!(document as any).startViewTransition) {
		toggle();
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(document as any).startViewTransition(toggle);
};