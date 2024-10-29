// Theme toggle functionality
function initThemeToggle() {
	const themeSwitch = document.getElementById("themeSwitch");
	const htmlElement = document.documentElement;
	const currentTheme = localStorage.getItem("theme") || "light";

	// Set initial theme
	htmlElement.setAttribute("data-theme", currentTheme);
	themeSwitch.checked = currentTheme === "dark";

	themeSwitch.addEventListener("change", function () {
		const newTheme = this.checked ? "dark" : "light";
		htmlElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	});
}

// Navigation functionality
function initNavigation() {
	const menuButton = document.querySelector(".menu-button");
	const navMenu = document.querySelector(".nav-menu");
	const navLinks = document.querySelectorAll(".nav-link");

	if (menuButton && navMenu) {
		// Toggle menu
		menuButton.addEventListener("click", () => {
			const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
			menuButton.setAttribute("aria-expanded", (!isExpanded).toString());
			navMenu.classList.toggle("show");
		});

		// Close menu when clicking outside
		document.addEventListener("click", (event) => {
			const target = event.target;
			if (!(target.closest(".menu-button") || target.closest(".nav-menu"))) {
				menuButton.setAttribute("aria-expanded", "false");
				navMenu.classList.remove("show");
			}
		});

		// Handle escape key
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && navMenu.classList.contains("show")) {
				menuButton.setAttribute("aria-expanded", "false");
				navMenu.classList.remove("show");
				menuButton.focus();
			}
		});

		// Add keyboard navigation for menu items
		navLinks.forEach((link, index) => {
			link.addEventListener("keydown", (event) => {
				if (event.key === "ArrowRight" || event.key === "ArrowDown") {
					event.preventDefault();
					const nextIndex = (index + 1) % navLinks.length;
					navLinks[nextIndex].focus();
				} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
					event.preventDefault();
					const prevIndex = (index - 1 + navLinks.length) % navLinks.length;
					navLinks[prevIndex].focus();
				}
			});
		});
	}
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	initThemeToggle();
	initNavigation();
});
