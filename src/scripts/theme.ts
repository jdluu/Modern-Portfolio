// src/scripts/theme.ts

type Theme = "light" | "dark";

interface ThemeManager {
	currentTheme: Theme;
	toggle(): void;
	setTheme(theme: Theme): void;
}

class ThemeController implements ThemeManager {
	private readonly htmlElement: HTMLElement;
	private readonly themeSwitch: HTMLInputElement | null;
	private readonly mediaQuery: MediaQueryList;
	private isTransitioning: boolean = false;

	constructor() {
		this.htmlElement = document.documentElement;
		this.themeSwitch = document.getElementById(
			"themeSwitch"
		) as HTMLInputElement;
		this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		this.initialize();
	}

	get currentTheme(): Theme {
		return (this.htmlElement.getAttribute("data-theme") as Theme) || "light";
	}

	private initialize(): void {
		const savedTheme = localStorage.getItem("theme") as Theme;
		const systemTheme: Theme = this.mediaQuery.matches ? "dark" : "light";
		this.setTheme(savedTheme || systemTheme);

		if (this.themeSwitch) {
			this.themeSwitch.checked = this.currentTheme === "dark";
			this.themeSwitch.addEventListener("change", this.toggle.bind(this));
		}

		this.mediaQuery.addEventListener("change", (e: MediaQueryListEvent) => {
			if (!localStorage.getItem("theme")) {
				const newTheme: Theme = e.matches ? "dark" : "light";
				this.setTheme(newTheme);
			}
		});

		setTimeout(() => {
			document.body.classList.remove("no-transitions");
		}, 50);
	}

	public toggle(): void {
		if (this.isTransitioning) return;

		const newTheme: Theme = this.currentTheme === "light" ? "dark" : "light";
		this.setTheme(newTheme);
	}

	public setTheme(theme: Theme): void {
		if (this.isTransitioning) return;
		this.isTransitioning = true;

		document.body.classList.add("theme-transitioning");

		this.htmlElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);

		if (this.themeSwitch) {
			this.themeSwitch.checked = theme === "dark";
		}

		setTimeout(() => {
			document.body.classList.remove("theme-transitioning");
			this.isTransitioning = false;
		}, 200);
	}
}
if (typeof window !== "undefined") {
	new ThemeController();
}
