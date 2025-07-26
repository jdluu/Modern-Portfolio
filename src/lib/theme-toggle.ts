/// <reference types="astro/client" />

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	
	return function (...args: Parameters<T>) {
		if (timeout !== null) {
			clearTimeout(timeout);
		}
		
		timeout = setTimeout(() => {
			func(...args);
			timeout = null;
		}, wait);
	};
}

// Debounced localStorage setter to reduce blocking operations
const debouncedSetStorage = debounce((isDark: boolean) => {
	localStorage.setItem("darkmode", JSON.stringify(isDark));
}, 100);

/**
 * Toggles the theme between 'light' and 'dark' and uses the View Transitions API if available.
 * Optimized with debouncing to reduce DOM thrashing and localStorage blocking.
 */
export const toggleTheme = (): void => {
	const toggle = () => {
		// Batch DOM operations together
		const isDark = document.documentElement.classList.toggle("dark");
		document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
		
		// Debounce localStorage write to avoid blocking
		debouncedSetStorage(isDark);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!(document as any).startViewTransition) {
		toggle();
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(document as any).startViewTransition(toggle);
};

// Throttled version of toggleTheme for rapid clicks
let isThrottled = false;
export const throttledToggleTheme = (): void => {
	if (isThrottled) return;
	
	isThrottled = true;
	toggleTheme();
	
	setTimeout(() => {
		isThrottled = false;
	}, 300); // 300ms throttle to prevent rapid toggling
};