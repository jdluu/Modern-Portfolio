import React, { useState, useEffect } from "react";

const ThemeToggleButton = () => {
	// Initialize state to null to avoid accessing window/localStorage on the server.
	const [theme, setTheme] = useState<"light" | "dark" | null>(null);

	// Effect to set the initial theme only on the client side.
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as "light" | "dark";
		const systemPrefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;
		setTheme(savedTheme || (systemPrefersDark ? "dark" : "light"));
	}, []); // Empty dependency array ensures this runs only once on mount.

	// Effect to apply the theme to the document and save to localStorage.
	useEffect(() => {
		// Only run this effect if the theme has been determined.
		if (theme) {
			document.documentElement.setAttribute("data-theme", theme);
			localStorage.setItem("theme", theme);
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	// To prevent a flash of unstyled content or a layout shift, we can return null
	// or a placeholder until the theme is determined.
	if (!theme) {
		return <div style={{ width: "50px", height: "28px" }} />; // Placeholder to prevent layout shift.
	}

	return (
		<div className="theme-switch-wrapper">
			<label className="switch" htmlFor="themeSwitch">
				<span className="visually-hidden">Toggle dark theme</span>
				<input
					id="themeSwitch"
					type="checkbox"
					role="switch"
					aria-label="Toggle dark theme"
					checked={theme === "dark"}
					onChange={toggleTheme}
				/>
				<span className="slider round">
					<>
						<svg
							className="sun-icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="5"></circle>
							<line x1="12" y1="1" x2="12" y2="3"></line>
							<line x1="12" y1="21" x2="12" y2="23"></line>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
							<line x1="1" y1="12" x2="3" y2="12"></line>
							<line x1="21" y1="12" x2="23" y2="12"></line>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
						</svg>
						<svg
							className="moon-icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
						</svg>
					</>
				</span>
			</label>
		</div>
	);
};

export default ThemeToggleButton;
